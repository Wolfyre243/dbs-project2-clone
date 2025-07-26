//-----------------------------------IMPORT-------------------------
// Import dependencies
const express = require('express');
const multer = require('multer');

// Import controllers
const imageController = require('../controllers/imageController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const {
  //   createImageValidationRules,
  validate,
} = require('../middlewares/validators');

const storage = multer.memoryStorage();

// The API only allows for wav files
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .png or .jpg files are allowed'), false);
    }
  },
});

//-----------------------------SET UP ROUTES------------------------
// Create the router
const imageRouter = express.Router();

imageRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

// Tested
imageRouter.get('/', imageController.getAllImages);

// Tested
imageRouter.get('/:imageId', imageController.getImageById);

// Tested
imageRouter.post(
  '/upload',
  upload.single('image'),
  imageController.uploadImage,
);

// imageRouter.put('/:imageId', imageController.updateImage);

imageRouter.put('/archive/:imageId', imageController.archiveImage);
imageRouter.put('/unarchive/:imageId', imageController.unarchiveImage);

imageRouter.delete('/:imageId', imageController.deleteImage);
imageRouter.delete('/hard-delete/:imageId', imageController.hardDeleteImage);

module.exports = imageRouter;

// TODO: Audit log import & validations;
