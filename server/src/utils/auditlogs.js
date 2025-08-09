//This is to log admin actions in the database
const { PrismaClient } = require('../generated/prisma');
const logger = require('./logger');
const prisma = new PrismaClient();

/**
 * @param {Object} params
 * @param {String} params.userId
 * @param {String} params.ipAddress
 * @param {String} params.entityName
 * @param {String} params.entityId
 * @param {Int} params.actionTypeId
 * @param {String} params.logText
 */
module.exports.logAdminAudit = async function ({
  userId,
  ipAddress,
  entityName,
  entityId,
  actionTypeId,
  logText,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        ipAddress,
        entityName,
        entityId,
        actionTypeId,
        logText,
      },
    });

    logger.info(logText);
  } catch (error) {
    console.error('Error logging admin audit action:', error);
  }
};
