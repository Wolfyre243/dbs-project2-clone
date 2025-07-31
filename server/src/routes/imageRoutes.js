/**
 * @swagger
 * tags:
 *   name: Image
 *   description: Endpoints for managing image files (admin only)
 */

//-----------------------------------IMPORT-------------------------
// Import dependencies
const express = require('express');
const multer = require('multer');

// Import controllers
const imageController = require('../controllers/imageController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const {
  //   createImageValidationRules,
  validate,
} = require('../middlewares/validators');

const storage = multer.memoryStorage();

// The API only allows for wav files
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .png or .jpg files are allowed'), false);
    }
  },
});

//-----------------------------SET UP ROUTES------------------------
// Create the router
const imageRouter = express.Router();

imageRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

/**
 * @swagger
 * /image/:
 *   get:
 *     summary: Get all images with pagination (admin only)
 *     tags: [Image]
 *     description: Returns a paginated list of all images with sorting and search capabilities. Only accessible by admins.
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
 *         description: Search term for fileName or fileLink
 *     responses:
 *       200:
 *         description: Paginated image list
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
 *                       imageId:
 *                         type: string
 *                       description:
 *                         type: string
 *                       fileLink:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Tested
imageRouter.get('/', imageController.getAllImages);

/**
 * @swagger
 * /image/{imageId}:
 *   get:
 *     summary: Get a single image by ID (admin only)
 *     tags: [Image]
 *     description: Returns details for a single image by its ID. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 image:
 *                   type: object
 *                   properties:
 *                     imageId:
 *                       type: string
 *                     description:
 *                       type: string
 *                     fileLink:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     statusId:
 *                       type: integer
 *       404:
 *         description: Image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Tested
imageRouter.get('/:imageId', imageController.getImageById);

/**
 * @swagger
 * /image/upload:
 *   post:
 *     summary: Upload an image file (admin only)
 *     tags: [Image]
 *     description: Uploads an image file (.png, .jpg, .jpeg) and creates an image record. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (.png, .jpg, .jpeg)
 *               description:
 *                 type: string
 *                 description: Optional description for the image
 *     responses:
 *       201:
 *         description: Image uploaded successfully
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
 *                     imageId:
 *                       type: string
 *                     description:
 *                       type: string
 *                     fileLink:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     statusId:
 *                       type: integer
 *       400:
 *         description: Invalid file type or upload error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// Tested
imageRouter.post(
  '/upload',
  upload.single('image'),
  imageController.uploadImage,
);

// imageRouter.put('/:imageId', imageController.updateImage);

/**
 * @swagger
 * /image/archive/{imageId}:
 *   put:
 *     summary: Archive an image (admin only)
 *     tags: [Image]
 *     description: Archives an image by setting its status to archived. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image archived successfully
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
 *         description: Image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

imageRouter.put('/archive/:imageId', imageController.archiveImage);

/**
 * @swagger
 * /image/unarchive/{imageId}:
 *   put:
 *     summary: Unarchive an image (admin only)
 *     tags: [Image]
 *     description: Unarchives an image by setting its status to active. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image unarchived successfully
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
 *         description: Image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

imageRouter.put('/unarchive/:imageId', imageController.unarchiveImage);

/**
 * @swagger
 * /image/{imageId}:
 *   delete:
 *     summary: Soft delete an image (admin only)
 *     tags: [Image]
 *     description: Soft deletes an image by setting its status to deleted. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image soft deleted successfully
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
 *       404:
 *         description: Image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

imageRouter.delete('/:imageId', imageController.deleteImage);

/**
 * @swagger
 * /image/hard-delete/{imageId}:
 *   delete:
 *     summary: Hard delete an image (admin only)
 *     tags: [Image]
 *     description: Permanently deletes an image from the database and storage. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image hard deleted successfully
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
 *         description: Image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

imageRouter.delete('/hard-delete/:imageId', imageController.hardDeleteImage);

module.exports = imageRouter;

// TODO: Audit log import & validations;
