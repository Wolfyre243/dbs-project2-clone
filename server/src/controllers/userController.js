// Import dependencies
const jwt = require('jsonwebtoken');

// Import services
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const { cookieOptions } = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');

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
