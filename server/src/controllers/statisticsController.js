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

// Get most common languages used by members (top 3)
module.exports.getDisplayCommonLanguagesUsed = catchAsync(
  async (req, res, next) => {
    const {
      limit = req.query.limit || 3, // Default to top 3 languages
      userType = 'Members', // 'Members', 'All', 'Guests'
      startDate = null,
      endDate = null,
    } = req.query;

    // Validate user type
    const validUserTypes = ['Members', 'All', 'Guests'];
    if (!validUserTypes.includes(userType)) {
      throw new AppError(
        'Invalid user type. Must be: Members, All, or Guests',
        400,
      );
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 10) {
      throw new AppError('Invalid limit. Must be between 1 and 10', 400);
    }

    const result = await statisticsModel.getDisplayCommonLanguagesUsed({
      limit: limitNum,
      userType,
      startDate,
      endDate,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  },
);

// Add this new controller method to the existing file

// Get QR code scan trends and statistics
module.exports.getQRCodeScanTrends = catchAsync(async (req, res, next) => {
  const {
    startDate = null,
    endDate = null,
    exhibitId = null, // Filter by specific exhibit
    granularity = 'day', // 'day', 'month', 'year'
    limit = 10, // Top N exhibits
  } = req.query;

  // Validate granularity
  const validGranularities = ['day', 'month', 'year'];
  if (!validGranularities.includes(granularity)) {
    throw new AppError(
      'Invalid granularity. Must be: day, month, or year',
      400,
    );
  }

  // Validate limit
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new AppError('Invalid limit. Must be between 1 and 50', 400);
  }

  const result = await statisticsModel.getQRCodeScanTrends({
    startDate,
    endDate,
    exhibitId,
    granularity,
    limit: limitNum,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
