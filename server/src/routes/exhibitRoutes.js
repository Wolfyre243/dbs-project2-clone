/**
 * @swagger
 * tags:
 *   name: Exhibit
 *   description: Endpoints for managing museum exhibits
 */

// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Import controllers
const audioController = require('../controllers/audioController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const exhibitController = require('../controllers/exhibitController');
const {
  createExhibitionValidationRules,
  validate,
} = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const exhibitRouter = express.Router();

exhibitRouter.use(jwtMiddleware.verifyToken);

/**
 * @swagger
 * /exhibit/public/{exhibitId}:
 *   get:
 *     summary: Get public exhibit metadata
 *     tags: [Exhibit]
 *     description: Returns basic exhibit information excluding subtitles and audio. Accessible to all authenticated users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID
 *     responses:
 *       200:
 *         description: Exhibit metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     exhibit:
 *                       type: object
 *                       properties:
 *                         exhibitId:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         imageId:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         modifiedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Exhibit not found
 *       401:
 *         description: Unauthorized
 */

// Excluding subtitles & audio
exhibitRouter.get(
  '/public/:exhibitId',
  exhibitController.getSingleExhibitMetadata,
);

/**
 * @swagger
 * /exhibit/favorites:
 *   get:
 *     summary: Get user's favorite exhibits
 *     tags: [Exhibit]
 *     description: Returns a list of exhibits favorited by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite exhibits
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
 *             example:
 *               status: success
 *               data:
 *                 - exhibitId: "123e4567-e89b-12d3-a456-426614174000"
 *                   title: "Exhibit Title"
 *                   description: "Exhibit description"
 *       401:
 *         description: Unauthorized
 */
exhibitRouter.get('/favorites', exhibitController.getFavorites);

// Get how many exhibits the user has discovered
exhibitRouter.get('/discovered', exhibitController.getExhibitsDiscovered);

/**
 * @swagger
 * /exhibit/{exhibitId}:
 *   get:
 *     summary: Get full exhibit details (admin only)
 *     tags: [Exhibit]
 *     description: Returns complete exhibit information including all related data. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID
 *     responses:
 *       200:
 *         description: Full exhibit details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     exhibit:
 *                       type: object
 *                       properties:
 *                         exhibitId:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         createdBy:
 *                           type: string
 *                         modifiedBy:
 *                           type: string
 *                         imageId:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         modifiedAt:
 *                           type: string
 *                           format: date-time
 *                         statusId:
 *                           type: integer
 *                         subtitles:
 *                           type: array
 *                           items:
 *                             type: object
 *                         qrCode:
 *                           type: object
 *       404:
 *         description: Exhibit not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Admin Exhibit Routes
// Has all details for admin
exhibitRouter.get('/:exhibitId', exhibitController.getSingleExhibit);

/**
 * @swagger
 * /exhibit/{exhibitId}/validate-qr-token:
 *   post:
 *     summary: Validate QR code token for exhibit access
 *     tags: [Exhibit]
 *     description: Validates a QR code JWT token for accessing a specific exhibit and logs the scan event.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: QR code JWT token
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 valid:
 *                   type: boolean
 *       400:
 *         description: Missing QR token
 *       403:
 *         description: Invalid QR token for this exhibit
 *       401:
 *         description: Unauthorized
 */

// QR code token validation route
exhibitRouter.post(
  '/:exhibitId/validate-qr-token',
  exhibitController.validateQrToken,
);
/**
 * @swagger
 * /exhibit/:
 *   put:
 *     summary: Update an exhibit (admin only)
 *     tags: [Exhibit]
 *     description: Updates an existing exhibit's information. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exhibitId
 *               - title
 *             properties:
 *               exhibitId:
 *                 type: string
 *                 format: uuid
 *                 description: Exhibit ID to update
 *               title:
 *                 type: string
 *                 description: Exhibit title
 *               description:
 *                 type: string
 *                 description: Exhibit description
 *               imageId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated image ID
 *     responses:
 *       200:
 *         description: Exhibit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     exhibit:
 *                       type: object
 *                     message:
 *                       type: string
 *       404:
 *         description: Exhibit not found or update failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

exhibitRouter.put(
  '/',
  authMiddleware.verifyIsAdmin,
  exhibitController.updateExhibit,
);
/**
 * @swagger
 * /exhibit/{exhibitId}:
 *   delete:
 *     summary: Soft delete an exhibit (admin only)
 *     tags: [Exhibit]
 *     description: Soft deletes an exhibit by setting its status to deleted. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID to delete
 *     responses:
 *       200:
 *         description: Exhibit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 deletedRecord:
 *                   type: object
 *       404:
 *         description: Exhibit not found or already deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

exhibitRouter.delete(
  '/:exhibitId',
  authMiddleware.verifyIsAdmin,
  exhibitController.deleteExhibit,
);

// Bulk delete exhibits
exhibitRouter.put(
  '/bulk',
  authMiddleware.verifyIsAdmin,
  exhibitController.bulkDeleteExhibits,
);

/**
 * @swagger
 * /exhibit/:
 *   post:
 *     summary: Create a new exhibit (admin only)
 *     tags: [Exhibit]
 *     description: Creates a new exhibit with associated subtitles and generates a QR code. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assetData
 *             properties:
 *               title:
 *                 type: string
 *                 description: Exhibit title
 *               description:
 *                 type: string
 *                 description: Exhibit description
 *               imageId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated image ID
 *               assetData:
 *                 type: object
 *                 required:
 *                   - subtitleIds
 *                 properties:
 *                   subtitleIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uuid
 *                     description: Array of subtitle IDs to associate with the exhibit
 *     responses:
 *       201:
 *         description: Exhibit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     exhibitId:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

exhibitRouter.post(
  '/',
  createExhibitionValidationRules(),
  validate,
  authMiddleware.verifyIsAdmin,
  exhibitController.createExhibit,
);

/**
 * @swagger
 * /exhibit/:
 *   get:
 *     summary: Get all exhibits with pagination (admin only)
 *     tags: [Exhibit]
 *     description: Returns a paginated list of all exhibits with sorting and search capabilities. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or description
 *       - in: query
 *         name: statusFilter
 *         schema:
 *           type: integer
 *         description: Filter by status ID
 *     responses:
 *       200:
 *         description: Paginated exhibit list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 pageCount:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       exhibitId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       modifiedAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

exhibitRouter.get(
  '/',
  authMiddleware.verifyIsAdmin,
  exhibitController.getAllExhibits,
);

/**
 * @swagger
 * /exhibit/{exhibitId}/favorite:
 *   post:
 *     summary: Add an exhibit to user's favorites
 *     tags: [Exhibit]
 *     description: Adds the specified exhibit to the authenticated user's favorites.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID to favorite
 *     responses:
 *       201:
 *         description: Exhibit favorited
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               status: success
 *               message: Exhibit favorited
 *       404:
 *         description: Exhibit not found
 *       401:
 *         description: Unauthorized
 */
exhibitRouter.post('/:exhibitId/favorite', exhibitController.addFavorite);

/**
 * @swagger
 * /exhibit/{exhibitId}/favorite:
 *   delete:
 *     summary: Remove an exhibit from user's favorites
 *     tags: [Exhibit]
 *     description: Removes the specified exhibit from the authenticated user's favorites.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exhibit ID to unfavorite
 *     responses:
 *       200:
 *         description: Exhibit unfavorited
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               status: success
 *               message: Exhibit unfavorited
 *       404:
 *         description: Exhibit not found
 *       401:
 *         description: Unauthorized
 */
exhibitRouter.delete('/:exhibitId/favorite', exhibitController.removeFavorite);

// archive exhibit
exhibitRouter.post(
  '/:exhibitId/archive',
  authMiddleware.verifyIsAdmin,
  exhibitController.archiveExhibit,
);

// Unarchive exhibit
exhibitRouter.put(
  '/:exhibitId/unarchive',
  authMiddleware.verifyIsAdmin,
  exhibitController.unarchiveExhibit,
);

// Get all archived exhibits
/* exhibitRouter.get(
  '/archived',
  authMiddleware.verifyIsAdmin,
  exhibitController.getArchivedExhibits,
); */

module.exports = exhibitRouter;
