// Import dependencies
const jwt = require('jsonwebtoken');

// Import services
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { logAdminAudit } = require('../utils/auditlogs');
const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { cookieOptions } = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');
const logEventAudit = require('../utils/eventlogs');

module.exports.retrieveUserProfile = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;

  const user = await userModel.retrieveById(userId);

  logger.info(`🔍 Successfully retrieved user info with ID: ${userId}`);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// user soft delete
module.exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;

  // Check if user exists
  const user = await userModel.retrieveById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete the user
  await userModel.softDeleteUser(userId);
  await logEventAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'user',
    entityId: userId,
    actionTypeId: AuditActions.DELETE,
    logText: `Soft deleted user with ID: ${userId}`,
  });

  logger.info(`User with ID: ${userId} has been soft deleted`);

  res.status(200).json({
    status: 'success',
    message: 'User soft deleted successfully',
  });
});

// admin soft delete users
module.exports.adminSoftDeleteUser = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;

  // Check if user exists
  const user = await userModel.retrieveById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete the user
  await userModel.softDeleteUser(userId);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'user',
    entityId: userId,
    actionTypeId: AuditActions.DELETE,
    logText: `Admin hard deleted user with ID: ${userId}`,
  });

  logger.info(`Admin soft deleted user with ID: ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'User soft deleted successfully',
  });
});

// admin can hard delete user
module.exports.adminHardDeleteUser = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;

  // Check if user exists
  const user = await userModel.retrieveById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Hard delete the user
  await userModel.hardDeleteUser(userId);

  // Log admin audit
  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'user',
    entityId: userId,
    actionTypeId: AuditActions.DELETE,
    logText: `Admin hard deleted user with ID: ${userId}`,
  });

  logger.info(`Admin hard deleted user with ID: ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'User hard deleted successfully',
  });
});

//get all users for admin
module.exports.getAllUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    statusFilter = null,
    roleFilter = null,
    ageMin = undefined,
    ageMax = undefined,
    genderFilter = undefined,
    languageCodeFilter = null,
  } = req.query;

  const filter = {};
  if (statusFilter) {
    filter.statusId = parseInt(statusFilter);
  }
  if (roleFilter) {
    filter.roleId = parseInt(roleFilter);
  }

  const result = await userModel.getAllUsers({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    search,
    filter,
    ageMin: ageMin ? parseInt(ageMin) : undefined,
    ageMax: ageMax ? parseInt(ageMax) : undefined,
    gender: genderFilter,
    languageCode: languageCodeFilter,
  });

  res.status(200).json({
    status: 'success',
    pageCount: Math.ceil(result.userCount / pageSize),
    data: result.users,
  });
});

// Update user profile username, first name, lastname, status
module.exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { username, firstName, lastName, languageCode = null } = req.body;

  const languageCodeRegex = /^[a-z]{2,3}-[A-Z]{2,3}$/;

  // Validate input
  if (!username || !firstName || !lastName) {
    throw new AppError('Username, first name, and last name are required', 400);
  }

  if (languageCode && !languageCodeRegex.test(languageCode)) {
    throw new AppError('Invalid language code provided', 400);
  }

  // Update user profile with status set to ACTIVE
  const updatedUser = await userModel.updateUserProfileWithStatus(userId, {
    username,
    firstName,
    lastName,
    languageCode,
    statusId: statusCodes.ACTIVE,
  });

  logger.info(`User profile updated for user ID: ${userId}`);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

module.exports.getRecentActivity = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const limit = parseInt(req.query.limit) || 5;

  const activities = await userModel.getRecentActivity(userId, limit);

  res.status(200).json({
    status: 'success',
    data: activities,
  });
});

module.exports.getUserQRStatistics = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const stats = await userModel.getUserQRStatistics(userId);
  res.status(200).json({ status: 'success', data: stats });
});

module.exports.getUserAudioStatistics = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const stats = await userModel.getUserAudioStatistics(userId);
  res.status(200).json({ status: 'success', data: stats });
});

module.exports.getSingleUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel.getUserById(userId);
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
