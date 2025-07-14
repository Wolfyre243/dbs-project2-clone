// Import dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptoRandomString = require("crypto-random-string").default;

// Import services
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
// const { encryptData, decryptData } = require('../lib/encryption');

const {
  cookieOptions,
  verifySK,
  verifyTokenDuration,
  tokenAlgorithm,
} = require("../configs/authConfig");
const catchAsync = require("../utils/catchAsync");

const Roles = require("../configs/roleConfig");

module.exports.guestLogin = catchAsync(async (req, res, next) => {
  const { firstName } = req.body;
  const roleId = Roles.GUEST; // 1 for Guest

  // Generate a username for guests
  const username = "guest_" + cryptoRandomString({ length: 14 }); // 20 char long

  if (!firstName) {
    throw new AppError("Name is required!", 400);
  }

  const newUser = await userModel.create(username, firstName, roleId);

  logger.info(`Guest login with username: ${username}`);

  res.locals.userId = newUser.userId;
  res.locals.roleId = newUser.roleId;

  return next();
});

module.exports.adminLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const userData = await userModel.retrieveByUsername(username);

  if (!userData) {
    throw new AppError("Login: Invalid username or password", 400);
  }

  if (userData.roleId != Roles.ADMIN && userData.roleId != Roles.SUPERADMIN) {
    throw new AppError("Only ADMINs can log in.", 403);
  }

  const isMatch = await bcrypt.compare(password, userData.password);

  if (!isMatch) {
    throw new AppError("Login: Invalid username or password.", 400);
  }

  logger.info(`Admin login with username: ${username}`);

  res.locals.userId = userData.userId;
  res.locals.roleId = userData.roleId;

  return next();
});

module.exports.logout = async (req, res, next) => {
  res.clearCookie("refreshToken", cookieOptions);
  res.sendStatus(204);
};
