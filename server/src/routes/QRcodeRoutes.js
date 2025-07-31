/**
 * @swagger
 * tags:
 *   name: QRCode
 *   description: Endpoints for managing QR codes (admin only)
 */

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

/**
 * @swagger
 * /qrcode/:
 *   get:
 *     summary: Get all QR codes (admin only)
 *     tags: [QRCode]
 *     description: Returns a list of all QR codes. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all QR codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       qrCodeId:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       url:
 *                         type: string
 *                       exhibitId:
 *                         type: string
 *                       imageId:
 *                         type: string
 *                       statusId:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// GET routes
QRcodeRouter.get('/', QRcodeController.getAllQRcodes);

/**
 * @swagger
 * /qrcode/{qrCodeId}:
 *   get:
 *     summary: Get a single QR code by ID (admin only)
 *     tags: [QRCode]
 *     description: Returns details for a single QR code by its ID. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     getQRcode:
 *                       type: object
 *                       properties:
 *                         qrCodeId:
 *                           type: string
 *                         createdBy:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         url:
 *                           type: string
 *                         exhibitId:
 *                           type: string
 *                         imageId:
 *                           type: string
 *                         statusId:
 *                           type: integer
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

QRcodeRouter.get('/:qrCodeId', QRcodeController.getQRCodeById);

/**
 * @swagger
 * /qrcode/regenerate/{exhibitId}:
 *   post:
 *     summary: Regenerate QR code for an exhibit (admin only)
 *     tags: [QRCode]
 *     description: Generates a new QR code for the specified exhibit, replacing any existing QR code. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID to regenerate QR code for
 *     responses:
 *       200:
 *         description: QR code regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCodeId:
 *                       type: string
 *                     fileLink:
 *                       type: string
 *                     fileName:
 *                       type: string
 *       400:
 *         description: Invalid exhibit ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

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

/**
 * @swagger
 * /qrcode/{qrCodeId}:
 *   delete:
 *     summary: Soft delete a QR code (admin only)
 *     tags: [QRCode]
 *     description: Soft deletes a QR code by setting its status to deleted. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Soft-delete route
QRcodeRouter.delete('/:qrCodeId', QRcodeController.softDeleteQRCode);

/**
 * @swagger
 * /qrcode/archive/{qrCodeId}:
 *   put:
 *     summary: Archive a QR code (admin only)
 *     tags: [QRCode]
 *     description: Archives a QR code by setting its status to archived. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Archive & Unarchive Routes
QRcodeRouter.put('/archive/:qrCodeId', QRcodeController.archiveQRCode);

/**
 * @swagger
 * /qrcode/unarchive/{qrCodeId}:
 *   put:
 *     summary: Unarchive a QR code (admin only)
 *     tags: [QRCode]
 *     description: Unarchives a QR code by setting its status to active. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code unarchived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

QRcodeRouter.put('/unarchive/:qrCodeId', QRcodeController.unarchiveQRCode);

/**
 * @swagger
 * /qrcode/hard-delete/{qrCodeId}:
 *   delete:
 *     summary: Hard delete a QR code (admin only)
 *     tags: [QRCode]
 *     description: Permanently deletes a QR code from the database and storage. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code hard deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: QR code not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Hard delete route
QRcodeRouter.delete(
  '/hard-delete/:qrCodeId',
  QRcodeController.hardDeleteQRCode,
);

/**
 * @swagger
 * /qrcode/statistics/scans-per-exhibit:
 *   get:
 *     summary: Get QR code scan statistics per exhibit (admin only)
 *     tags: [QRCode]
 *     description: Returns statistics on QR code scans per exhibit. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code scan statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       exhibitId:
 *                         type: string
 *                       exhibitTitle:
 *                         type: string
 *                       scanCount:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Statistics routes
QRcodeRouter.get(
  '/statistics/scans-per-exhibit',
  QRcodeController.getScansPerExhibit,
);

module.exports = QRcodeRouter;
