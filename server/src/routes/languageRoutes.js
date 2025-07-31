/**
 * @swagger
 * tags:
 *   name: Language
 *   description: Endpoints for retrieving supported languages
 */

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

// languageRouter.use(jwtMiddleware.verifyToken);

/**
 * @swagger
 * /language/:
 *   get:
 *     summary: Get all supported language codes
 *     tags: [Language]
 *     description: Returns an array of all active language codes supported by the system. This endpoint is public and does not require authentication.
 *     responses:
 *       200:
 *         description: List of supported language codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["en", "zh", "ms", "ta"]
 *                   description: Array of language codes
 */

languageRouter.get('/', languageController.retrieveAllLanguages);

/**
 * @swagger
 * /language/name:
 *   get:
 *     summary: Get all supported languages with names
 *     tags: [Language]
 *     description: Returns an array of all active languages with their codes and full names. This endpoint is public and does not require authentication.
 *     responses:
 *       200:
 *         description: List of supported languages with details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       languageCode:
 *                         type: string
 *                         example: en
 *                         description: Language code
 *                       languageName:
 *                         type: string
 *                         example: English
 *                         description: Full language name
 *                       statusId:
 *                         type: integer
 *                         example: 1
 *                         description: Status ID (1 = active)
 */

languageRouter.get('/name', languageController.retrieveAllLanguagesWithName);

module.exports = languageRouter;
