const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Create a new audio record
module.exports.createAudio = async ({
  description,
  fileLink,
  createdBy,
  languageCode,
  statusId = statusCodes.ACTIVE,
}) => {
  const audio = await prisma.audio.create({
    data: {
      description,
      fileLink,
      createdBy,
      languageCode,
      statusId,
    },
  });

  return audio;
};

// Create subtitle record with UUID-based subtitleId
module.exports.createSubtitle = async ({
  subtitleText,
  languageCode,
  createdBy,
  modifiedBy,
  statusId = statusCodes.ACTIVE,
}) => {
  return await prisma.subtitle.create({
    data: {
      subtitleText,
      languageCode,
      createdBy,
      modifiedBy,
      statusId,
    },
  });
};

// Get subtitles for a user
module.exports.getAllSubtitles = async ({ userId, isAdmin }) => {
  return await prisma.subtitle.findMany({
    where: isAdmin ? {} : { createdBy: userId }, // Admins see all subtitles
    select: {
      subtitleId: true,
      subtitleText: true,
      languageCode: true,
      createdBy: true,
      createdAt: true,
      modifiedAt: true,
      statusId: true,
      /*  audio: {
        select: {
          audioId: true,
          description: true,
          fileName: true,
        },
      }, */
    },
  });
};
