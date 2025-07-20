const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Create a new audio record
module.exports.createAudio = async ({
  description,
  fileName,
  createdBy,
  languageId,
  statusId,
}) => {
  return await prisma.audio.create({
    data: {
      audioId: crypto.randomUUID(),
       description,
      fileName,
      createdBy,
      languageId,
      statusId,
      createdAt: new Date(),
    },
  });
};

// Create an audit log entry
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
      auditLogId: crypto.randomUUID(),
      userId,
      ipAddress,
      entityName,
      entityId,
      actionType,
      logText,
      timestamp: new Date(),
    },
  });
};

// Create subtitle record with UUID-based subtitleId
module.exports.createSubtitle = async ({
  subtitleText,
  languageCode,
  createdBy,
  modifiedBy,
  statusId,
}) => {
  return await prisma.subtitle.create({
    data: {
      subtitleId: crypto.randomUUID(), // ✅ UUID instead of custom string
      subtitleText,
      languageCode,
      createdBy,
      modifiedBy,
      createdAt: new Date(),
      modifiedAt: new Date(),
      statusId,
    },
  });
};

// Create audio and subtitle records for text-to-speech
module.exports.createTextToAudio = async ({
  text,
  fileName,
  languageCode,
  createdBy,
  ipAddress,
  description = 'Text-to-speech generated audio',
  statusId = 1,
}) => {
  // Create audio record
  const audio = await prisma.audio.create({
    data: {
      audioId: crypto.randomUUID(),
      description,
      fileName,
      createdBy,
      languageId: languageCode,
      statusId,
      createdAt: new Date(),
    },
  });

  // Create subtitle record with the input text
  const subtitle = await prisma.subtitle.create({
    data: {
      subtitleId: crypto.randomUUID(),
      subtitleText: text,
      languageCode,
      createdBy,
      modifiedBy: createdBy,
      createdAt: new Date(),
      modifiedAt: new Date(),
      statusId,
    },
  });

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      auditLogId: crypto.randomUUID(),
      userId: createdBy,
      ipAddress: ipAddress || '0.0.0.0',
      entityName: 'audio',
      entityId: audio.audioId,
      actionType: 'CREATE',
      logText: `Generated audio from text in ${languageCode}: ${fileName}`,
      timestamp: new Date(),
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