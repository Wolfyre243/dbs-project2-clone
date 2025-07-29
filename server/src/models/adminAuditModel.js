const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { convertDatesToStrings } = require('../utils/formatters');

// Get paginated admin audit logs with optional filter by actionTypeId
module.exports.getPaginatedAuditLogs = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'timestamp',
  order = 'desc',
  actionTypeId = null,
  search = '',
}) => {
  try {
    const where = {};

    if (actionTypeId) {
      where.actionTypeId = Number(actionTypeId);
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { entityName: { contains: search, mode: 'insensitive' } },
        { logText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.auditLog.count({ where });

    const logs = await prisma.auditLog.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy: { [sortBy]: order },
      include: {
        user: { select: { username: true, userId: true } },
        auditAction: { select: { actionType: true, description: true } },
      },
    });

    return {
      logs: logs.map(convertDatesToStrings),
      totalCount,
    };
  } catch (error) {
    throw new AppError('Failed to fetch audit logs', 500);
  }
};

// Get all audit log types
module.exports.getAllAuditLogTypes = async () => {
  try {
    const types = await prisma.auditAction.findMany({
      select: { actionTypeId: true, actionType: true, description: true },
      orderBy: { actionType: 'asc' },
    });
    return types;
  } catch (error) {
    throw new AppError('Failed to fetch audit log types', 500);
  }
};