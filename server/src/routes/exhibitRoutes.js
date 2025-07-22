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

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const audioRouter = express.Router();

audioRouter.use(jwtMiddleware.verifyToken);

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

// Admin Exhibit Routes

router.get('/get-byId/:exhibitId', exhibitController.getSingleExhibit); // -- R
router.put('/update-exhibit', exhibitController.updateExhibit); // -- U
router.delete('/delete/:exhibitId', exhibitController.deleteExhibit); // -- D
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
router.post(
  '/create-exhibit',
  authMiddleware.verifyIsAdmin,
  upload.single('audio'),
  audioController.uploadAudio,
  audioController.convertTextToAudio,
  exhibitController.createExhibit,
);

router.get('/get-everything', exhibitController.getAllExhibits);

module.exports = audioRouter;
