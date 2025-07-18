// Import dependencies
const jwt = require('jsonwebtoken');

// Import models
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// JWT Configuration
const {
  accessSK,
  refreshSK,
  accessTokenDuration,
  refreshTokenDuration,
  tokenAlgorithm,
  cookieOptions,
} = require('../configs/authConfig');

module.exports.generateRefreshToken = catchAsync(async (req, res, next) => {
  console.log('Generating Refresh Token...');

  const payload = {
    userId: res.locals.userId,
    sessionId: res.locals.sessionId,
    createdAt: new Date(Date.now()),
  };

  const jwtConfig = {
    algorithm: tokenAlgorithm,
    expiresIn: refreshTokenDuration,
  };

  const token = jwt.sign(payload, refreshSK, jwtConfig);
  res.locals.refreshToken = token;

  logger.info(
    `✅ Sucessfully generated refresh token for userId: ${res.locals.userId}`,
  );
  return next();
});

module.exports.generateAccessToken = catchAsync(async (req, res, next) => {
  console.log('Generating Access Token...');

  const payload = {
    userId: res.locals.userId,
    roleId: res.locals.roleId,
    sessionId: res.locals.sessionId,
    createdAt: new Date(Date.now()),
  };

  const jwtConfig = {
    algorithm: tokenAlgorithm,
    expiresIn: accessTokenDuration,
  };

  // Sign token
  const token = jwt.sign(payload, accessSK, jwtConfig);
  res.locals.accessToken = token;

  logger.info(
    `✅ Successfully generated access token for userId: ${res.locals.userId}`,
  );
  return next();
});

module.exports.verifyToken = catchAsync(async (req, res, next) => {
  console.log('[VERIFY ACCESS]');
  // Bearer <token>
  const token = req.headers['authorization']?.split(' ')[1];

  try {
    if (!token) {
      throw new AppError('Unauthorized: No access token', 401);
    }
    const payload = jwt.verify(token, accessSK);

    logger.debug(
      `🕐 Access token expires in ${((payload.exp * 1000 - Date.now()) / (60 * 1000)).toFixed(2)} mins`,
    );

    res.locals.user = {
      userId: payload.userId,
      roleId: payload.roleId,
      sessionId: payload.sessionId,
    };

    logger.info(
      `✅ Access token successfully verified for userId: ${res.locals.user.userId}`,
    );
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid access token provided', 403);
    }

    throw error;
  }
});

module.exports.verifyRefreshToken = catchAsync(async (req, res, next) => {
  console.log('[VERIFY REFRESH]');
  const token = req.cookies.refreshToken;

  try {
    console.log('Checking refresh token...');

    if (!token) {
      throw new AppError('Unauthorised: No refresh token', 401);
    }

    const payload = jwt.verify(token, refreshSK);

    logger.debug(
      `🕐 Refresh token expires in ${((payload.exp * 1000 - Date.now()) / (60 * 1000)).toFixed(2)} mins`,
    );

    const user = await userModel.retrieveById(payload.userId);

    res.locals.userId = payload.userId;
    res.locals.sessionId = payload.sessionId;
    res.locals.roleId = user.roleId;

    logger.info(
      `✅ Successfully verified refresh token for userId: ${res.locals.userId}`,
    );
    return next();
  } catch (error) {
    // Automatically clear cookie if cookie is invalid
    res.clearCookie('refreshToken', cookieOptions);

    if (error.name === 'TokenExpiredError') {
      // Invalidate session if expired
      const { sessionId } = jwt.decode(token);
      await sessionModel.invalidateById(sessionId);
      throw new AppError('Refresh token expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid refresh token provided', 403);
    }

    throw error;
  }
});

module.exports.setTokens = catchAsync(async (req, res, next) => {
  // Destructure from res.locals and set into respective places
  const { accessToken, refreshToken } = res.locals;

  logger.debug(
    `✅ Setting access token and refresh token for userId: ${res.locals.userId}`,
  );
  res
    .status(200)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({ accessToken });
});
