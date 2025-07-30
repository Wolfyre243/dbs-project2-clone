const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { convertDatesToStrings } = require('../utils/formatters');

// module.exports.getPaginatedEventLogs = async ({
module.exports.getPaginatedEventLogs = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'timestamp',
  order = 'desc',
  eventTypeId = null,
  search = '',
}) => {
  try {
    const where = {};

    if (eventTypeId) {
      where.eventTypeId = Number(eventTypeId);
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { entityName: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.event.count({ where });

    const logs = await prisma.event.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy: { [sortBy]: order },
      include: {
        users: { select: { username: true, userId: true } },
        eventType: { select: { eventType: true, description: true } },
      },
    });

    return {
      logs: logs.map(convertDatesToStrings),
      totalCount,
    };
  } catch (error) {
    throw new AppError('Failed to fetch event logs', 500);
  }
};

// Get all audit log types
module.exports.getAllEventLogTypes = async () => {
  try {
    const types = await prisma.eventType.findMany({
      select: { eventTypeId: true, eventType: true, description: true },
      orderBy: { eventType: 'asc' },
    });
    return types;
  } catch (error) {
    throw new AppError('Failed to fetch audit log types', 500);
  }
};
