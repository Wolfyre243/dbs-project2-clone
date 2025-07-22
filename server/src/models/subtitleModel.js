const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

module.exports.create = async ({
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
