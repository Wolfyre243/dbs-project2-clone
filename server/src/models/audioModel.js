const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Create a new audio record
module.exports.createAudio = async ({
  fileName,
  createdBy,
  languageId,
  statusId,
}) => {
  return await prisma.audio.create({
    data: {
      audioId: crypto.randomUUID(),
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
