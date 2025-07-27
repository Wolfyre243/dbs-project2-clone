const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

const surveyModel = {
  // ========================
  // === ADMIN-ONLY MODELS ===
  // ========================

  /**
   * Create new survey
   * @admin
   */
  createSurvey: async ({ userId, title, description }) => {
    try {
      return await prisma.survey.create({
        data: {
          user_id: userId,
          title,
          description,
          status_id: 1, // Assuming 1 = 'active' status
        },
        select: {
          survey_id: true,
          title: true,
          description: true,
          created_at: true,
        },
      });
    } catch (err) {
      throw new AppError(`Failed to create survey: ${err.message}`, 500);
    }
  },

  /**
   * Bulk create survey questions
   * @admin
   */
  createSurveyQuestions: async ({ surveyId, questions }) => {
    try {
      const questionData = questions.map((q) => ({
        survey_id: surveyId,
        question: q.question,
        position: q.position,
        is_testimonial_question: q.isTestimonial || false,
        status_id: 1, // Default active status
      }));

      return await prisma.survey_question.createMany({
        data: questionData,
        skipDuplicates: true,
      });
    } catch (err) {
      throw new AppError(`Failed to create questions: ${err.message}`, 500);
    }
  },

  /**
   * Update a single survey question
   * @admin
   */
  updateSurveyQuestion: async ({
    surveyQuestionId,
    question,
    position,
    surveyId,
  }) => {
    try {
      return await prisma.survey_question.update({
        where: { survey_question_id: surveyQuestionId },
        data: { question, position },
        select: {
          survey_question_id: true,
          question: true,
          position: true,
        },
      });
    } catch (err) {
      throw new AppError(`Failed to update question: ${err.message}`, 500);
    }
  },

  // =======================================
  // === PUBLIC MODELS (User Accessible) ===
  // =======================================

  /**
   * Get a public survey by its ID, including questions
   * @public
   */
  getSurveyById: async (surveyId) => {
    try {
      return await prisma.survey.findUnique({
        where: { survey_id: surveyId },
        include: {
          questions: {
            orderBy: { position: 'asc' },
          },
        },
      });
    } catch (err) {
      throw new AppError(`Survey not found: ${err.message}`, 404);
    }
  },

  /**
   * Get all questions for a survey, ordered
   * @public
   */
  getAllQuestions: async ({ surveyId }) => {
    try {
      return await prisma.survey_question.findMany({
        where: { survey_id: surveyId },
        orderBy: { position: 'asc' },
      });
    } catch (err) {
      throw new AppError(`Failed to fetch questions: ${err.message}`, 500);
    }
  },

  /**
   * Check if a user completed a tour
   * @public
   */
  checkCompletion: async ({ userId }) => {
    try {
      const completion = await prisma.user_tour_completion.findUnique({
        where: { user_id: userId },
      });
      return !!completion;
    } catch (err) {
      throw new AppError(`Completion check failed: ${err.message}`, 500);
    }
  },

  /**
   * Get testimonial question ("Leave us a testimonial" question)
   * @public
   */
  getTestimonialQuestion: async () => {
    try {
      return await prisma.survey_question.findFirst({
        where: { is_testimonial_question: true },
      });
    } catch (err) {
      throw new AppError(`Testimonial question not found: ${err.message}`, 404);
    }
  },

  /**
   * Submit a user response to a survey question
   * @public
   */
  submitResponse: async ({ surveyQuestionId, userId, response }) => {
    try {
      return await prisma.survey_response.create({
        data: {
          survey_question_id: surveyQuestionId,
          user_id: userId,
          response,
        },
        select: {
          response_id: true,
          created_at: true,
        },
      });
    } catch (err) {
      throw new AppError(`Response submission failed: ${err.message}`, 500);
    }
  },

  // ========================
  // === MIXED/ADMIN MODEL ===
  // ========================

  /**
   * Get all responses for testimonial question
   * @admin
   * (Could be public if testimonials are shown to users)
   */
  getAllResponsesForSurveyQuestion1: async () => {
    try {
      const testimonialQuestion = await prisma.survey_question.findFirst({
        where: { is_testimonial_question: true },
      });

      if (!testimonialQuestion) return [];

      return await prisma.survey_response.findMany({
        where: { survey_question_id: testimonialQuestion.survey_question_id },
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              user_profile: true,
            },
          },
        },
      });
    } catch (err) {
      throw new AppError(`Failed to fetch responses: ${err.message}`, 500);
    }
  },

  /**
   * Disconnect Prisma client (system/internal)
   */
  disconnect: () => prisma.$disconnect(),
};

module.exports = surveyModel;
