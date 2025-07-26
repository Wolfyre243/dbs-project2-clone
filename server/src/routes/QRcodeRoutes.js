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

QRcodeRouter.use(jwtMiddleware.verifyToken , authMiddleware.verifyIsAdmin);

// GET routes
QRcodeRouter.get('/', QRcodeController.getAllQRcodes);
QRcodeRouter.get('/:qrCodeId', QRcodeController.getQRCodeById);

// Generate & re-generate routes
QRcodeRouter.post('/generate', QRcodeController.generateQRCode);
QRcodeRouter.post('/re-generate', QRcodeController.reGenerateQRcode);

// Soft-delete route
QRcodeRouter.delete('/soft-delete/:qrCodeId', QRcodeController.softDeleteQRCode);

// Archive & Unarchive Routes
QRcodeRouter.put('/archive/:qrCodeId', QRcodeController.archiveQRCode);
QRcodeRouter.put('/unarchive/:qrCodeId', QRcodeController.unarchiveQRCode);

// Hard delete route
QRcodeRouter.delete('/hard-delete/:qrCodeId', QRcodeController.hardDeleteQRCode);

module.exports = QRcodeRouter; 