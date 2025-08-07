const statusCodes = require('../configs/statusCodes');
const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { encryptData, decryptData } = require('../utils/encryption');
const { convertDatesToStrings } = require('../utils/formatters');
const {
  generateWordTimings,
  generateWordTimingsBatch,
} = require('../utils/echogardenHelper');
const EventTypes = require('../configs/eventTypes');

// TODO: Add back imageId
module.exports.createExhibit = async ({
  title,
  description,
  createdBy,
  modifiedBy,
  // imageId,
  statusId = statusCodes.ACTIVE,
}) => {
  return await prisma.exhibit.create({
    data: {
      title,
      description,
      createdBy,
      modifiedBy,
      // imageId,
      statusId,
    },
  });
};

module.exports.createExhibitWithAssets = async ({
  title,
  description,
  createdBy,
  modifiedBy,
  subtitleIdArr,
  imageId,
  statusId = statusCodes.ACTIVE,
}) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const exhibit = await tx.exhibit.create({
        data: {
          title,
          description,
          createdBy,
          modifiedBy,
          imageId,
          statusId,
        },
      });

      // Link all subtitles to exhibit
      await tx.exhibitSubtitle.createMany({
        data: subtitleIdArr.map((subtitleId) => {
          return { exhibitId: exhibit.exhibitId, subtitleId };
        }),
      });

      return exhibit;
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.createExhibitSubtitle = async ({ exhibitId, subtitleId }) => {
  return await prisma.exhibitSubtitle.create({
    data: {
      exhibitId,
      subtitleId,
    },
  });
};

module.exports.createExhibitAudio = async ({ exhibitId, audioId }) => {
  return await prisma.exhibitAudioRelation.create({
    data: {
      exhibitId,
      audioId,
    },
  });
};

module.exports.createAuditLog = async ({
  userId,
  ipAddress,
  entityName,
  entityId,
  actionType,
  logText,
}) => {
  return await prisma.auditLog.create({
    data: {
      userId,
      ipAddress,
      entityName,
      entityId,
      actionTypeId: (
        await prisma.auditAction.findFirst({ where: { actionType } })
      ).actionTypeId,
      logText,
      timestamp: new Date(),
    },
  });
};

// Update exhibit
module.exports.updateExhibit = async ({
  exhibitId,
  title,
  description,
  imageId,
  createdBy,
}) => {
  try {
    const updated = await prisma.exhibit.update({
      where: { exhibitId: exhibitId },
      data: {
        title,
        description,
        imageId,
        createdBy,
        modifiedAt: new Date(),
      },
      include: {
        subtitles: {
          select: {
            subtitle: {
              include: {
                audio: true,
              },
            },
          },
        },
        image: {
          select: {
            fileLink: true,
          },
        },
        status: true,
        exhibitCreatedBy: true,
      },
    });
    return convertDatesToStrings({
      ...updated,
      statusId: undefined,
      exhibitCreatedBy: undefined,
      supportedLanguages: updated.subtitles.map((s) => s.languageCode),
      // supportedLanguages: enrichedSubtitles.map((s) => s.languageCode),
      // subtitles: enrichedSubtitles,
      subtitles: updated.subtitles.map((s) => ({ ...s.subtitle })),
      status: updated.status.statusId,
      createdBy: updated.exhibitCreatedBy.username,
      imageLink: updated.image.fileLink,
    });
  } catch (error) {
    console.error('Error updating exhibit:', error);
    throw new AppError('Failed to update exhibit', 500);
  }
};

// Soft delete
module.exports.softDeleteExhibit = async (exhibitId, statusCode) => {
  try {
    const updatedExhibit = await prisma.exhibit.update({
      where: {
        exhibitId: exhibitId, // Keep as string (UUID)
      },
      data: {
        statusId: statusCode,
      },
    });

    if (!updatedExhibit) {
      throw new AppError(
        `Exhibit with ID ${exhibitId} not found for soft delete.`,
        404,
      );
    }

    return { id: exhibitId, status: statusCode };
  } catch (error) {
    throw new AppError('Failed to delete exhibit', 500);
  }
};

