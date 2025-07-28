const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { convertDatesToStrings } = require('../utils/formatters');
const Roles = require('../configs/roleConfig');
const EventTypes = require('../configs/eventTypes');

// Helper functions for age calculations
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const getAgeGroup = (age) => {
  if (age === null || age === undefined) return 'Unknown';
  if (age < 13) return 'Children';
  if (age >= 13 && age <= 17) return 'Youth';
  if (age >= 18 && age <= 64) return 'Adults';
  if (age >= 65) return 'Seniors';
  return 'Unknown';
};

const getAgeRangeFilter = (ageGroup) => {
  const today = new Date();
  const currentYear = today.getFullYear();

  switch (ageGroup) {
    case 'Children':
      // Under 13 years old
      const childrenMinYear = currentYear - 12;
      return {
        gte: new Date(childrenMinYear, 0, 1), // From this year
      };
    case 'Youth':
      // 13-17 years old
      const youthMaxYear = currentYear - 13;
      const youthMinYear = currentYear - 17;
      return {
        gte: new Date(youthMinYear, 0, 1),
        lte: new Date(youthMaxYear, 11, 31),
      };
    case 'Adults':
      // 18-64 years old
      const adultsMaxYear = currentYear - 18;
      const adultsMinYear = currentYear - 64;
      return {
        gte: new Date(adultsMinYear, 0, 1),
        lte: new Date(adultsMaxYear, 11, 31),
      };
    case 'Seniors':
      // 65+ years old
      const seniorsMaxYear = currentYear - 65;
      return {
        lte: new Date(seniorsMaxYear, 11, 31),
      };
    default:
      return null;
  }
};

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

// Get member sign-ups statistics with filtering (Members only)
module.exports.getDisplayMemberSignUps = async ({
  startDate = null,
  endDate = null,
  gender = 'All',
  ageGroup = 'All',
  granularity = 'day',
}) => {
  try {
    // Base filter for Members only
    const baseMemberFilter = {
      userRoles: {
        roleId: Roles.MEMBER,
      },
    };

    // Build where clause
    let where = {
      AND: [baseMemberFilter],
    };

    // Add date filtering
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.lte = endDateObj;
      }
      where.AND.push({ createdAt: dateFilter });
    }

    // Add gender filtering
    if (gender !== 'All') {
      where.AND.push({
        userProfile: {
          gender: gender,
        },
      });
    }

    // Add age group filtering
    if (ageGroup !== 'All') {
      const ageRangeFilter = getAgeRangeFilter(ageGroup);
      if (ageRangeFilter) {
        where.AND.push({
          userProfile: {
            dob: ageRangeFilter,
          },
        });
      }
    }

    // Get total count with filters
    const totalMembers = await prisma.users.count({ where });

    // Get members with profiles for detailed analysis
    const members = await prisma.users.findMany({
      where,
      select: {
        userId: true,
        createdAt: true,
        userProfile: {
          select: {
            dob: true,
            gender: true,
          },
        },
      },
    });

    // Process members for age group analysis
    const processedMembers = members.map((member) => {
      const age = calculateAge(member.userProfile?.dob);
      const memberAgeGroup = getAgeGroup(age);
      return {
        ...member,
        age,
        ageGroup: memberAgeGroup,
        gender: member.userProfile?.gender || 'Unknown',
      };
    });

    // Generate breakdowns
    const ageGroupBreakdown = {};
    const genderBreakdown = {};
    const timeSeriesData = {};

    // Initialize age groups
    ['Children', 'Youth', 'Adults', 'Seniors', 'Unknown'].forEach((group) => {
      ageGroupBreakdown[group] = 0;
    });

    // Initialize genders
    ['M', 'F', 'Unknown'].forEach((g) => {
      genderBreakdown[g] = 0;
    });

    // Process each member
    processedMembers.forEach((member) => {
      // Age group breakdown
      ageGroupBreakdown[member.ageGroup]++;

      // Gender breakdown
      genderBreakdown[member.gender]++;

      // Time series data based on granularity
      let timeKey;
      const createdDate = new Date(member.createdAt);

      switch (granularity) {
        case 'day':
          timeKey = createdDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          timeKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          break;
        case 'year':
          timeKey = createdDate.getFullYear().toString(); // YYYY
          break;
      }

      if (!timeSeriesData[timeKey]) {
        timeSeriesData[timeKey] = {
          Children: 0,
          Youth: 0,
          Adults: 0,
          Seniors: 0,
          Unknown: 0,
        };
      }
      timeSeriesData[timeKey][member.ageGroup]++;
    });

    // Convert breakdowns to arrays with percentages
    const ageGroupArray = Object.entries(ageGroupBreakdown)
      .map(([group, count]) => ({
        ageGroup: group,
        count,
        percentage:
          totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0,
      }))
      .filter((item) => item.count > 0); // Only include groups with members

    const genderArray = Object.entries(genderBreakdown)
      .map(([genderType, count]) => ({
        gender: genderType,
        count,
        percentage:
          totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0,
      }))
      .filter((item) => item.count > 0); // Only include genders with members

    // Convert time series to array and sort
    const timeSeriesArray = Object.entries(timeSeriesData)
      .map(([time, groupCounts]) => ({
        period: time,
        ...groupCounts,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      summary: {
        totalMembers,
        filters: {
          dateRange:
            startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
          gender:
            gender === 'All'
              ? 'All genders'
              : gender === 'M'
                ? 'Male'
                : 'Female',
          ageGroup: ageGroup === 'All' ? 'All age groups' : ageGroup,
          granularity,
        },
      },
      breakdowns: {
        byAgeGroup: ageGroupArray,
        byGender: genderArray,
      },
      timeSeries: {
        granularity,
        data: timeSeriesArray,
      },
      quickStats: {
        children: ageGroupBreakdown.Children,
        youth: ageGroupBreakdown.Youth,
        adults: ageGroupBreakdown.Adults,
        seniors: ageGroupBreakdown.Seniors,
        male: genderBreakdown.M,
        female: genderBreakdown.F,
      },
    };
  } catch (error) {
    throw new AppError('Failed to get member sign-ups statistics', 500);
  }
};

