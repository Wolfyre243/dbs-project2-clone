// Define validators related to users here to be used in middleware, or as middleware.
const { body, param, query, check } = require('express-validator');

// For validators, do not define as optional except if optional for ALL instances
// .optional property will be set in the validators middleware.

// Return from functions to prevent mutation
module.exports.titleValidation = () =>
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters')
    .isAlphanumeric()
    .withMessage('Title must contain only letters and numbers')
    .escape();

module.exports.descriptionValidation = () =>
  body('description')
    .trim()
    .isAlphanumeric()
    .withMessage('Description must contain only letters and numbers')
    .escape();
