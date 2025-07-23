// Define validators related to users here to be used in middleware, or as middleware.
const { body, param, query, check } = require('express-validator');

// For validators, do not define as optional except if optional for ALL instances
// .optional property will be set in the validators middleware.

// Return from functions to prevent mutation
module.exports.usernameValidation = () =>
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .escape();

module.exports.emailValidation = () =>
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must provide a valid email address')
    .normalizeEmail()
    .escape();

module.exports.passwordValidation = () =>
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters')
    /**
     * (?=.*[a-z]): At least one lowercase character
     * (?=.*[A-Z]): At least one uppercase character
     * (?=.*\d): At least one digit
     * (?=.*[!@$%&*?]): At least one of the special characters inside
     * [A-Za-z\d@$!%*?&]: Allow those characters
     * {6,50}: 6- 50 characters long
     */
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,50}$/,
    )
    .withMessage(
      'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    )
    .escape();

module.exports.firstNameValidation = () =>
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .escape();

module.exports.lastNameValidation = () =>
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
    .escape();

module.exports.dobValidation = () =>
  body('dob')
    .trim()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Date of birth cannot be a future date');
      }
      return true;
    })
    .escape();

module.exports.genderValidation = () =>
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['M', 'F'])
    .withMessage("Gender must be either 'M' or 'F'")
    .escape();

module.exports.userLanguageCodeValidation = () =>
  body('languageCode')
    .trim()
    .notEmpty()
    .withMessage('Language code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Language code must be exactly 3 characters')
    .isAlpha()
    .withMessage('Language code must contain only letters')
    .escape();
