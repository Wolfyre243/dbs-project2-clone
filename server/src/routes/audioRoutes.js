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
const {
  generateAudioValidationRules,
  validate,
} = require('../middlewares/validators');

const storage = multer.memoryStorage();

// The API only allows for wav files
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'audio/wav' ||
      file.mimetype === 'audio/x-wav' ||
      file.mimetype === 'audio/wave'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .wav files are allowed'), false);
    }
  },
});
// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const audioRouter = express.Router();

audioRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

//authRouter.post('/upload', upload.single('file'), audioController.uploadAudio);

audioRouter.post(
  '/upload',
  //  TODO: Validation
  //rateLimiter,
  upload.single('file'),
  audioController.uploadAudio,
);

audioRouter.post(
  '/generate',
  // TODO: Rate limit
  generateAudioValidationRules(),
  validate,
  audioController.convertTextToAudio,
);

// audioRouter.get('/subtitles', audioController.getAllSubtitles);

audioRouter.get('/:audioId', audioController.getSingleAudio);

// Archive audio
audioRouter.put('/archive/:audioId', audioController.archiveAudio);

// Hard delete audio by removing the record
audioRouter.delete('/hard-delete/:audioId', audioController.hardDeleteAudio);

//unarchive audio
audioRouter.put('/unarchive/:audioId', audioController.unarchiveAudio);

//soft delete audio
audioRouter.delete('/:audioId', audioController.softDeleteAudio);

// Get all audio for admin
audioRouter.get('/', audioController.getAllAudio);
module.exports = audioRouter;
