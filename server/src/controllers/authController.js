// Import dependencies
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoRandomString = require('crypto-random-string').default;

// Import services
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { encryptData, decryptData } = require('../utils/encryption');

const {
  cookieOptions,
  verifySK,
  verifyTokenDuration,
  tokenAlgorithm,
} = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');

const Roles = require('../configs/roleConfig');
const statusCodes = require('../configs/statusCodes');

module.exports.guestLogin = catchAsync(async (req, res, next) => {
  const roleId = Roles.GUEST; // 1 for Guest

  // Generate a username for guests
  const username = 'Guest_' + cryptoRandomString({ length: 24 }); // 30 char long

  const newUser = await userModel.createGuest(username, roleId);

  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  const session = await sessionModel.create({
    userId: newUser.userId,
    deviceInfo,
  });

  logger.info(`Guest login with username: ${username}`);

  res.locals.userId = newUser.userId;
  res.locals.roleId = roleId;
  res.locals.sessionId = session.sessionId;

  return next();
});

module.exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await userModel.retrieveByUsername(username);

  if (!user) {
    throw new AppError('Login: Invalid username or password.', 400);
  }

  const passwordRecord = await userModel.retrievePasswordByUserId(user.userId);

  const isMatch = await bcrypt.compare(password, passwordRecord.password);
  if (!isMatch) {
    throw new AppError('Login: Invalid username or password.', 400);
  }

  // Create session for user
  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  const session = await sessionModel.create({
    userId: user.userId,
    deviceInfo,
  });

  logger.info(`🔒 User login with username: ${username}`);

  res.locals.userId = user.userId;
  res.locals.roleId = user.userRoles.roleId;
  res.locals.sessionId = session.sessionId;

  return next();
});

module.exports.register = catchAsync(async (req, res, next) => {
  const {
    username,
    password,
    confirmPassword,
    firstName,
    lastName,
    dob,
    gender,
    languageCode,
    email,
  } = req.body;

  const jwtConfig = {
    algorithm: tokenAlgorithm,
    expiresIn: verifyTokenDuration,
  };

  // Check if passwords match
  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match.', 400);
  }

  // Hash/Encrypt data for privacy and security
  const passwordHash = bcrypt.hashSync(
    password,
    parseInt(process.env.BCRYPT_SALTROUNDS),
  );
  const encryptedEmail = encryptData(email);

  const roleId = Roles.MEMBER;

  const { user, email: registeredEmail } = await userModel.create({
    username,
    passwordHash,
    firstName,
    lastName,
    dob,
    gender,
    languageCode,
    encryptedEmail,
    roleId,
  });

  // Create session for user
  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  const session = await sessionModel.create({
    userId: user.userId,
    deviceInfo,
  });

  logger.info(
    `🖊️ Successfully registered member with username: ${user.username}`,
  );

  // Craft & Send Email
  const payload = {
    userId: registeredEmail.userId,
    emailId: registeredEmail.emailId,
    createdAt: new Date(Date.now()),
  };

  const verificationToken = jwt.sign(payload, verifySK, jwtConfig);
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  res.locals.email = decryptData(registeredEmail.email);
  res.locals.mailContent = {
    subject: 'Verify your email',
    html: `
      <p>Hi ${user.username},<br/><br/>
      Please verify your email by clicking the link below:<br/><a href="${verifyUrl}">Verify Email</a><br/><br/>
      The link will expire in ${verifyTokenDuration}.<br/><br/>
      Regards,<br/>
      The SDC Team</p>
    `,
  };

  res.locals.userId = user.userId;
  res.locals.roleId = roleId;
  res.locals.sessionId = session.sessionId;

  return next();
});

module.exports.logout = catchAsync(async (req, res, next) => {
  const { sessionId } = res.locals;

  await sessionModel.invalidateById(sessionId);

  res.clearCookie('refreshToken', cookieOptions);
  res.sendStatus(204);
});

module.exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  try {
    if (!token) throw new AppError('No verification token provided', 400);

    const payload = jwt.verify(token, verifySK);

    logger.debug(
      `🕐 Verification token expires in ${((payload.exp * 1000 - Date.now()) / (60 * 1000)).toFixed(2)} mins`,
    );

    const { userId, emailId } = payload;
    if (!userId || !emailId)
      throw new AppError('Invalid verification token provided', 400);

    const user = await userModel.retrieveById(userId);
    if (user.status.statusId === statusCodes.VERIFIED)
      throw new AppError('User already verified', 409);

    await userModel.verifyUser(userId);

    res.status(204).send();
  } catch (error) {
    console.log('Error verifying verification token: ', error.message);

    if (error.name === 'TokenExpiredError') {
      throw new AppError('Verification token expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid verification token provided', 403);
    }

    throw error;
  }
});

module.exports.generateVerificationMail = catchAsync(async (req, res, next) => {
  const { emailId } = req.body;

  const jwtConfig = {
    algorithm: tokenAlgorithm,
    expiresIn: verifyTokenDuration,
  };

  const registeredEmail = await userModel.retrieveEmailById(emailId);
  const user = await userModel.retrieveById(registeredEmail.userId);

  const payload = {
    userId: registeredEmail.userId,
    emailId: registeredEmail.emailId,
    createdAt: new Date(Date.now()),
  };

  const verificationToken = jwt.sign(payload, verifySK, jwtConfig);
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  res.locals.email = decryptData(registeredEmail.email);
  res.locals.mailContent = {
    subject: 'Verify your email',
    html: `
      <p>Hi ${user.username},<br/><br/>
      Please verify your email by clicking the link below:<br/><a href="${verifyUrl}">Verify Email</a><br/><br/>
      The link will expire in ${verifyTokenDuration}.<br/><br/>
      Regards,<br/>
      The SDC Team</p>
    `,
  };

  res.locals.statusCode = 200;

  return next();
});
