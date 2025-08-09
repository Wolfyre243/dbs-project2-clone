const reviewModel = require('../models/reviewModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Submit a user review (comment)
 * @user
 */
module.exports.submitReview = catchAsync(async (req, res, next) => {
  // Pull userId from res.locals.user
  const userId = res.locals.user?.userId;
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const { rating, reviewText } = req.body;

  // Validate rating
  if (rating === undefined || typeof rating !== 'number') {
    throw new AppError('Rating is required and must be a number', 400);
  }

  // Validate review text
  if (
    !reviewText ||
    typeof reviewText !== 'string' ||
    reviewText.trim().length === 0
  ) {
    throw new AppError('Review text is required', 400);
  }

  const review = await reviewModel.submitReview({ userId, rating, reviewText });

  res.status(201).json({
    status: 'success',
    message: 'Review submitted',
    data: review,
  });
});

/**
 * Get all reviews (public)
 */
module.exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { page = 1, pageSize = 10 } = req.query;

  const reviewsResult = await reviewModel.getAllReviews({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });

  const formatted = reviewsResult.reviews.map((r) => ({
    reviewId: r.reviewId,
    rating: r.rating,
    reviewText: r.reviewText,
    username: r.user?.username || 'Anonymous',
    avatar: r.user?.userProfile?.avatarUrl || null,
    date: r.createdAt,
  }));

  res.status(200).json({
    status: 'success',
    pageCount: Math.ceil(reviewsResult.total / pageSize),
    data: formatted,
  });
});
