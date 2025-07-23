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
  audioIdArr,
  // imageId,
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
          // imageId,
          statusId,
        },
      });

      // Link all subtitles to exhibit
      await tx.exhibitSubtitle.createMany({
        data: subtitleIdArr.map((subtitleId) => {
          return { exhibitId: exhibit.exhibitId, subtitleId };
        }),
      });

      // Link all audio files to exhibit
      await tx.exhibitAudioRelation.createMany({
        data: audioIdArr.map((audioId) => {
          return { exhibitId: exhibit.exhibitId, audioId };
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

// Get Exhibits By Exhibit ID
module.exports.getExhibitById = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId: parseInt(exhibitId) },
    });
    return exhibit;
  } catch (error) {
    console.error('Error fetching exhibit:', error);
    throw new AppError('Failed to fetch exhibit', 500);
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

module.exports.getAllTeams = async () => {
  try {
    const exhibit = await prisma.exhibit.findMany({
      select: {
        exhibitId: true,
        title: true,
        description: true,
        createdAt: true,
      },
      include: {
        audio: true,
        exhibitCreatedBy: true,
        image: true,
        status: true,
      },
    });
    return teams;
  } catch (e) {
    console.error(e);
    throw new AppError('Error fetching all teams', 500);
  }
};
