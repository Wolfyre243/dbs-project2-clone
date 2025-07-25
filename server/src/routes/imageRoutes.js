//-----------------------------------IMPORT-------------------------
// Import dependencies
const express = require('express');

// Import controllers
const imageController = require('../controllers/imageController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const { createImageValidationRules, validate } = require('../middlewares/validators');

//-----------------------------SET UP ROUTES------------------------
// Create the router
const imageRouter = express.Router();

imageRouter.use(jwtMiddleware.verifyToken /* ,authMiddleware.verifyIsAdmin */);

// Tested
imageRouter.get('/', imageController.getAllImages);

// Tested
imageRouter.get('/:imageId', imageController.getImageById);

// Tested
imageRouter.post('/create', 
    createImageValidationRules(),
    validate,
    imageController.createImage);

// Tested
imageRouter.put('/update-image/:imageId', 
    imageController.updateImage);
    
imageRouter.delete('/archive/:imageId', imageController.archiveImage);
imageRouter.delete('/delete/:imageId', imageController.deleteImage);

module.exports = imageRouter;

// TODO: Audit log import & validations;