// Get most common languages used by users
module.exports.getDisplayCommonLanguagesUsed = async ({ limit } = {}) => {
  try {
    const baseUserFilter = {
      userRoles: {
        roleId: Roles.MEMBER,
      },
    };

    const usersWithLanguages = await prisma.users.findMany({
      where: {
        AND: [baseUserFilter],
      },
      select: {
        userId: true,
        userProfile: {
          select: { languageCode: true },
        },
      },
    });

    const languageCount = {};
    const languageUsers = {};

    usersWithLanguages.forEach((user) => {
      const langCode = user.userProfile?.languageCode;
      if (!langCode) return;

      if (!languageCount[langCode]) {
        languageCount[langCode] = 0;
        languageUsers[langCode] = [];
      }

      languageCount[langCode]++;
      languageUsers[langCode].push(user.userId);
    });

    const allLanguageCodes = Object.keys(languageCount);

    const languageDetails = await prisma.language.findMany({
      where: { languageCode: { in: allLanguageCodes } },
      select: { languageCode: true, languageName: true },
    });

    const languageMap = {};
    languageDetails.forEach((lang) => {
      languageMap[lang.languageCode] = lang.languageName;
    });

    const sortedLanguages = Object.entries(languageCount).sort(
      ([, a], [, b]) => b - a,
    );

    const totalUsers = usersWithLanguages.filter(
      (u) => u.userProfile?.languageCode,
    ).length;

    const allStats = sortedLanguages.map(([langCode, count], i) => ({
      rank: i + 1,
      languageCode: langCode,
      languageName: languageMap[langCode] || langCode,
      userCount: count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    }));

    const topLanguages =
      typeof limit === 'number' ? allStats.slice(0, limit) : allStats;

    return {
      summary: {
        totalUsers,
        totalLanguagesUsed: allLanguageCodes.length,
        dateRange: 'All time',
        topLanguagesCount: topLanguages.length,
      },
      topLanguages,
      mostPopular: topLanguages[0] || null,
      allLanguageStats: allStats,
    };
  } catch (err) {
    console.error('Language statistics error:', err);
    throw new AppError('Failed to get language statistics', 500);
  }
};