// Bulk soft delete
module.exports.bulkSoftDeleteExhibits = async (exhibitIds) => {
  try {
    const result = await prisma.exhibit.updateMany({
      where: {
        exhibitId: { in: exhibitIds },
      },
      data: {
        statusId: statusCodes.DELETED,
      },
    });
    return { count: result.count, ids: exhibitIds };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get all exhibits with pagination, sorting, and search
module.exports.getAllExhibits = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
  filter = {},
}) => {
  const allowedStatuses = [statusCodes.ACTIVE, statusCodes.ARCHIVED];
  // If filter.statusId is set, use it; otherwise default to ACTIVE
  let where = { ...filter };
  if (!filter.statusId || !allowedStatuses.includes(filter.statusId)) {
    where.statusId = { in: allowedStatuses };
  }

  if (search && search.trim() !== '') {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const exhibitCount = await prisma.exhibit.count({ where });

  const exhibitsRaw = await prisma.exhibit.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
    select: {
      exhibitId: true,
      title: true,
      description: true,
      createdAt: true,
      image: true,
      status: true,
      exhibitCreatedBy: true,
      subtitles: {
        select: {
          subtitle: true,
        },
      },
    },
    orderBy: {
      [sortBy]: order,
    },
  });

  return {
    exhibits: exhibitsRaw
      .map((exhibit) => {
        let supportedLangArr = null;
        if (exhibit.subtitles && exhibit.subtitles.length > 0) {
          supportedLangArr = exhibit.subtitles.map(
            (s) => s.subtitle.languageCode,
          );
        }

        return {
          ...exhibit,
          subtitles: undefined,
          supportedLanguages: supportedLangArr,
          status: exhibit.status.statusName,
          exhibitCreatedBy: exhibit.exhibitCreatedBy.username,
        };
      })
      .map((exhibit) => convertDatesToStrings(exhibit)),
    exhibitCount,
  };
};

module.exports.getExhibitMetadataById = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId, statusId: statusCodes.ACTIVE },
      include: {
        subtitles: {
          select: {
            subtitle: {
              select: {
                languageCode: true,
              },
            },
          },
        },
        image: {
          select: {
            fileLink: true,
          },
        },
        status: true,
        exhibitCreatedBy: true,
      },
    });

    if (!exhibit) {
      throw new AppError('Exhibit not found', 404);
    }

    return convertDatesToStrings({
      ...exhibit,
      statusId: undefined,
      exhibitCreatedBy: undefined,
      subtitles: undefined,
      status: exhibit.status.statusName,
      createdBy: exhibit.exhibitCreatedBy.username,
      imageLink: exhibit.image.fileLink,
      supportedLanguages: exhibit.subtitles.map((s) => s.subtitle.languageCode),
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Exhibit not found', 404);
    }
    throw error;
  }
};

// Get Exhibits By Exhibit ID
module.exports.getExhibitById = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId },
      include: {
        subtitles: {
          select: {
            subtitle: {
              include: {
                audio: true,
              },
            },
          },
        },
        image: {
          select: {
            fileLink: true,
          },
        },
        status: true,
        exhibitCreatedBy: true,
      },
    });

    const qrCode = await prisma.qrCode.findFirst({
      where: { exhibitId },
      select: {
        qrCodeId: true,
        image: {
          select: {
            fileLink: true,
          },
        },
        url: true,
      },
    });

    if (!exhibit) {
      throw new AppError('Exhibit not found', 404);
    }

    // console.log('Exhibit subtitles:', exhibit.subtitles); // Debug log

    return convertDatesToStrings({
      ...exhibit,
      statusId: undefined,
      exhibitCreatedBy: undefined,
      subtitles: exhibit.subtitles.map((s) => ({ ...s.subtitle })),
      supportedLanguages: exhibit.subtitles.map((s) => s.subtitle.languageCode),
      // supportedLanguages: enrichedSubtitles.map((s) => s.languageCode),
      // subtitles: enrichedSubtitles,
      status: exhibit.status.statusName,
      createdBy: exhibit.exhibitCreatedBy.username,
      imageLink: exhibit.image.fileLink,
      qrCode: { ...qrCode },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Exhibit not found', 404);
    }
    throw error;
  }
};

