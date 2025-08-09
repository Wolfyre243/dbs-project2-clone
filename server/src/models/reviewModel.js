const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

const reviewModel = {
  /**
   * Submit a review (comment)
   * @user
   */
  submitReview: async ({ userId, rating, reviewText }) => {
    try {
      return await prisma.review.create({
        data: {
          userId,
          rating,
          reviewText,
        },
        select: {
          reviewId: true,
          rating: true,
          reviewText: true,
          createdAt: true,
        },
      });
    } catch (err) {
      throw new AppError(`Review submission failed: ${err.message}`, 500);
    }
  },

  /**
   * Get all reviews, newest first
   * @public
   */
  getAllReviews: async ({ page = 1, pageSize = 10 } = {}) => {
    try {
      const total = await prisma.review.count();

      const reviews = await prisma.review.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          reviewId: true,
          rating: true,
          reviewText: true,
          createdAt: true,
          user: {
            select: {
              userId: true,
              username: true,
              userProfile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      return { reviews, total };
    } catch (err) {
      throw new AppError(`Failed to fetch reviews: ${err.message}`, 500);
    }
  },

  disconnect: () => prisma.$disconnect(),
};

module.exports = reviewModel;
