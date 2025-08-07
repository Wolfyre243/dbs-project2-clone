// Import dependencies
const jwt = require('jsonwebtoken');

// Import services
const statisticsModel = require('../models/statisticsModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { logAdminAudit } = require('../utils/auditlogs');
const AuditActions = require('../configs/auditActionConfig');
const { cookieOptions } = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');
const logEventAudit = require('../utils/eventlogs');

// Get simple user count statistics for dashboard boxes (excludes admins)
module.exports.getCountOfUsers = catchAsync(async (req, res, next) => {
  const {
    timeFilter = null, // 'today', 'month', 'year', 'custom'
    startDate = null,
    endDate = null,
    statusFilter = null,
  } = req.query;

  // Build filter object
  const filter = {};
  if (statusFilter) {
    filter.statusId = parseInt(statusFilter);
  }

  // Handle time-based filtering for custom date ranges
  if (timeFilter === 'custom' && (startDate || endDate)) {
    const dateFilter = {};

    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // Include the entire end day
      dateFilter.lte = endDateObj;
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }
  }

  const result = await statisticsModel.getUserCountStatistics(filter);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// Get member sign-ups statistics (Members only) with age groups, gender, and date filtering
module.exports.getDisplayMemberSignUps = catchAsync(async (req, res, next) => {
  const {
    startDate = null,
    endDate = null,
    gender = 'All', // 'M', 'F', 'All'
    ageGroup = 'All', // 'Children', 'Youth', 'Adults', 'Seniors', 'All'
    granularity = 'day', // 'day', 'month', 'year'
  } = req.query;

  // Validate age group
  const validAgeGroups = ['Children', 'Youth', 'Adults', 'Seniors', 'All'];
  if (!validAgeGroups.includes(ageGroup)) {
    throw new AppError(
      'Invalid age group. Must be: Children, Youth, Adults, Seniors, or All',
      400,
    );
  }

  // Validate gender
  const validGenders = ['M', 'F', 'All'];
  if (!validGenders.includes(gender)) {
    throw new AppError('Invalid gender. Must be: M, F, or All', 400);
  }

  // Validate granularity
  const validGranularities = ['day', 'month', 'year'];
  if (!validGranularities.includes(granularity)) {
    throw new AppError(
      'Invalid granularity. Must be: day, month, or year',
      400,
    );
  }

  const result = await statisticsModel.getDisplayMemberSignUps({
    startDate,
    endDate,
    gender,
    ageGroup,
    granularity,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// Get all common languages used by members
module.exports.getDisplayCommonLanguagesUsed = catchAsync(
  async (req, res, next) => {
    const { limit } = req.query;

    let parsedLimit = null;
    if (limit && limit !== 'all') {
      const n = parseInt(limit);
      if (isNaN(n)) throw new AppError('Invalid limit', 400);
      parsedLimit = n;
    }

    const result = await statisticsModel.getDisplayCommonLanguagesUsed({
      limit: parsedLimit, // null means show all
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  },
);

module.exports.getAudioPlaysPerExhibit = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const result = await statisticsModel.getAudioPlaysPerExhibitStats({
    startDate,
    endDate,
  });
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports.getAudioCompletionRates = catchAsync(async (req, res, next) => {
  const result = await statisticsModel.getAudioCompletionRatesStats();
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports.getAverageListenDuration = catchAsync(async (req, res, next) => {
  const result = await statisticsModel.getAverageListenDurationStats();
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// Get audio completion rates time series data for line charts
module.exports.getAudioCompletionRatesTimeSeries = catchAsync(
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const result = await statisticsModel.getAudioCompletionRatesTimeSeries({
      startDate,
      endDate,
    });
    res.status(200).json({
      status: 'success',
      data: result,
    });
  },
);

// Get average listen duration time series data for line charts
module.exports.getAverageListenDurationTimeSeries = catchAsync(
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const result = await statisticsModel.getAverageListenDurationTimeSeries({
      startDate,
      endDate,
    });
    res.status(200).json({
      status: 'success',
      data: result,
    });
  },
);

module.exports.getScansPerExhibit = catchAsync(async (req, res, next) => {
  const {
    startDate = null,
    endDate = null,
    granularity = 'day', // optional, not used in logic here
    limit = null,
  } = req.query;

  const result = await statisticsModel.getScansPerExhibitStats({
    startDate,
    endDate,
    granularity,
    limit: limit ? parseInt(limit) : null,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
