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

// Statistics for getting the count of all users ( Filter by per day, per month, etc. )
statisticsRouter.get(
  '/count-of-users',
  authMiddleware.verifyIsAdmin,
  statisticsController.getCountOfUsers,
);

// Statistics for getting the count of users ( Can filter by gender, by age group, per day, per month, per year, etc. )
statisticsRouter.get(
  '/display-member-sign-ups',
  authMiddleware.verifyIsAdmin,
  statisticsController.getDisplayMemberSignUps,
);

// Statistics for getting the most common languages used by users
statisticsRouter.get(
  '/display-common-languages-used',
  authMiddleware.verifyIsAdmin,
  statisticsController.getDisplayCommonLanguagesUsed,
);

// Display trend of QR code being scanned
statisticsRouter.get(
  '/scans-per-exhibit',
  statisticsController.getScansPerExhibit,
);

statisticsRouter.get(
  '/audio-completion-rates',
  statisticsController.getAudioCompletionRates,
);

statisticsRouter.get(
  '/audio-plays-per-exhibit',
  statisticsController.getAudioPlaysPerExhibit,
);

statisticsRouter.get(
  '/average-listen-duration',
  statisticsController.getAverageListenDuration,
);

module.exports = statisticsRouter;
