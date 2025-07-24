const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');
const { convertDatesToStrings } = require('../utils/formatters');
const { deleteFile } = require('../utils/fileUploader');
const AppError = require('../utils/AppError');

const prisma = new PrismaClient();

// module.exports.create = async ({
//   subtitleText,
//   languageCode,
//   createdBy,
//   modifiedBy,
//   statusId = statusCodes.ACTIVE,
// }) => {
//   try {
//     return await prisma.subtitle.create({
//       data: {
//         subtitleText,
//         languageCode,
//         createdBy,
//         modifiedBy,
//         statusId,
//       },
//     });
//   } catch (error) {
//     if (error.code === 'P2002') {
//       throw new AppError('Subtitle with unique constraint already exists.', 409);
//     }
//     throw error;
//   }
// };

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
    let where = { ...filter };

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
      select: {
        subtitleId: true,
        subtitleText: true,
        languageCode: true,
        createdBy: true,
        createdAt: true,
        modifiedAt: true,
        statusId: true,
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    return {
      subtitles: subtitlesRaw.map((subtitle) =>
        convertDatesToStrings(subtitle),
      ),
      subtitleCount,
    };
  } catch (error) {
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
