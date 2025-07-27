// This for user logs
const Roles = require('../configs/roleConfig');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Logs a user event (excluding admin/superadmin).
 * @param {Object} params
 * @param {String} params.userId
 * @param {Int} params.entityId
 * @param {String} params.entityName
 * @param {String} params.details
 * @param {String} [params.role]
 */
module.exports.logUserEvent = async function ({
  userId,
  entityId,
  entityName,
  eventTypeId,
  details,
  role,
}) {
  // Exclude admin and superadmin
  if (role === Roles.ADMIN || role === Roles.SUPERADMIN) return;

  try {
    await prisma.event.create({
      data: {
        userId,
        entityId,
        entityName,
        eventTypeId,
        details,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error logging user event:', error);
  }
};
