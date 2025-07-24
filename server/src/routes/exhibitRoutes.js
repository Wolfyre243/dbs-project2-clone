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

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'audio/wav' ||
      file.mimetype === 'audio/x-wav' ||
      file.mimetype === 'audio/wave' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .wav or .jpg files are allowed'), false);
    }
  },
});

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const exhibitRouter = express.Router();

exhibitRouter.use(jwtMiddleware.verifyToken);

// Admin Exhibit Routes
// router.post('/create-exhibit', exhibitController.createExhibit);             // -- C
exhibitRouter.get('/:exhibitId', exhibitController.getSingleExhibit); // -- R
exhibitRouter.put('/', exhibitController.updateExhibit); // -- U
exhibitRouter.delete('/:exhibitId', exhibitController.deleteExhibit); // -- D

exhibitRouter.post(
  '/',
  createExhibitionValidationRules(),
  validate,
  authMiddleware.verifyIsAdmin,
  exhibitController.createExhibit,
);

exhibitRouter.get('/', exhibitController.getAllExhibits);

module.exports = exhibitRouter;
