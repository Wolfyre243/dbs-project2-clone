// Import dependencies
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

module.exports.uploadAudio = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const fileName = req.file.filename;
  console.log('New name of file: ', fileName);
  res.status(200).json({ message: 'Successfully uploaded file' });
});
