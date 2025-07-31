const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// Public: Get all reviews
router.get('/', reviewController.getAllReviews);

// Authenticated: Submit a review
router.post(
  '/submit',
  jwtMiddleware.verifyToken,
  reviewController.submitReview,
);

module.exports = router;
