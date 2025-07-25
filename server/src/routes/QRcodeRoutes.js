//-----------------------------------IMPORT-------------------------
// Import dependencies
const express = require('express');

// Import controllers
const QRcodeController = require('../controllers/QRcodeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');

//-----------------------------SET UP ROUTES------------------------
// Create the router
const QRcodeRouter = express.Router();

QRcodeRouter.use(jwtMiddleware.verifyToken/* , authMiddleware.verifyIsAdmin */);

// Admin routes
QRcodeRouter.post('/generate', QRcodeController.generateQRCode);
QRcodeRouter.post('/re-generate', QRcodeController.reGenerateQRcode);

module.exports = QRcodeRouter; 