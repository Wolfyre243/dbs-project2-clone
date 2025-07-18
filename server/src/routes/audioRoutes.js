// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Import controllers
const audioController = require('../controllers/audioController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../Uploads/audio'));
  },
  filename: (req, file, cb) => {
    const buf = crypto.randomBytes(8);
    const uniqueName =
      Date.now() + '-' + buf.toString('hex') + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

//const upload = multer({ storage });

// The API only allows for wav files
const upload = multer({
  storage,
  /*  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/wav') {
      cb(null, true);
    } else {
      cb(new Error('Only .wav files are allowed'), false);
    }
  }, */
});
// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const audioRouter = express.Router();

//authRouter.post('/upload', upload.single('file'), audioController.uploadAudio);

audioRouter.post(
  '/upload',
  //jwtMiddleware,
  //rateLimiter,
  upload.single('file'),
  audioController.uploadAudio,
);

module.exports = audioRouter;
