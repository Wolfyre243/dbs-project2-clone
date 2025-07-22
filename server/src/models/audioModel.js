const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

const { logAdminAudit } = require('../utils/auditlogs');

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

// TODO: Shift to auditLog utility
// Create an audit log entry
module.exports.createAuditLog = async ({
  userId,
  ipAddress,
  entityName,
  entityId,
  actionTypeId,
  logText,
}) => {
  return await prisma.auditLog.create({
    data: {
      userId,
      ipAddress,
      entityName,
      entityId,
      actionTypeId,
      logText,
    },
  });
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

// Create audio and subtitle records for text-to-speech
module.exports.createTextToAudio = async ({
  text,
  fileLink,
  languageCode,
  createdBy,
  ipAddress,
  description = 'Text-to-speech generated audio',
  statusId = statusCodes.ACTIVE,
}) => {
  // TODO: Convert to transaction
  // Create audio record
  const audio = await prisma.audio.create({
    data: {
      description,
      fileLink,
      createdBy,
      languageCode,
      statusId,
    },
  });

  // Create subtitle record with the input text
  const subtitle = await prisma.subtitle.create({
    data: {
      subtitleText: text,
      languageCode,
      createdBy,
      modifiedBy: createdBy,
      statusId,
    },
  });

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      userId: createdBy,
      ipAddress,
      entityName: 'audio',
      entityId: audio.audioId,
      actionTypeId: AuditActions.CREATE,
      logText: `Generated audio from text in ${languageCode}, at ${fileLink}`,
    },
  });

  return { audio, subtitle };
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
