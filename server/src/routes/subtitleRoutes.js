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

// subtitleRouter.post(
//   '/',
//   createSubtitleValidationRules(),
//   validate,
//   subtitleController.createSubtitle,
// );

// archive subtitle by setting status to archived
subtitleRouter.put('/archive/:subtitleId', subtitleController.archiveSubtitle);
//unarchive subtitle by setting status to active
subtitleRouter.put(
  '/unarchive/:subtitleId',
  subtitleController.unarchiveSubtitle,
);
// soft delete subtitle by setting status to deleted
subtitleRouter.delete('/:subtitleId', subtitleController.softDeleteSubtitle);
// Get all subtitles for admin
subtitleRouter.get('/', subtitleController.getAllSubtitles);

//get single subtitle by ID
subtitleRouter.get('/:subtitleId', subtitleController.getSubtitleById);

// Hard delete subtitle by removing the record
subtitleRouter.delete(
  '/hard-delete/:subtitleId',
  subtitleController.hardDeleteSubtitle,
);

module.exports = subtitleRouter;
