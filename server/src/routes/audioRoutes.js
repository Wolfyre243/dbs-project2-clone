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
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // TODO: Add a better naming convention
    const buf = crypto.randomBytes(8);
    const uniqueName =
      Date.now() + '-' + buf.toString('hex') + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const authRouter = express.Router();

authRouter.post('/upload', upload.single('file'), audioController.uploadAudio);

module.exports = authRouter;
