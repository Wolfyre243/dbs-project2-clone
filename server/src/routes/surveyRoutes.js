const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// =======================
// PUBLIC ROUTES (No authentication needed)
// =======================

// Testimonial wall (public)
router.get('/testimonials', surveyController.getTestimonialWall);

// Single question detail (optional auth)
router.get('/questions/:questionId', surveyController.getQuestionDetail);

// Get survey by ID (public or owner)
router.get(
  '/survey/:surveyId',
  jwtMiddleware.verifyToken,
  surveyController.getSurveyById,
);
// Note: You could make this public if desired by removing jwtMiddleware,
// but here kept with optional auth pattern assuming you handle ownership check in controller

// =======================
// APPLY JWT AUTH TO ALL ROUTES BELOW
// =======================
router.use(jwtMiddleware.verifyToken);

// =======================
// USER ROUTES (authenticated users)
// =======================
// Get active survey for current user
router.get('/active-survey', surveyController.getActiveSurvey);

// Submit multiple responses in batch
router.post('/submit-responses', surveyController.submitBatchResponses);
// =======================
// ADMIN ROUTES (authenticated + admin role)
// =======================
router.use(authMiddleware.verifyIsAdmin);

// Create new survey with questions
router.post('/create-full-survey', surveyController.createFullSurvey);
// Reorder survey questions
router.patch('/reorder-questions', surveyController.reorderQuestions);
// Toggle survey status (active/inactive)
router.put('/toggle-status/:surveyId', surveyController.toggleSurveyStatus);
// Get survey analytics
router.get('/analytics/:surveyId', surveyController.getSurveyAnalytics);
// Get all questions for a survey (admin view)
router.get(
  '/survey-questions/:surveyId',
  surveyController.getAllSurveyQuestions,
);
module.exports = router;
