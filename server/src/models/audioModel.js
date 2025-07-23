const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Create a new audio record
module.exports.createAudio = async ({
  description,
  fileLink,
  fileName,
  createdBy,
  languageCode,
  statusId = statusCodes.ACTIVE,
}) => {
  const audio = await prisma.audio.create({
    data: {
      description,
      fileLink,
      fileName,
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

module.exports.getAudioById = async function (audioId) {
  return await prisma.audio.findUnique({
    where: { audioId },
  });
};

//archive audio by setting status to archived
module.exports.archiveAudio = async function (audioId) {
  return await prisma.audio.update({
    where: { audioId },
    data: { statusId: statusCodes.ARCHIVED },
  });
};

//Hard delete audio
module.exports.hardDeleteAudio = async function (audioId) {
  return await prisma.audio.delete({
    where: { audioId },
  });
};

//unarchive audio by setting status to active
module.exports.unarchiveAudio = async function (audioId) {
  return await prisma.audio.update({
    where: { audioId },
    data: { statusId: statusCodes.ACTIVE },
  });
};

// soft delete audio by setting status to deleted
module.exports.softDeleteAudio = async function (audioId, userId, ipAddress) {
  return await prisma.audio.update({
    where: { audioId },
    data: { statusId: statusCodes.DELETED },
  });
};