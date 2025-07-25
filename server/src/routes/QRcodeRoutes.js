/* //-----------------------------------IMPORT-------------------------
// Import dependencies
const express = require('express');

// Import controllers
const QRcodeController = require('../controllers/imageController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');

//-----------------------------SET UP ROUTES------------------------
// Create the router
const QRcodeRouter = express.Router();

QRcodeRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

// Admin routes
QRcodeRouter.get('/', QRcodeController.getAllQRcodes);
QRcodeRouter.post('/create', QRcodeController.createQRcode);
QRcodeRouter.put('/update-image', QRcodeController.updateQRcode);
QRcodeRouter.put('/soft-delete', QRcodeController.softDeleteQRcode);
QRcodeRouter.delete('/hard-delete', QRcodeController.deleteQRcode);

module.exports = imageRouter; */