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

imageRouter.get('/', imageController.getAllImages);

imageRouter.get('/:imageId', imageController.getImageById);

imageRouter.post('/create', 
    createImageValidationRules(),
    validate,
    imageController.createImage);

imageRouter.put('/update-image', 
    imageController.updateImage);
    
imageRouter.put('/archive/:imageId', imageController.archiveImage);
imageRouter.delete('/delete/:imageId', imageController.deleteImage);

module.exports = imageRouter;