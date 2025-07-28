const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');
const { convertDatesToStrings } = require('../utils/formatters');
const { deleteFile } = require('../utils/fileUploader');
const AppError = require('../utils/AppError');
const {
  generateWordTimings,
  generateWordTimingsBatch,
} = require('../utils/echogardenHelper');

const prisma = new PrismaClient();

module.exports.create = async ({
  subtitleText,
  languageCode,
  audioId,
  exhibitId,
  createdBy,
  modifiedBy,
  statusId = statusCodes.ACTIVE,
  wordTimings = [],
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Create the subtitle
      const subtitle = await tx.subtitle.create({
        data: {
          subtitleText,
          languageCode,
          audioId,
          createdBy,
          modifiedBy,
          statusId,
          wordTimings,
        },
        include: {
          audio: true,
        },
      });

      // Link subtitle to exhibit
      if (exhibitId) {
        await tx.exhibitSubtitle.create({
          data: {
            exhibitId,
            subtitleId: subtitle.subtitleId,
          },
        });
      }

      return convertDatesToStrings(subtitle);
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('audioId')) {
        throw new AppError(
          `Subtitle with audioId ${audioId} already exists.`,
          409,
        );
      }
      throw new AppError('Subtitle with these details already exists.', 409);
    }
    throw error;
  }
};

// Archive subtitle by setting status to ARCHIVED

module.exports.archiveSubtitle = async (subtitleId, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subtitle = await tx.subtitle.update({
        where: { subtitleId },
        data: {
          statusId: statusCodes.ARCHIVED,
          modifiedBy: userId,
        },
      });

      if (subtitle.audioId) {
        await tx.audio.update({
          where: { audioId: subtitle.audioId },
          data: { statusId: statusCodes.ARCHIVED },
        });
      }

      return subtitle;
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Subtitle not found', 404);
    }
    throw error;
  }
};

// Unarchive subtitle by setting status to ACTIVE
module.exports.unarchiveSubtitle = async (subtitleId, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subtitle = await tx.subtitle.update({
        where: { subtitleId },
        data: {
          statusId: statusCodes.ACTIVE,
          modifiedBy: userId,
        },
      });

      if (subtitle.audioId) {
        await tx.audio.update({
          where: { audioId: subtitle.audioId },
          data: { statusId: statusCodes.ACTIVE },
        });
      }

      return subtitle;
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Subtitle not found', 404);
    }
    throw error;
  }
};

// Soft delete subtitle by setting status to DELETED
module.exports.softDeleteSubtitle = async (subtitleId, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subtitle = await tx.subtitle.update({
        where: { subtitleId },
        data: {
          statusId: statusCodes.DELETED,
          modifiedBy: userId,
        },
      });

      if (subtitle.audioId) {
        await tx.audio.update({
          where: { audioId: subtitle.audioId },
          data: { statusId: statusCodes.DELETED },
        });
      }

      return subtitle;
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Subtitle not found', 404);
    }
    throw error;
  }
};

// Hard delete subtitle
module.exports.hardDeleteSubtitle = async (subtitleId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Find the subtitle first to get audioId
      // const subtitle = await tx.subtitle.findUnique({
      //   where: { subtitleId },
      //   select: { audioId: true },
      // });

      // if (!subtitle) {
      //   throw new AppError('Subtitle not found', 404);
      // }

      // Delete the subtitle
      const subtitle = await tx.subtitle.delete({
        where: { subtitleId },
      });

      // If linked audio exists, delete it as well
      if (subtitle.audioId) {
        const { fileName } = await tx.audio.delete({
          where: { audioId: subtitle.audioId },
        });
        // Delete from supabase
        await deleteFile('audio', fileName);
      }

      return { subtitle };
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Subtitle or linked audio not found', 404);
    }
    throw error;
  }
};

//get all subtitles forr admin
module.exports.getAllSubtitles = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
  filter = {},
}) => {
  try {
    let where = { ...filter, statusId: statusCodes.ACTIVE };

    // Conditional search terms
    if (search && search.trim() !== '') {
      where.OR = [
        { subtitleText: { contains: search } },
        { languageCode: { contains: search } },
      ];
    }

    const subtitleCount = await prisma.subtitle.count({
      where: where,
    });

    const subtitlesRaw = await prisma.subtitle.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: where,
      // select: {
      //   subtitleId: true,
      //   subtitleText: true,
      //   languageCode: true,
      //   createdBy: true,
      //   createdAt: true,
      //   modifiedAt: true,
      //   statusId: true,
      // },
      include: {
        subtitleCreatedBy: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    return {
      subtitles: subtitlesRaw.map((subtitle) =>
        convertDatesToStrings({
          ...subtitle,
          createdBy: subtitle.subtitleCreatedBy.username,
        }),
      ),
      subtitleCount,
    };
  } catch (error) {
    throw error;
  }
};
// Update subtitle
module.exports.updateSubtitle = async (subtitleId, updateData) => {
  try {
    const updatedSubtitle = await prisma.subtitle.update({
      where: { subtitleId },
      data: {
        ...updateData,
        modifiedAt: new Date(),
      },
      include: {
        audio: true,
      },
    });

    return convertDatesToStrings(updatedSubtitle);
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Subtitle not found', 404);
    }
    if (error.code === 'P2002') {
      throw new AppError('Subtitle with this audioId already exists', 409);
    }
    throw error;
  }
};

// Get subtitle by ID
module.exports.getSubtitleById = async (subtitleId) => {
  try {
    const subtitle = await prisma.subtitle.findUnique({
      where: { subtitleId },
      select: {
        subtitleId: true,
        subtitleText: true,
        languageCode: true,
        createdBy: true,
        createdAt: true,
        modifiedAt: true,
        statusId: true,
        audio: true,
      },
    });
    if (!subtitle) {
      throw new AppError('Subtitle not found', 404);
    }
    return convertDatesToStrings(subtitle);
  } catch (error) {
    throw error;
  }
};

module.exports.getAllSubtitlesByExhibitId = async (exhibitId) => {
  try {
    const subtitles = await prisma.exhibitSubtitle.findMany({
      where: { exhibitId },
      include: {
        subtitle: {
          select: {
            subtitleId: true,
            subtitleText: true,
            languageCode: true,
            createdBy: true,
            createdAt: true,
            modifiedAt: true,
            statusId: true,
            audio: true,
            wordTimings: true,
          },
        },
      },
    });

    // Remove duplicates and normalize subtitleText
    const cleanedSubtitles = [];
    const seenSubtitleIds = new Set();
    const seenTexts = new Set();

    for (const s of subtitles) {
      const subtitle = s.subtitle;
      const cleanedText = subtitle.subtitleText.replace(/\s+/g, ' ').trim();

      if (
        !seenSubtitleIds.has(subtitle.subtitleId) &&
        !seenTexts.has(cleanedText)
      ) {
        cleanedSubtitles.push({
          ...subtitle,
          subtitleText: cleanedText,
        });
        seenSubtitleIds.add(subtitle.subtitleId);
        seenTexts.add(cleanedText);
      } else {
        console.warn(
          `Skipping duplicate subtitle: ${subtitle.subtitleId}, text: ${cleanedText}`,
        );
      }
    }

    return cleanedSubtitles.map((s) => convertDatesToStrings(s));
  } catch (error) {
    throw error;
  }
};
