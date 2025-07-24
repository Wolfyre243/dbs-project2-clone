// Define validators related to users here to be used in middleware, or as middleware.
const { body, param, query, check } = require('express-validator');

// For validators, do not define as optional except if optional for ALL instances
// .optional property will be set in the validators middleware.

// Return from functions to prevent mutation
module.exports.titleValidation = () =>
  body('title')
    .trim()
    .matches(/^[a-zA-Z0-9 ]+$/)
    .withMessage('Title must contain only letters, numbers and spaces')
    .escape();

module.exports.descriptionValidation = () =>
  body('description')
    .trim()
    .matches(/^[a-zA-Z0-9 ]+$/)
    .withMessage('Description must contain only letters, numbers and spaces')
    .escape();
