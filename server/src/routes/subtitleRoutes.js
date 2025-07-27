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

subtitleRouter.use(jwtMiddleware.verifyToken);

subtitleRouter.get(
  '/exhibit/:exhibitId',
  subtitleController.getSubtitlesByExhibitId,
);

// -- Admin Routes --

subtitleRouter.post(
  '/',
  authMiddleware.verifyIsAdmin,
  createSubtitleValidationRules(),
  validate,
  subtitleController.createSubtitle,
);

// Update subtitle
subtitleRouter.put(
  '/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.updateSubtitle,
);

// archive subtitle by setting status to archived
subtitleRouter.put(
  '/archive/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.archiveSubtitle,
);
//unarchive subtitle by setting status to active
subtitleRouter.put(
  '/unarchive/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.unarchiveSubtitle,
);
// soft delete subtitle by setting status to deleted
subtitleRouter.delete(
  '/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.softDeleteSubtitle,
);
// Get all subtitles for admin
subtitleRouter.get(
  '/',
  authMiddleware.verifyIsAdmin,
  subtitleController.getAllSubtitles,
);

subtitleRouter.get(
  '/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.getSubtitleById,
);

// Hard delete subtitle by removing the record
subtitleRouter.delete(
  '/hard-delete/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.hardDeleteSubtitle,
);

module.exports = subtitleRouter;
