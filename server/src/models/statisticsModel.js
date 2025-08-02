const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { convertDatesToStrings } = require('../utils/formatters');
const Roles = require('../configs/roleConfig');
const {
  AUDIO_COMPLETED,
  AUDIO_STOPPED,
  AUDIO_STARTED,
  QR_SCANNED,
} = require('../configs/eventTypes');

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
      .map(([time, groupCounts]) => {
        // console.log(time, groupCounts);
        return {
          period: time,
          ...groupCounts,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));

    const finalResults = {
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
    // console.log(finalResults);
    return finalResults;
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

/**
 * Audio Plays by Exhibit
 * Returns: [{ exhibitId, title, playCount }]
 */
module.exports.getAudioPlaysPerExhibitStats = async () => {
  const scans = await prisma.event.findMany({
    where: { eventTypeId: AUDIO_STARTED },
    select: { metadata: true },
  });

  const exhibitPlayMap = {};
  scans.forEach((event) => {
    if (!event.metadata) return;
    const meta = event.metadata;
    const exhibitId = meta.exhibitId;
    if (!exhibitId) return;
    exhibitPlayMap[exhibitId] = (exhibitPlayMap[exhibitId] || 0) + 1;
  });

  const exhibitIds = Object.keys(exhibitPlayMap);
  if (exhibitIds.length === 0) return [];

  const exhibits = await prisma.exhibit.findMany({
    where: { exhibitId: { in: exhibitIds } },
    select: { exhibitId: true, title: true },
  });

  return exhibits
    .map((ex) => ({
      exhibitId: ex.exhibitId,
      title: ex.title,
      playCount: exhibitPlayMap[ex.exhibitId] || 0,
    }))
    .sort((a, b) => b.playCount - a.playCount);
};

/**
 * Audio Completion Rate
 * Returns: [{ audioId, exhibitId, title, started, completed, completionRate }]
 */
module.exports.getAudioCompletionRatesStats = async () => {
  const startedEvents = await prisma.event.findMany({
    where: { eventTypeId: AUDIO_STARTED },
    select: { metadata: true },
  });
  const completedEvents = await prisma.event.findMany({
    where: { eventTypeId: AUDIO_COMPLETED },
    select: { metadata: true },
  });

  // Map: audioId -> { started, completed }
  const audioMap = {};
  startedEvents.forEach((event) => {
    if (!event.metadata) return;
    const { audioId } = event.metadata;
    if (!audioId) return;
    if (!audioMap[audioId]) audioMap[audioId] = { started: 0, completed: 0 };
    audioMap[audioId].started += 1;
  });
  completedEvents.forEach((event) => {
    if (!event.metadata) return;
    const { audioId } = event.metadata;
    if (!audioId || !audioMap[audioId]) return;
    audioMap[audioId].completed += 1;
  });

  const audioIds = Object.keys(audioMap);
  if (audioIds.length === 0) return [];

  // Fetch audio, subtitle, exhibitSubtitle, and exhibit info
  const audios = await prisma.audio.findMany({
    where: { audioId: { in: audioIds } },
    select: {
      audioId: true,
      fileName: true,
      subtitle: {
        select: {
          exhibits: {
            select: {
              exhibitId: true,
            },
          },
        },
      },
    },
  });

  // Flatten to (audioId, exhibitId, fileName) tuples
  const audioExhibitTuples = [];
  audios.forEach((audio) => {
    const exhibitLinks = audio.subtitle?.exhibits || [];
    if (exhibitLinks.length === 0) {
      // If no exhibit, still push with exhibitId null
      audioExhibitTuples.push({
        audioId: audio.audioId,
        exhibitId: null,
        fileName: audio.fileName,
      });
    } else {
      exhibitLinks.forEach((link) => {
        audioExhibitTuples.push({
          audioId: audio.audioId,
          exhibitId: link.exhibitId,
          fileName: audio.fileName,
        });
      });
    }
  });

  // Get all unique exhibitIds
  const exhibitIds = [
    ...new Set(audioExhibitTuples.map((t) => t.exhibitId).filter(Boolean)),
  ];
  const exhibits = await prisma.exhibit.findMany({
    where: { exhibitId: { in: exhibitIds } },
    select: { exhibitId: true, title: true },
  });
  const exhibitMap = {};
  exhibits.forEach((ex) => {
    exhibitMap[ex.exhibitId] = ex.title;
  });

  // Build result per (audioId, exhibitId)
  return audioExhibitTuples
    .map((tuple) => {
      const stats = audioMap[tuple.audioId];
      const completionRate =
        stats.started > 0
          ? +((stats.completed / stats.started) * 100).toFixed(1)
          : 0;
      return {
        audioId: tuple.audioId,
        exhibitId: tuple.exhibitId,
        title: tuple.exhibitId ? exhibitMap[tuple.exhibitId] || '' : '',
        fileName: tuple.fileName,
        started: stats.started,
        completed: stats.completed,
        completionRate,
      };
    })
    .sort((a, b) => b.started - a.started);
};
/**
 * Average Listen Duration
 * Returns: [{ audioId, exhibitId, title, avgDuration }]
 */
module.exports.getAverageListenDurationStats = async () => {
  const events = await prisma.event.findMany({
    where: { eventTypeId: { in: [AUDIO_COMPLETED, AUDIO_STOPPED] } },
    select: { metadata: true },
  });

  // Map: audioId -> { total, count }
  const durationMap = {};
  events.forEach((event) => {
    if (!event.metadata) return;
    const { audioId, currentTime } = event.metadata;
    if (!audioId || typeof currentTime !== 'number') return;
    if (!durationMap[audioId]) durationMap[audioId] = { total: 0, count: 0 };
    durationMap[audioId].total += currentTime;
    durationMap[audioId].count += 1;
  });

  const audioIds = Object.keys(durationMap);
  if (audioIds.length === 0) return [];

  // Fetch audio, subtitle, exhibitSubtitle, and exhibit info
  const audios = await prisma.audio.findMany({
    where: { audioId: { in: audioIds } },
    select: {
      audioId: true,
      fileName: true,
      subtitle: {
        select: {
          exhibits: {
            select: {
              exhibitId: true,
            },
          },
        },
      },
    },
  });

  // Flatten to (audioId, exhibitId, fileName) tuples
  const audioExhibitTuples = [];
  audios.forEach((audio) => {
    const exhibitLinks = audio.subtitle?.exhibits || [];
    if (exhibitLinks.length === 0) {
      audioExhibitTuples.push({
        audioId: audio.audioId,
        exhibitId: null,
        fileName: audio.fileName,
      });
    } else {
      exhibitLinks.forEach((link) => {
        audioExhibitTuples.push({
          audioId: audio.audioId,
          exhibitId: link.exhibitId,
          fileName: audio.fileName,
        });
      });
    }
  });

  // Get all unique exhibitIds
  const exhibitIds = [
    ...new Set(audioExhibitTuples.map((t) => t.exhibitId).filter(Boolean)),
  ];
  const exhibits = await prisma.exhibit.findMany({
    where: { exhibitId: { in: exhibitIds } },
    select: { exhibitId: true, title: true },
  });
  const exhibitMap = {};
  exhibits.forEach((ex) => {
    exhibitMap[ex.exhibitId] = ex.title;
  });

  // Build result per (audioId, exhibitId)
  return audioExhibitTuples
    .map((tuple) => {
      const stats = durationMap[tuple.audioId];
      const avgDuration =
        stats.count > 0 ? +(stats.total / stats.count).toFixed(2) : 0;
      return {
        audioId: tuple.audioId,
        exhibitId: tuple.exhibitId,
        title: tuple.exhibitId ? exhibitMap[tuple.exhibitId] || '' : '',
        fileName: tuple.fileName,
        avgDuration,
        count: stats.count,
      };
    })
    .sort((a, b) => b.avgDuration - a.avgDuration);
};

// Get scan counts grouped by exhibit and date
module.exports.getScansPerExhibitStats = async ({
  startDate = null,
  endDate = null,
  granularity = 'day',
  limit = null,
}) => {
  try {
    const where = {
      entityName: 'exhibit',
      eventTypeId: QR_SCANNED,
    };

    // Add date filters
    if (startDate || endDate) {
      const timestampFilter = {};
      if (startDate) timestampFilter.gte = new Date(startDate);
      if (endDate) {
        const endObj = new Date(endDate);
        endObj.setHours(23, 59, 59, 999);
        timestampFilter.lte = endObj;
      }
      where.timestamp = timestampFilter;
    }

    // Get scan events with timestamps
    const scans = await prisma.event.findMany({
      where,
      select: { details: true, timestamp: true },
    });

    const exhibitScanMap = {};

    scans.forEach((scan) => {
      let exhibitId = null;
      try {
        const parsed = JSON.parse(scan.details);
        exhibitId = parsed.exhibitId;
      } catch {
        const match = scan.details.match(
          /exhibit (\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/,
        );
        if (match) exhibitId = match[1];
      }

      if (!exhibitId) return;

      // Determine time key
      const ts = new Date(scan.timestamp);
      let timeKey;
      switch (granularity) {
        case 'month':
          timeKey = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          timeKey = `${ts.getFullYear()}`;
          break;
        default:
          timeKey = ts.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      if (!exhibitScanMap[exhibitId]) {
        exhibitScanMap[exhibitId] = {
          scanCount: 0,
          scanDates: {}, // { 'YYYY-MM-DD': count }
        };
      }

      exhibitScanMap[exhibitId].scanCount += 1;
      exhibitScanMap[exhibitId].scanDates[timeKey] =
        (exhibitScanMap[exhibitId].scanDates[timeKey] || 0) + 1;
    });

    const exhibitIds = Object.keys(exhibitScanMap);
    const exhibits = await prisma.exhibit.findMany({
      where: { exhibitId: { in: exhibitIds } },
      select: { exhibitId: true, title: true, description: true },
    });

    let result = exhibits.map((exhibit) => {
      const { scanCount, scanDates } = exhibitScanMap[exhibit.exhibitId];
      return {
        exhibitId: exhibit.exhibitId,
        title: exhibit.title,
        description: exhibit.description,
        scanCount,
        scanDates: Object.entries(scanDates).map(([date, count]) => ({
          date,
          count,
        })),
      };
    });

    result.sort((a, b) => b.scanCount - a.scanCount);
    if (limit && limit > 0) result = result.slice(0, limit);

    return result;
  } catch (error) {
    throw new AppError('Failed to get scans per exhibit', 500);
  }
};

// Audio Completion Rate Over Time (for line chart)
module.exports.getAudioCompletionRatesTimeSeries = async () => {
  const startedEvents = await prisma.event.findMany({
    where: { eventTypeId: AUDIO_STARTED },
    select: { metadata: true, timestamp: true },
  });
  const completedEvents = await prisma.event.findMany({
    where: { eventTypeId: AUDIO_COMPLETED },
    select: { metadata: true, timestamp: true },
  });

  // Group by date (YYYY-MM-DD)
  const startedByDate = {};
  startedEvents.forEach((event) => {
    if (!event.metadata) return;
    const date = event.timestamp.toISOString().slice(0, 10);
    startedByDate[date] = (startedByDate[date] || 0) + 1;
  });
  const completedByDate = {};
  completedEvents.forEach((event) => {
    if (!event.metadata) return;
    const date = event.timestamp.toISOString().slice(0, 10);
    completedByDate[date] = (completedByDate[date] || 0) + 1;
  });

  // Get all dates in sorted order
  const allDates = Array.from(
    new Set([...Object.keys(startedByDate), ...Object.keys(completedByDate)]),
  ).sort();

  // Build time series
  let cumulativeStarted = 0;
  let cumulativeCompleted = 0;
  const timeSeries = allDates.map((date) => {
    cumulativeStarted += startedByDate[date] || 0;
    cumulativeCompleted += completedByDate[date] || 0;
    const completionRate =
      cumulativeStarted > 0
        ? +((cumulativeCompleted / cumulativeStarted) * 100).toFixed(1)
        : 0;
    return {
      date,
      started: cumulativeStarted,
      completed: cumulativeCompleted,
      completionRate,
    };
  });

  return timeSeries;
};

// Average Listen Duration Over Time (for line chart)
module.exports.getAverageListenDurationTimeSeries = async () => {
  const events = await prisma.event.findMany({
    where: { eventTypeId: { in: [AUDIO_COMPLETED, AUDIO_STOPPED] } },
    select: { metadata: true, timestamp: true },
  });

  // Group by date (YYYY-MM-DD)
  const durationByDate = {};
  const countByDate = {};
  events.forEach((event) => {
    if (!event.metadata) return;
    const { currentTime } = event.metadata;
    if (typeof currentTime !== 'number') return;
    const date = event.timestamp.toISOString().slice(0, 10);
    durationByDate[date] = (durationByDate[date] || 0) + currentTime;
    countByDate[date] = (countByDate[date] || 0) + 1;
  });

  // Get all dates in sorted order
  const allDates = Object.keys(durationByDate).sort();

  // Build time series
  let cumulativeDuration = 0;
  let cumulativeCount = 0;
  const timeSeries = allDates.map((date) => {
    cumulativeDuration += durationByDate[date] || 0;
    cumulativeCount += countByDate[date] || 0;
    const avgDuration =
      cumulativeCount > 0
        ? +(cumulativeDuration / cumulativeCount).toFixed(2)
        : 0;
    return {
      date,
      avgDuration,
      count: cumulativeCount,
    };
  });

  return timeSeries;
};