// Get QR code scan trends and statistics
module.exports.getQRCodeScanTrends = async ({
  startDate = null,
  endDate = null,
  exhibitId = null,
  granularity = 'day',
  limit = 10,
}) => {
  try {
    // Build where clause for event logs
    let where = {
      eventTypeId: EventTypes.QR_SCANNED, // Only QR scan events
      entityName: 'qr_code', // Only QR code related events
    };

    // Add date filtering
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.lte = endDateObj;
      }
      where.timestamp = dateFilter;
    }

    // Get all QR scan events
    const scanEvents = await prisma.event.findMany({
      where,
      select: {
        eventId: true,
        timestamp: true,
        entityId: true,
        entityName: true,
        userId: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Get QR codes to map to exhibits
    const qrCodeIds = [...new Set(scanEvents.map((event) => event.entityId))];
    const qrCodes = await prisma.qrCode.findMany({
      where: {
        qrCodeId: {
          in: qrCodeIds,
        },
      },
      select: {
        qrCodeId: true,
        exhibitId: true,
        exhibit: {
          select: {
            exhibitId: true,
            title: true,
          },
        },
      },
    });

    // Create QR code to exhibit mapping
    const qrToExhibitMap = {};
    qrCodes.forEach((qr) => {
      qrToExhibitMap[qr.qrCodeId] = {
        exhibitId: qr.exhibitId,
        exhibitTitle: qr.exhibit?.title || 'Unknown Exhibit',
      };
    });

    // Filter by specific exhibit if requested
    let filteredEvents = scanEvents;
    if (exhibitId) {
      filteredEvents = scanEvents.filter((event) => {
        const exhibit = qrToExhibitMap[event.entityId];
        return exhibit && exhibit.exhibitId === exhibitId;
      });
    }

    // Process events for statistics
    const exhibitScans = {};
    const timeSeriesData = {};
    const userScans = {};

    filteredEvents.forEach((event) => {
      const exhibit = qrToExhibitMap[event.entityId];
      if (!exhibit) return;

      const exhibitKey = exhibit.exhibitId;
      const userId = event.userId || 'guest';

      // Count by exhibit
      if (!exhibitScans[exhibitKey]) {
        exhibitScans[exhibitKey] = {
          exhibitId: exhibitKey,
          exhibitTitle: exhibit.exhibitTitle,
          scanCount: 0,
          uniqueUsers: new Set(),
        };
      }
      exhibitScans[exhibitKey].scanCount++;
      exhibitScans[exhibitKey].uniqueUsers.add(userId);

      // Count by user
      if (!userScans[userId]) {
        userScans[userId] = 0;
      }
      userScans[userId]++;

      // Time series data
      let timeKey;
      const eventDate = new Date(event.timestamp);

      switch (granularity) {
        case 'day':
          timeKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          timeKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          break;
        case 'year':
          timeKey = eventDate.getFullYear().toString(); // YYYY
          break;
      }

      if (!timeSeriesData[timeKey]) {
        timeSeriesData[timeKey] = {
          [granularity]: timeKey,
          totalScans: 0,
          uniqueExhibits: new Set(),
          uniqueUsers: new Set(),
        };
      }
      timeSeriesData[timeKey].totalScans++;
      timeSeriesData[timeKey].uniqueExhibits.add(exhibitKey);
      timeSeriesData[timeKey].uniqueUsers.add(userId);
    });

    // Convert exhibit scans to array and sort by scan count
    const topExhibits = Object.values(exhibitScans)
      .map((exhibit) => ({
        ...exhibit,
        uniqueUsers: exhibit.uniqueUsers.size,
      }))
      .sort((a, b) => b.scanCount - a.scanCount)
      .slice(0, limit);

    // Convert time series to array and sort
    const timeSeriesArray = Object.values(timeSeriesData)
      .map((item) => ({
        [granularity]: item[granularity],
        totalScans: item.totalScans,
        uniqueExhibits: item.uniqueExhibits.size,
        uniqueUsers: item.uniqueUsers.size,
      }))
      .sort((a, b) => a[granularity].localeCompare(b[granularity]));

    // Calculate summary statistics
    const totalScans = filteredEvents.length;
    const uniqueUsers = new Set(filteredEvents.map((e) => e.userId || 'guest'))
      .size;
    const uniqueExhibits = new Set(Object.keys(exhibitScans)).size;
    const mostPopularExhibit = topExhibits[0] || null;

    return {
      summary: {
        totalScans,
        uniqueUsers,
        uniqueExhibits,
        dateRange:
          startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
        granularity,
        mostPopularExhibit: mostPopularExhibit
          ? {
              exhibitId: mostPopularExhibit.exhibitId,
              title: mostPopularExhibit.exhibitTitle,
              scanCount: mostPopularExhibit.scanCount,
            }
          : null,
      },
      topExhibits,
      timeSeries: {
        granularity,
        data: timeSeriesArray,
      },
      scanDistribution: {
        byExhibit: topExhibits,
        byTime: timeSeriesArray,
      },
    };
  } catch (error) {
    throw new AppError('Failed to get QR scan statistics', 500);
  }
};
