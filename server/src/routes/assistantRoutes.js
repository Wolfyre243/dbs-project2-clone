const express = require('express');

const assistantController = require('../controllers/assistantController');
const authMiddleware = require('../middlewares/authMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const { promptValidation } = require('../validators/assistantValidators');
const { validate } = require('../middlewares/validators');

const assistantRouter = express.Router();

assistantRouter.use(jwtMiddleware.verifyToken);

/**
 * POST /assistant/generate-content
 * Body: { prompt: string }
 */
assistantRouter.post(
  '/generate-content',
  // TODO: Rate limiting
  authMiddleware.verifyIsAdmin,
  [promptValidation()],
  validate,
  assistantController.generateContent,
);

module.exports = assistantRouter;
