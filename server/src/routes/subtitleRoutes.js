/**
 * @swagger
 * tags:
 *   name: Subtitle
 *   description: Endpoints for managing exhibit subtitles (admin only)
 */

// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const subtitleController = require('../controllers/subtitleController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const {
  createSubtitleValidationRules,
  validate,
} = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const subtitleRouter = express.Router();

subtitleRouter.use(jwtMiddleware.verifyToken);

/**
 * @swagger
 * /subtitle/exhibit/{exhibitId}:
 *   get:
 *     summary: Get all subtitles for an exhibit
 *     tags: [Subtitle]
 *     description: Returns all subtitles associated with a specific exhibit.
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
 *         description: List of subtitles for the exhibit
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
 *                       subtitleId:
 *                         type: string
 *                       subtitleText:
 *                         type: string
 *                       languageCode:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */

subtitleRouter.get(
  '/exhibit/:exhibitId',
  subtitleController.getSubtitlesByExhibitId,
);

// -- Admin Routes --

/**
 * @swagger
 * /subtitle/:
 *   post:
 *     summary: Create a new subtitle (admin only)
 *     tags: [Subtitle]
 *     description: Creates a new subtitle for an exhibit. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subtitleText
 *               - languageCode
 *               - createdBy
 *             properties:
 *               subtitleText:
 *                 type: string
 *                 description: Subtitle text
 *               languageCode:
 *                 type: string
 *                 description: Language code
 *               createdBy:
 *                 type: string
 *                 description: User ID of creator
 *               audioId:
 *                 type: string
 *                 description: Optional audio ID
 *     responses:
 *       201:
 *         description: Subtitle created successfully
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
 *                     subtitleId:
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

subtitleRouter.post(
  '/',
  authMiddleware.verifyIsAdmin,
  createSubtitleValidationRules(),
  validate,
  subtitleController.createSubtitle,
);

/**
 * @swagger
 * /subtitle/{subtitleId}:
 *   put:
 *     summary: Update a subtitle (admin only)
 *     tags: [Subtitle]
 *     description: Updates an existing subtitle. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtitleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtitle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subtitleText:
 *                 type: string
 *                 description: Subtitle text
 *               languageCode:
 *                 type: string
 *                 description: Language code
 *               audioId:
 *                 type: string
 *                 description: Optional audio ID
 *     responses:
 *       200:
 *         description: Subtitle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Subtitle not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.put(
  '/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.updateSubtitle,
);

/**
 * @swagger
 * /subtitle/archive/{subtitleId}:
 *   put:
 *     summary: Archive a subtitle (admin only)
 *     tags: [Subtitle]
 *     description: Archives a subtitle by setting its status to archived. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtitleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtitle ID
 *     responses:
 *       200:
 *         description: Subtitle archived successfully
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
 *         description: Subtitle not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.put(
  '/archive/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.archiveSubtitle,
);

/**
 * @swagger
 * /subtitle/unarchive/{subtitleId}:
 *   put:
 *     summary: Unarchive a subtitle (admin only)
 *     tags: [Subtitle]
 *     description: Unarchives a subtitle by setting its status to active. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtitleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtitle ID
 *     responses:
 *       200:
 *         description: Subtitle unarchived successfully
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
 *         description: Subtitle not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.put(
  '/unarchive/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.unarchiveSubtitle,
);

/**
 * @swagger
 * /subtitle/{subtitleId}:
 *   delete:
 *     summary: Soft delete a subtitle (admin only)
 *     tags: [Subtitle]
 *     description: Soft deletes a subtitle by setting its status to deleted. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtitleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtitle ID
 *     responses:
 *       200:
 *         description: Subtitle soft deleted successfully
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
 *         description: Subtitle not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.delete(
  '/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.softDeleteSubtitle,
);

/**
 * @swagger
 * /subtitle/:
 *   get:
 *     summary: Get all subtitles (admin only)
 *     tags: [Subtitle]
 *     description: Returns all subtitles in the system. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subtitles
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
 *                       subtitleId:
 *                         type: string
 *                       subtitleText:
 *                         type: string
 *                       languageCode:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.get(
  '/',
  authMiddleware.verifyIsAdmin,
  subtitleController.getAllSubtitles,
);

/**
 * @swagger
 * /subtitle/{subtitleId}:
 *   get:
 *     summary: Get a single subtitle by ID (admin only)
 *     tags: [Subtitle]
 *     description: Returns details for a single subtitle by its ID. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtitleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtitle ID
 *     responses:
 *       200:
 *         description: Subtitle details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Subtitle not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.get(
  '/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.getSubtitleById,
);

/**
 * @swagger
 * /subtitle/hard-delete/{subtitleId}:
 *   delete:
 *     summary: Hard delete a subtitle (admin only)
 *     tags: [Subtitle]
 *     description: Permanently deletes a subtitle from the database. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtitleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtitle ID
 *     responses:
 *       200:
 *         description: Subtitle hard deleted successfully
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
 *         description: Subtitle not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

subtitleRouter.delete(
  '/hard-delete/:subtitleId',
  authMiddleware.verifyIsAdmin,
  subtitleController.hardDeleteSubtitle,
);

module.exports = subtitleRouter;
