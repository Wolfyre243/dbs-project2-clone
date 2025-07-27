const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { encryptData, decryptData } = require('../utils/encryption');
const { convertDatesToStrings } = require('../utils/formatters');
const Roles = require('../configs/roleConfig');

// Get simple user count statistics for regular users only (excludes admins)
module.exports.getUserCountStatistics = async (filter = {}) => {
  try {
    const baseUserFilter = {
      userRoles: {
        roleId: {
          in: [Roles.GUEST, Roles.MEMBER],
        },
      },
    };

    // Combine base filter with any additional filters
    const where = {
      AND: [baseUserFilter, filter],
    };

    // Get total regular user count
    const totalUsers = await prisma.users.count({ where });

    // Get today's registrations (1 day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRegistrations = await prisma.users.count({
      where: {
        AND: [
          baseUserFilter,
          filter,
          {
            createdAt: {
              gte: todayStart,
            },
          },
        ],
      },
    });

    // Get this month's registrations (1 month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthRegistrations = await prisma.users.count({
      where: {
        AND: [
          baseUserFilter,
          filter,
          {
            createdAt: {
              gte: monthStart,
            },
          },
        ],
      },
    });

    // Get this year's registrations (1 year)
    const yearStart = new Date();
    yearStart.setMonth(0, 1); // January 1st
    yearStart.setHours(0, 0, 0, 0);

    const yearRegistrations = await prisma.users.count({
      where: {
        AND: [
          baseUserFilter,
          filter,
          {
            createdAt: {
              gte: yearStart,
            },
          },
        ],
      },
    });

    return {
      totalUsers,
      registrations: {
        today: todayRegistrations,
        thisMonth: monthRegistrations,
        thisYear: yearRegistrations,
      },
    };
  } catch (error) {
    throw new AppError('Failed to get user count statistics', 500);
  }
};
