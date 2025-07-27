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

  // Log admin audit
  await logAdminAudit(
    res.locals.user.userId,
    AuditActions.READ,
    `Viewed user statistics for dashboard with filters: ${JSON.stringify(req.query)}`,
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
