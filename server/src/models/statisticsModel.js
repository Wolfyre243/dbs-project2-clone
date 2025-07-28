const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { convertDatesToStrings } = require('../utils/formatters');
const Roles = require('../configs/roleConfig');
const EventTypes = require('../configs/eventTypes');

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
module.exports.getDisplayCommonLanguagesUsed = async ({
  limit = 3,
  userType = 'Members',
  startDate = null,
  endDate = null,
}) => {
  try {
    // Build base filter based on user type
    let baseUserFilter;

    switch (userType) {
      case 'Members':
        baseUserFilter = {
          userRoles: {
            roleId: Roles.MEMBER, // Only Members
          },
        };
        break;
      case 'Guests':
        baseUserFilter = {
          userRoles: {
            roleId: Roles.GUEST, // Only Guests
          },
        };
        break;
      case 'All':
        baseUserFilter = {
          userRoles: {
            roleId: {
              in: [Roles.GUEST, Roles.MEMBER], // Exclude admins
            },
          },
        };
        break;
    }

    // Build where clause
    let where = {
      AND: [
        baseUserFilter,
        {
          userProfile: {
            languageCode: {
              not: null, // Only users with language codes
            },
          },
        },
      ],
    };

    // Add date filtering if provided
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

    // Get language usage statistics using groupBy
    const languageStats = await prisma.users.groupBy({
      by: ['userProfile', 'languageCode'], // Group by user profile language code
      where,
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc', // Order by count descending
        },
      },
      take: limit, // Limit to top N languages
    });

    // Since Prisma groupBy with nested fields is tricky, let's use a different approach
    // Get users with their language codes
    const usersWithLanguages = await prisma.users.findMany({
      where,
      select: {
        userId: true,
        createdAt: true,
        userProfile: {
          select: {
            languageCode: true,
          },
        },
      },
    });

    // Process language statistics manually
    const languageCount = {};
    const languageUsers = {};

    usersWithLanguages.forEach((user) => {
      const langCode = user.userProfile?.languageCode;
      if (langCode) {
        if (!languageCount[langCode]) {
          languageCount[langCode] = 0;
          languageUsers[langCode] = [];
        }
        languageCount[langCode]++;
        languageUsers[langCode].push(user.userId);
      }
    });

    // Get language details from the language table
    const allLanguageCodes = Object.keys(languageCount);
    const languageDetails = await prisma.language.findMany({
      where: {
        languageCode: {
          in: allLanguageCodes,
        },
      },
      select: {
        languageCode: true,
        languageName: true,
      },
    });

    // Create language lookup map
    const languageMap = {};
    languageDetails.forEach((lang) => {
      languageMap[lang.languageCode] = lang.languageName;
    });

    // Sort languages by count and take top N
    const sortedLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    // Calculate total users for percentage
    const totalUsers = usersWithLanguages.length;

    // Format the results
    const topLanguages = sortedLanguages.map(([langCode, count], index) => ({
      rank: index + 1,
      languageCode: langCode,
      languageName: languageMap[langCode] || langCode,
      userCount: count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
      userIds: languageUsers[langCode], // Optional: include user IDs
    }));

    // Get additional statistics
    const totalLanguagesUsed = Object.keys(languageCount).length;
    const mostPopularLanguage =
      topLanguages.length > 0 ? topLanguages[0] : null;

    return {
      summary: {
        totalUsers,
        totalLanguagesUsed,
        userType,
        dateRange:
          startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
        topLanguagesCount: Math.min(limit, topLanguages.length),
      },
      topLanguages,
      mostPopular: mostPopularLanguage,
      allLanguageStats: Object.entries(languageCount)
        .sort(([, a], [, b]) => b - a)
        .map(([langCode, count]) => ({
          languageCode: langCode,
          languageName: languageMap[langCode] || langCode,
          userCount: count,
          percentage:
            totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        })),
    };
  } catch (error) {
    throw new AppError('Failed to get language statistics', 500);
  }
};

// Helper function to calculate age from date of birth
function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Helper function to get age group from age
function getAgeGroup(age) {
  if (age === null || age === undefined) return 'Unknown';
  if (age < 13) return 'Children';
  if (age >= 13 && age <= 17) return 'Youth';
  if (age >= 18 && age <= 64) return 'Adults';
  if (age >= 65) return 'Seniors';
  return 'Unknown';
}

// Helper function to get age range filter for database query
function getAgeRangeFilter(ageGroup) {
  const today = new Date();
  const currentYear = today.getFullYear();

  switch (ageGroup) {
    case 'Children': // 0-12 years old
      return {
        gte: new Date(currentYear - 12, 0, 1), // Born after Jan 1st of (currentYear - 12)
      };
    case 'Youth': // 13-17 years old
      return {
        gte: new Date(currentYear - 17, 0, 1), // Born after Jan 1st of (currentYear - 17)
        lte: new Date(currentYear - 13, 11, 31), // Born before Dec 31st of (currentYear - 13)
      };
    case 'Adults': // 18-64 years old
      return {
        gte: new Date(currentYear - 64, 0, 1), // Born after Jan 1st of (currentYear - 64)
        lte: new Date(currentYear - 18, 11, 31), // Born before Dec 31st of (currentYear - 18)
      };
    case 'Seniors': // 65+ years old
      return {
        lte: new Date(currentYear - 65, 11, 31), // Born before Dec 31st of (currentYear - 65)
      };
    default: // 'All'
      return null;
  }
}

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
