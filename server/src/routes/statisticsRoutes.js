/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Endpoints for retrieving various system statistics and analytics
 */

// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const statisticsController = require('../controllers/statisticsController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
// const {
//   getTeamMembersValidationRules,
//   joinTeamWithCodeValidationRules,
//   validate,
// } = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const statisticsRouter = express.Router();

statisticsRouter.use(jwtMiddleware.verifyToken);

/**
 * @swagger
 * /statistics/count-of-users:
 *   get:
 *     summary: Get user count statistics (admin only)
 *     tags: [Statistics]
 *     description: Returns simple user count statistics for dashboard. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeFilter
 *         schema:
 *           type: string
 *           enum: [today, month, year, custom]
 *         description: Time-based filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom time filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom time filter
 *       - in: query
 *         name: statusFilter
 *         schema:
 *           type: integer
 *         description: Filter by user status ID
 *     responses:
 *       200:
 *         description: User count statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Statistics for getting the count of all users ( Filter by per day, per month, etc. )
statisticsRouter.get(
  '/count-of-users',
  authMiddleware.verifyIsAdmin,
  statisticsController.getCountOfUsers,
);

/**
 * @swagger
 * /statistics/display-member-sign-ups:
 *   get:
 *     summary: Get member sign-up statistics with demographic filters (admin only)
 *     tags: [Statistics]
 *     description: Returns member sign-up statistics with filtering by age group, gender, and date range. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [M, F, All]
 *           default: All
 *         description: Gender filter
 *       - in: query
 *         name: ageGroup
 *         schema:
 *           type: string
 *           enum: [Children, Youth, Adults, Seniors, All]
 *           default: All
 *         description: Age group filter
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, month, year]
 *           default: day
 *         description: Time granularity for grouping results
 *     responses:
 *       200:
 *         description: Member sign-up statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                       signUpCount:
 *                         type: integer
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Statistics for getting the count of users ( Can filter by gender, by age group, per day, per month, per year, etc. )
statisticsRouter.get(
  '/display-member-sign-ups',
  authMiddleware.verifyIsAdmin,
  statisticsController.getDisplayMemberSignUps,
);

/**
 * @swagger
 * /statistics/display-common-languages-used:
 *   get:
 *     summary: Get most common languages used by members (admin only)
 *     tags: [Statistics]
 *     description: Returns statistics on the most commonly used languages by members. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Limit number of results (use 'all' for no limit)
 *     responses:
 *       200:
 *         description: Language usage statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       languageCode:
 *                         type: string
 *                       languageName:
 *                         type: string
 *                       userCount:
 *                         type: integer
 *       400:
 *         description: Invalid limit parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Statistics for getting the most common languages used by users
statisticsRouter.get(
  '/display-common-languages-used',
  authMiddleware.verifyIsAdmin,
  statisticsController.getDisplayCommonLanguagesUsed,
);

/**
 * @swagger
 * /statistics/scans-per-exhibit:
 *   get:
 *     summary: Get QR code scan statistics per exhibit
 *     tags: [Statistics]
 *     description: Returns statistics on QR code scans per exhibit with date filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           default: day
 *         description: Time granularity
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: QR scan statistics per exhibit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       exhibitId:
 *                         type: string
 *                       exhibitTitle:
 *                         type: string
 *                       scanCount:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */

// Display trend of QR code being scanned
statisticsRouter.get(
  '/scans-per-exhibit',
  statisticsController.getScansPerExhibit,
);

/**
 * @swagger
 * /statistics/audio-completion-rates:
 *   get:
 *     summary: Get audio completion rate statistics
 *     tags: [Statistics]
 *     description: Returns statistics on audio completion rates across exhibits.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audio completion rate statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       exhibitId:
 *                         type: string
 *                       exhibitTitle:
 *                         type: string
 *                       completionRate:
 *                         type: number
 *                         format: float
 *       401:
 *         description: Unauthorized
 */

statisticsRouter.get(
  '/audio-completion-rates',
  statisticsController.getAudioCompletionRates,
);

/**
 * @swagger
 * /statistics/audio-plays-per-exhibit:
 *   get:
 *     summary: Get audio play statistics per exhibit
 *     tags: [Statistics]
 *     description: Returns statistics on audio plays per exhibit.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audio play statistics per exhibit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       exhibitId:
 *                         type: string
 *                       exhibitTitle:
 *                         type: string
 *                       playCount:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */

statisticsRouter.get(
  '/audio-plays-per-exhibit',
  statisticsController.getAudioPlaysPerExhibit,
);

/**
 * @swagger
 * /statistics/average-listen-duration:
 *   get:
 *     summary: Get average audio listen duration statistics
 *     tags: [Statistics]
 *     description: Returns statistics on average listen duration for audio across exhibits.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Average listen duration statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       exhibitId:
 *                         type: string
 *                       exhibitTitle:
 *                         type: string
 *                       averageDuration:
 *                         type: number
 *                         format: float
 *                         description: Average duration in seconds
 *       401:
 *         description: Unauthorized
 */

statisticsRouter.get(
  '/average-listen-duration',
  statisticsController.getAverageListenDuration,
);

/**
 * @swagger
 * /statistics/audio-completion-rates-time-series:
 *   get:
 *     summary: Get audio completion rates time series data
 *     tags: [Statistics]
 *     description: Returns time series data for audio completion rates, suitable for line charts.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Time series data for audio completion rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       completionRate:
 *                         type: number
 *                         format: float
 *       401:
 *         description: Unauthorized
 */

// Time series endpoints for line charts
statisticsRouter.get(
  '/audio-completion-rates-time-series',
  statisticsController.getAudioCompletionRatesTimeSeries,
);

/**
 * @swagger
 * /statistics/average-listen-duration-time-series:
 *   get:
 *     summary: Get average listen duration time series data
 *     tags: [Statistics]
 *     description: Returns time series data for average listen duration, suitable for line charts.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Time series data for average listen duration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       averageDuration:
 *                         type: number
 *                         format: float
 *                         description: Average duration in seconds
 *       401:
 *         description: Unauthorized
 */

statisticsRouter.get(
  '/average-listen-duration-time-series',
  statisticsController.getAverageListenDurationTimeSeries,
);

module.exports = statisticsRouter;
