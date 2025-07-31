/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Endpoints for managing user reviews and feedback
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

/**
 * @swagger
 * /review/:
 *   get:
 *     summary: Get all reviews (public)
 *     tags: [Review]
 *     description: Returns all user reviews with ratings and comments. This endpoint is public and does not require authentication.
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reviewId:
 *                         type: string
 *                         description: Review ID
 *                       rating:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                         description: Review rating (1-5 stars)
 *                       reviewText:
 *                         type: string
 *                         description: Review comment text
 *                       username:
 *                         type: string
 *                         description: Username of reviewer (or "Anonymous" if user deleted)
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *                         description: Avatar URL of reviewer
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: Review creation date
 */

// Public: Get all reviews
router.get('/', reviewController.getAllReviews);

/**
 * @swagger
 * /review/submit:
 *   post:
 *     summary: Submit a review (authenticated users only)
 *     tags: [Review]
 *     description: Allows authenticated users to submit a review with rating and comment text.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - reviewText
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Review rating (1-5 stars)
 *                 example: 5
 *               reviewText:
 *                 type: string
 *                 minLength: 1
 *                 description: Review comment text
 *                 example: "Great museum experience! Highly recommend visiting."
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Review submitted
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviewId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     reviewText:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     modifiedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request data (missing or invalid rating/reviewText)
 *       401:
 *         description: Authentication required
 */

// Authenticated: Submit a review
router.post(
  '/submit',
  jwtMiddleware.verifyToken,
  reviewController.submitReview,
);

module.exports = router;
