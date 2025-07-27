const surveyModel = require('../models/surveyModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ========================
// ADMIN CONTROLLERS
// ========================

// Create new survey with initial questions
module.exports.createFullSurvey = catchAsync(async (req, res, next) => {
  const { title, description, questions } = req.body;
  const userId = req.user.userId; // From JWT middleware

  // Validation
  if (!title || !questions?.length) {
    throw new AppError('Title and at least one question required', 400);
  }

  // Create survey
  const survey = await surveyModel.createSurvey({ userId, title, description });

  // Add questions
  await surveyModel.createSurveyQuestions({
    surveyId: survey.survey_id,
    questions,
  });

  res.status(201).json({
    status: 'success',
    message: 'Survey with questions created',
    data: survey,
  });
});

// Update question positions in bulk
module.exports.reorderQuestions = catchAsync(async (req, res, next) => {
  const { surveyId, newOrder } = req.body;

  // Verify admin owns survey
  const survey = await surveyModel.getSurveyById(surveyId);
  if (survey.user_id !== req.user.userId) {
    throw new AppError('Unauthorized to modify this survey', 403);
  }

  // Update positions
  await Promise.all(
    newOrder.map(({ questionId, position }) =>
      surveyModel.updateSurveyQuestion({
        surveyQuestionId: questionId,
        position,
        surveyId,
      }),
    ),
  );

  res.status(200).json({
    status: 'success',
    message: 'Questions reordered successfully',
  });
});

// Get survey responses with analytics
module.exports.getSurveyAnalytics = catchAsync(async (req, res, next) => {
  const surveyId = req.params.surveyId;

  // Verify ownership
  const survey = await surveyModel.getSurveyById(surveyId);
  if (survey.user_id !== req.user.userId) {
    throw new AppError('Unauthorized to view this data', 403);
  }

  // Get questions
  const questions = await surveyModel.getAllQuestions({ surveyId });

  // Get response counts
  const responseCounts = await Promise.all(
    questions.map(async (q) => {
      const count = await prisma.survey_response.count({
        where: { survey_question_id: q.survey_question_id },
      });
      return { questionId: q.survey_question_id, count };
    }),
  );

  res.status(200).json({
    status: 'success',
    data: {
      totalQuestions: questions.length,
      responseCounts,
    },
  });
});

// ========================
// USER CONTROLLERS
// ========================

// Get active survey with questions
module.exports.getActiveSurvey = catchAsync(async (req, res, next) => {
  const userId = req.user.userId; // From JWT middleware

  // Check tour completion
  if (!(await surveyModel.checkCompletion({ userId }))) {
    throw new AppError('Complete the tour to access surveys', 403);
  }

  // Get most recent active survey
  const survey = await prisma.survey.findFirst({
    where: { status_id: 1 }, // Active status
    orderBy: { created_at: 'desc' },
    include: {
      questions: {
        orderBy: { position: 'asc' },
        select: {
          survey_question_id: true,
          question: true,
          position: true,
        },
      },
    },
  });

  if (!survey) throw new AppError('No active surveys available', 404);

  res.status(200).json({
    status: 'success',
    data: survey,
  });
});

// Submit multiple responses in batch
module.exports.submitBatchResponses = catchAsync(async (req, res, next) => {
  const userId = req.user.userId; // From JWT middleware
  const { responses } = req.body;

  // Validate responses
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    throw new AppError('Invalid response format', 400);
  }

  // Process submissions
  const submissions = await Promise.all(
    responses.map((r) =>
      surveyModel.submitResponse({
        surveyQuestionId: r.questionId,
        userId,
        response: r.response,
      }),
    ),
  );

  res.status(201).json({
    status: 'success',
    message: `${responses.length} responses submitted`,
    data: submissions,
  });
});

// ========================
// PUBLIC CONTROLLERS
// ========================

// Get testimonial wall (public)
module.exports.getTestimonialWall = catchAsync(async (req, res, next) => {
  const testimonials = await surveyModel.getAllResponsesForSurveyQuestion1();

  // Format for public display
  const formatted = testimonials.map((t) => ({
    response: t.response,
    username: t.user.username,
    avatar: t.user.user_profile?.avatar_url || null,
    date: t.created_at,
  }));

  res.status(200).json({
    status: 'success',
    data: formatted,
  });
});

// ========================
// SHARED CONTROLLERS
// ========================

// Get single question details
module.exports.getQuestionDetail = catchAsync(async (req, res, next) => {
  const questionId = req.params.questionId;
  const userId = req.user?.userId; // Optional auth

  const question = await prisma.survey_question.findUnique({
    where: { survey_question_id: questionId },
    include: {
      survey: {
        select: { title: true },
      },
    },
  });

  if (!question) throw new AppError('Question not found', 404);

  // For authenticated users: Check if they've answered
  let userResponse = null;
  if (userId) {
    userResponse = await prisma.survey_response.findFirst({
      where: {
        survey_question_id: questionId,
        user_id: userId,
      },
      select: { response: true },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...question,
      userResponse: userResponse?.response || null,
    },
  });
});

// Toggle survey status (admin only)
module.exports.toggleSurveyStatus = catchAsync(async (req, res, next) => {
  const { surveyId } = req.params;
  const { statusId } = req.body;

  // Verify admin
  const survey = await surveyModel.getSurveyById(surveyId);
  if (survey.user_id !== req.user.userId) {
    throw new AppError('Unauthorized to modify this survey', 403);
  }

  // Update status
  await prisma.survey.update({
    where: { survey_id: surveyId },
    data: { status_id: statusId },
  });

  res.status(200).json({
    status: 'success',
    message: `Survey ${statusId === 1 ? 'activated' : 'deactivated'}`,
  });
});

// Get all questions for a survey (admin view)
module.exports.getAllSurveyQuestions = catchAsync(async (req, res, next) => {
  const surveyId = parseInt(req.params.surveyId);

  // Verify ownership
  const survey = await surveyModel.getSurveyById(surveyId);
  if (survey.user_id !== req.user.userId) {
    throw new AppError('Unauthorized to view this survey', 403);
  }

  const surveyQuestions = await surveyModel.getAllQuestions({ surveyId });
  res.status(200).json({
    status: 'success',
    data: surveyQuestions,
  });
});

// Get survey by ID
module.exports.getSurveyById = catchAsync(async (req, res, next) => {
  const surveyId = req.params.surveyId;

  // Verify ownership for private surveys
  const survey = await surveyModel.getSurveyById(surveyId);
  if (survey.status_id !== 1 && survey.user_id !== req.user?.userId) {
    throw new AppError('Unauthorized to view this survey', 403);
  }

  res.status(200).json({
    status: 'success',
    data: survey,
  });
});