// Add favorite
module.exports.addFavoriteExhibit = async (userId, exhibitId) => {
  try {
    const exists = await prisma.favoriteExhibit.findUnique({
      where: { userId_exhibitId: { userId, exhibitId } },
    });
    if (exists) throw new AppError('Already favorited this exhibit', 400);

    return await prisma.favoriteExhibit.create({
      data: { userId, exhibitId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Exhibit not found.', 404);
    }
    throw error;
  }
};

// Remove favorite
module.exports.removeFavoriteExhibit = async (userId, exhibitId) => {
  try {
    return await prisma.favoriteExhibit.delete({
      where: { userId_exhibitId: { userId, exhibitId } },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('You have not favorited this exhibit.', 404);
    }
    throw error;
  }
};

// Get all favorites for user
module.exports.getFavoriteExhibits = async (userId) => {
  try {
    const favorites = await prisma.favoriteExhibit.findMany({
      where: { userId },
      include: {
        exhibit: {
          select: {
            exhibitId: true,
            title: true,
            description: true,
            image: {
              select: {
                fileLink: true,
              },
            },
          },
        },
      },
    });
    return favorites.map((e) => ({
      ...e.exhibit,
      imageUrl: e.exhibit.image.fileLink,
    }));
  } catch (error) {
    throw error;
  }
};

module.exports.checkExhibitFavourited = async (userId, exhibitId) => {
  try {
    const favorite = await prisma.favoriteExhibit.findUnique({
      where: { userId_exhibitId: { userId, exhibitId } },
    });

    return favorite;
  } catch (error) {
    throw error;
  }
};

// Count how many unique exhibits the user has discovered
module.exports.getExhibitsDiscoveredCount = async (userId) => {
  try {
    // Adjust eventTypeId if needed (e.g., QR_SCANNED or VISITED)
    const discovered = await prisma.event.findMany({
      where: {
        userId,
        entityName: 'exhibit',
        eventTypeId: EventTypes.QR_SCANNED, // Uncomment if you want to filter by event type
      },
      select: { entityId: true },
      distinct: ['entityId'],
    });

    const totalCount = await prisma.exhibit.count({
      where: { statusId: statusCodes.ACTIVE },
    });

    return { totalCount, discoveredCount: discovered.length };
  } catch (error) {
    throw error;
  }
};

// Archive exhibit (set status to ARCHIVED only if not already archived)
module.exports.archiveExhibit = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId },
      select: { statusId: true },
    });

    if (!exhibit) {
      throw new AppError(
        `Exhibit with ID ${exhibitId} not found for archive.`,
        404,
      );
    }

    if (exhibit.statusId === statusCodes.ARCHIVED) {
      throw new AppError('Exhibit is already archived.', 400);
    }

    const updatedExhibit = await prisma.exhibit.update({
      where: { exhibitId },
      data: { statusId: statusCodes.ARCHIVED, modifiedAt: new Date() },
    });

    return { id: exhibitId, status: statusCodes.ARCHIVED };
  } catch (error) {
    throw error;
  }
};

// Unarchive exhibit (set status to ACTIVE only if currently ARCHIVED)
module.exports.unarchiveExhibit = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId },
      select: { statusId: true },
    });

    if (!exhibit) {
      throw new AppError(
        `Exhibit with ID ${exhibitId} not found for unarchive.`,
        404,
      );
    }

    if (exhibit.statusId !== statusCodes.ARCHIVED) {
      throw new AppError(
        'Exhibit is not archived and cannot be unarchived.',
        400,
      );
    }

    const updatedExhibit = await prisma.exhibit.update({
      where: { exhibitId },
      data: { statusId: statusCodes.ACTIVE, modifiedAt: new Date() },
    });

    return { id: exhibitId, status: statusCodes.ACTIVE };
  } catch (error) {
    throw error;
  }
};

// Get all archived exhibits
/* module.exports.getArchivedExhibits = async () => {
  try {
    const exhibits = await prisma.exhibit.findMany({
      where: { statusId: statusCodes.ARCHIVED },
      select: {
        exhibitId: true,
        title: true,
        description: true,
        imageId: true,
        createdBy: true,
        modifiedAt: true,
      },
    });
    return exhibits;
  } catch (error) {
    throw new AppError('Failed to fetch archived exhibits', 500);
  }
}; */
