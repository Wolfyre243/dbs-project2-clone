const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');
const { convertDatesToStrings } = require('../utils/formatters');

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

// Archive subtitle by setting status to ARCHIVED
module.exports.archiveSubtitle = async (subtitleId, userId, ipAddress) => {
  return await prisma.subtitle.update({
    where: { subtitleId },
    data: {
      statusId: statusCodes.ARCHIVED,
      modifiedBy: userId,
    },
  });
};

// Unarchive subtitle by setting status to ACTIVE
module.exports.unarchiveSubtitle = async (subtitleId, userId, ipAddress) => {
  return await prisma.subtitle.update({
    where: { subtitleId },
    data: {
      statusId: statusCodes.ACTIVE,
      modifiedBy: userId,
    },
  });
};

// Soft delete subtitle by setting status to DELETED
module.exports.softDeleteSubtitle = async (subtitleId, userId, ipAddress) => {
  return await prisma.subtitle.update({
    where: { subtitleId },
    data: {
      statusId: statusCodes.DELETED,
      modifiedBy: userId,
    },
  });
};

// Hard delete subtitle
module.exports.hardDeleteSubtitle = async (subtitleId) => {
  return await prisma.subtitle.delete({
    where: { subtitleId },
  });
};

//get all subtitles forr admin
module.exports.getAllSubtitles = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
  filter = {},
}) => {
  let where = { ...filter };

  // Conditional search terms
  if (search && search.trim() !== '') {
    where.OR = [
      { subtitleText: { contains: search } },
      { languageCode: { contains: search } },
    ];
  }

  const subtitleCount = await prisma.subtitle.count({
    where: where,
  });

  const subtitlesRaw = await prisma.subtitle.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: where,
    select: {
      subtitleId: true,
      subtitleText: true,
      languageCode: true,
      createdBy: true,
      createdAt: true,
      modifiedAt: true,
      statusId: true,
    },
    orderBy: {
      [sortBy]: order,
    },
  });

  return {
    subtitles: subtitlesRaw.map((subtitle) => convertDatesToStrings(subtitle)),
    subtitleCount,
  };
};
// Get subtitle by ID
module.exports.getSubtitleById = async (subtitleId) => {
  return await prisma.subtitle.findUnique({
    where: { subtitleId },
    select: {
      subtitleId: true,
      subtitleText: true,
      languageCode: true,
      createdBy: true,
      createdAt: true,
      modifiedAt: true,
      statusId: true,
    },
  });
};
