// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Import controllers
const audioController = require('../controllers/audioController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const languageController = require('../controllers/languageController');
const {
  createExhibitionValidationRules,
  validate,
} = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const languageRouter = express.Router();

languageRouter.use(jwtMiddleware.verifyToken);

languageRouter.get('/', languageController.retrieveAllLanguages);
languageRouter.get('/name', languageController.retrieveAllLanguagesWithName);

module.exports = languageRouter;
