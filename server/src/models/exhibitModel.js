const statusCodes = require('../configs/statusCodes');
const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { encryptData, decryptData } = require('../utils/encryption');
const { convertDatesToStrings } = require('../utils/formatters');

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
  audioId,
  imageId,
  statusId,
  createdBy,
}) => {
  try {
    const updated = await prisma.exhibit.update({
      where: { exhibitId: Number(exhibitId) },
      data: {
        title,
        description,
        audioId,
        imageId,
        statusId,
        createdBy,
      },
    });
    return updated;
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
        exhibitId: parseInt(exhibitId),
      },
      data: {
        statusId: statusCode,
      },
    });

    if (!updatedExhibit) {
      logger.warn(`Exhibit with ID ${exhibitId} not found for soft delete.`);
      return null;
    }

    logger.info(
      `Exhibit with ID ${exhibitId} soft deleted (status set to ${statusCode}).`,
    );
    return { id: exhibitId, status: statusCode };
  } catch (error) {
    logger.error(`Error soft deleting exhibit with ID ${exhibitId}:`, error);
    throw new AppError('Failed to delete exhibit', 500);
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
  let where = { ...filter };

  // Conditional search terms
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

// Get Exhibits By Exhibit ID
module.exports.getExhibitById = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: {
        exhibitId,
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
      ...exhibit,
      statusId: undefined,
      exhibitCreatedBy: undefined,
      supportedLanguages: exhibit.subtitles.map((s) => s.subtitle.languageCode),
      subtitles: exhibit.subtitles.map((s) => ({ ...s.subtitle })),
      status: exhibit.status.statusName,
      createdBy: exhibit.exhibitCreatedBy.username,
      imageLink: exhibit.image.fileLink,
    });
  } catch (error) {
    console.error('Error fetching exhibit:', error);
    throw new AppError('Failed to fetch exhibit', 500);
  }
};
