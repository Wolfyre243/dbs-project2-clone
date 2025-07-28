//-----------------------------------IMPORT-------------------------
// Import dependencies
const express = require('express');

// Import controllers
const QRcodeController = require('../controllers/QRcodeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const { param } = require('express-validator');
const { validate } = require('../middlewares/validators');

//-----------------------------SET UP ROUTES------------------------
// Create the router
const QRcodeRouter = express.Router();

QRcodeRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

// GET routes
QRcodeRouter.get('/', QRcodeController.getAllQRcodes);
QRcodeRouter.get('/:qrCodeId', QRcodeController.getQRCodeById);

// Generate & re-generate routes
// QRcodeRouter.post('/generate', QRcodeController.generateQRCode);
QRcodeRouter.post(
  '/regenerate/:exhibitId',
  [
    param('exhibitId')
      .notEmpty()
      .withMessage('Exhibit ID is required.')
      .isUUID()
      .withMessage('Exhibit ID must be a valid UUID.')
      .escape(),
  ],
  validate,
  QRcodeController.regenerateQRcode,
);

// Soft-delete route
QRcodeRouter.delete('/:qrCodeId', QRcodeController.softDeleteQRCode);

// Archive & Unarchive Routes
QRcodeRouter.put('/archive/:qrCodeId', QRcodeController.archiveQRCode);
QRcodeRouter.put('/unarchive/:qrCodeId', QRcodeController.unarchiveQRCode);

// Hard delete route
QRcodeRouter.delete(
  '/hard-delete/:qrCodeId',
  QRcodeController.hardDeleteQRCode,
);

QRcodeRouter.get('/statistics/scans', QRcodeController.getQRCodeScanStatistics);


module.exports = QRcodeRouter;
