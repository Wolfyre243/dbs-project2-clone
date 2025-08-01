// Define validators related to users here to be used in middleware, or as middleware.
const { body, param, query, check } = require('express-validator');

// For validators, do not define as optional except if optional for ALL instances
// .optional property will be set in the validators middleware.

// Custom sanitizer that does NOT escape single or double quotes
const customSanitizer = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;'); // does not escape ' or "
};

// Return from functions to prevent mutation
module.exports.textValidation = () =>
  body('text')
    .trim()
    // .matches(/^[a-zA-Z0-9 @#$%'"!?.,;:/-_]+$/)
    // .withMessage('Text must contain only letters, numbers and spaces')
    .customSanitizer(customSanitizer);

module.exports.languageCodeValidation = () =>
  body('languageCode')
    .trim()
    .matches(/^[a-z]{2,3}-[A-Z]{2,3}$/)
    .withMessage('Language must be in the format ab-CD')
    .customSanitizer(customSanitizer);
