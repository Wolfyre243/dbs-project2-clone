// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const subtitleController = require('../controllers/subtitleController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const {
  createSubtitleValidationRules,
  validate,
} = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const subtitleRouter = express.Router();

subtitleRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

subtitleRouter.post(
  '/',
  createSubtitleValidationRules(),
  validate,
  subtitleController.createSubtitle,
);

subtitleRouter.get('/', audioController.getAllSubtitles);

module.exports = subtitleRouter;
