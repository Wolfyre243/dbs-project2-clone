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
exhibitRouter.get('/get-byId/:exhibitId', exhibitController.getSingleExhibit); // -- R
exhibitRouter.put('/update-exhibit', exhibitController.updateExhibit); // -- U
exhibitRouter.delete('/delete/:exhibitId', exhibitController.deleteExhibit); // -- D
// router.post(
//   '/create-exhibit',
//   authMiddleware.verifyIsAdmin,
//   upload.single('audio'),
//   audioController.uploadAudio,
//   audioController.convertTextToAudio,
//   exhibitController.createExhibit
// );

// Creating exhibit with TTS in mind first (add STT next time)
/**
 * Request Body:
 * {
 *   ...
 *   tts: [
 *     { text: String, languageCode: String },
 *     ...
 *   ]
 * }
 */
exhibitRouter.post(
  '/',
  createExhibitionValidationRules(),
  validate,
  authMiddleware.verifyIsAdmin,
  // upload.single('audio'),
  // audioController.uploadAudio,
  audioController.convertMultiTextToAudio,
  exhibitController.createExhibit,
);

exhibitRouter.get('/get-everything', exhibitController.getAllExhibits);

module.exports = exhibitRouter;
