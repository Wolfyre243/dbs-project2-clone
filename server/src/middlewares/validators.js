const {
  body,
  validationResult,
  param,
  query,
  check,
} = require('express-validator');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Import user validators
const {
  usernameValidation,
  emailValidation,
  passwordValidation,
  firstNameValidation,
  lastNameValidation,
  dobValidation,
  genderValidation,
  userLanguageCodeValidation,
} = require('../validators/userValidators');

const {
  titleValidation,
  descriptionValidation,
} = require('../validators/exhibitValidators');

const {
  textValidation,
  languageCodeValidation,
} = require('../validators/audioValidators');

const validate = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstErr = errors.array()[0];
    logger.warning('[VALIDATOR] ' + firstErr.msg);
    throw new AppError(firstErr.msg, 400);
  }
  return next();
});

// DEFINE RULESETS
const userValidationRules = () => [
  usernameValidation().notEmpty().withMessage('Username is required'),
  emailValidation().notEmpty().withMessage('Email is required'),
  passwordValidation().notEmpty().withMessage('Password is required'),
  firstNameValidation().notEmpty().withMessage('First Name is required'),
  lastNameValidation().notEmpty().withMessage('Last Name is required'),
  dobValidation().notEmpty().withMessage('Date of Birth is required'),
  genderValidation(),
  languageCodeValidation(),
];

const loginValidationRules = () => [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const createExhibitionValidationRules = () => [
  titleValidation().notEmpty().withMessage('Title is required'),
  descriptionValidation(),
  body('imageId').notEmpty().withMessage('Image ID is required'),
];

const createSubtitleValidationRules = () => [
  textValidation().notEmpty().withMessage('Text is required'),
  languageCodeValidation().notEmpty().withMessage('Language Code is required'),
];

const generateAudioValidationRules = () => [
  textValidation().notEmpty().withMessage('Text is required'),
  languageCodeValidation().notEmpty().withMessage('Language Code is required'),
];

// const createImageValidationRules = () => [
//   body('fileLink').notEmpty().withMessage('File link is required'),
//   body('fileName').notEmpty().withMessage('File name is required'),
// ];

module.exports = {
  validate,

  // Export Rulesets
  userValidationRules,
  loginValidationRules,
  createExhibitionValidationRules,
  generateAudioValidationRules,
  createSubtitleValidationRules,
  // createImageValidationRules,
};
