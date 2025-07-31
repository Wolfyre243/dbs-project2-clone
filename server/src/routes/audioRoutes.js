/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: Endpoints for managing audio files (admin only)
 */

/**
 * @swagger
 * /audio/upload:
 *   post:
 *     summary: Upload an audio file
 *     tags: [Audio]
 *     description: Uploads a .wav audio file and creates an audio record. Only admins can use this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The .wav audio file to upload
 *               languageCode:
 *                 type: string
 *                 description: Language code for the audio
 *     responses:
 *       200:
 *         description: Audio uploaded successfully
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
 *                     audioId:
 *                       type: string
 *                     fileLink:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                     languageCode:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid file or language code
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/generate:
 *   post:
 *     summary: Generate audio from text
 *     tags: [Audio]
 *     description: Converts text to speech and creates an audio record. Only admins can use this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to convert to audio
 *               languageCode:
 *                 type: string
 *                 description: Language code for the audio
 *     responses:
 *       200:
 *         description: Audio generated successfully
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
 *                     audioId:
 *                       type: string
 *                     fileLink:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     languageCode:
 *                       type: string
 *                     text:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/{audioId}:
 *   get:
 *     summary: Get a single audio file by ID
 *     tags: [Audio]
 *     description: Returns details for a single audio file by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio file ID
 *     responses:
 *       200:
 *         description: Audio details
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
 *                     audio:
 *                       type: object
 *                     message:
 *                       type: string
 *       404:
 *         description: Audio not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/archive/{audioId}:
 *   put:
 *     summary: Archive an audio file
 *     tags: [Audio]
 *     description: Archives an audio file by setting its status to archived.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio file ID
 *     responses:
 *       200:
 *         description: Audio archived successfully
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
 *         description: Audio not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/hard-delete/{audioId}:
 *   delete:
 *     summary: Hard delete an audio file
 *     tags: [Audio]
 *     description: Permanently deletes an audio file from the database and storage.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio file ID
 *     responses:
 *       200:
 *         description: Audio hard deleted successfully
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
 *         description: Audio not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/unarchive/{audioId}:
 *   put:
 *     summary: Unarchive an audio file
 *     tags: [Audio]
 *     description: Unarchives an audio file by setting its status to active.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio file ID
 *     responses:
 *       200:
 *         description: Audio unarchived successfully
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
 *         description: Audio not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/{audioId}:
 *   delete:
 *     summary: Soft delete an audio file
 *     tags: [Audio]
 *     description: Soft deletes an audio file by setting its status to deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio file ID
 *     responses:
 *       200:
 *         description: Audio soft deleted successfully
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
 *         description: Audio not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /audio/:
 *   get:
 *     summary: Get all audio files (paginated)
 *     tags: [Audio]
 *     description: Returns a paginated list of all audio files. Only admins can use this endpoint.
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
 *         description: Search term for description or fileName
 *       - in: query
 *         name: languageCodeFilter
 *         schema:
 *           type: string
 *         description: Filter by language code
 *     responses:
 *       200:
 *         description: Paginated audio list
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
 *                     pageCount:
 *                       type: integer
 *                     audioList:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           audioId:
 *                             type: string
 *                           fileLink:
 *                             type: string
 *                           fileName:
 *                             type: string
 *                           createdBy:
 *                             type: string
 *                           languageCode:
 *                             type: string
 *                     message:
 *                       type: string
 *       401:
 *         description: Unauthorized
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
const {
  generateAudioValidationRules,
  validate,
} = require('../middlewares/validators');

const storage = multer.memoryStorage();

// The API only allows for wav files
// To allow images (png, jpg, jpeg), use:
// file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'audio/wav' ||
      file.mimetype === 'audio/x-wav' ||
      file.mimetype === 'audio/wave'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .wav files are allowed'), false);
    }
  },
});
// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const audioRouter = express.Router();

audioRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

//authRouter.post('/upload', upload.single('file'), audioController.uploadAudio);

audioRouter.post(
  '/upload',
  // [generateAudioValidationRules()],
  //rateLimiter,
  upload.single('file'),
  audioController.uploadAudio,
);

audioRouter.post(
  '/generate',
  // TODO: Rate limit
  generateAudioValidationRules(),
  validate,
  audioController.generateAudio,
);

// audioRouter.get('/subtitles', audioController.getAllSubtitles);

audioRouter.get('/:audioId', audioController.getSingleAudio);

// Archive audio
audioRouter.put('/archive/:audioId', audioController.archiveAudio);

// Hard delete audio by removing the record
audioRouter.delete('/hard-delete/:audioId', audioController.hardDeleteAudio);

//unarchive audio
audioRouter.put('/unarchive/:audioId', audioController.unarchiveAudio);

//soft delete audio
audioRouter.delete('/:audioId', audioController.softDeleteAudio);

// Get all audio for admin
audioRouter.get('/', audioController.getAllAudio);

module.exports = audioRouter;
