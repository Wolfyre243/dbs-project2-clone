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