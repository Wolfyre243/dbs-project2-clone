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
const exhibitController = require('../controllers/exhibitController');
const {
  createExhibitionValidationRules,
  validate,
} = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const exhibitRouter = express.Router();

exhibitRouter.use(jwtMiddleware.verifyToken);

// Admin Exhibit Routes
// router.post('/create-exhibit', exhibitController.createExhibit);             // -- C
exhibitRouter.get('/:exhibitId', exhibitController.getSingleExhibit); // -- R

// QR code token validation route
exhibitRouter.post(
  '/:exhibitId/validate-qr-token',
  exhibitController.validateQrToken,
);
exhibitRouter.put(
  '/',
  authMiddleware.verifyIsAdmin,
  exhibitController.updateExhibit,
); // -- U
exhibitRouter.delete(
  '/:exhibitId',
  authMiddleware.verifyIsAdmin,
  exhibitController.deleteExhibit,
); // -- D

exhibitRouter.post(
  '/',
  createExhibitionValidationRules(),
  validate,
  authMiddleware.verifyIsAdmin,
  exhibitController.createExhibit,
);

exhibitRouter.get(
  '/',
  authMiddleware.verifyIsAdmin,
  exhibitController.getAllExhibits,
);

module.exports = exhibitRouter;
