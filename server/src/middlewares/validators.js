const {
  body,
  validationResult,
  param,
  query,
  check,
} = require('express-validator');
const logger = require('../utils/logger');

// Import user validators
const {
  usernameValidation,
  emailValidation,
  passwordValidation,
  firstNameValidation,
  lastNameValidation,
  dobValidation,
  genderValidation,
  languageCodeValidation,
} = require('../validators/userValidators');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const {
  titleValidation,
  descriptionValidation,
} = require('../validators/exhibitValidators');

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
];

module.exports = {
  validate,

  // Export Rulesets
  userValidationRules,
  loginValidationRules,
  createExhibitionValidationRules,
};
