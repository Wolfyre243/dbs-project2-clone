const express = require('express');

const assistantController = require('../controllers/assistantController');
const authMiddleware = require('../middlewares/authMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const { promptValidation } = require('../validators/assistantValidators');
const { validate } = require('../middlewares/validators');

const assistantRouter = express.Router();

assistantRouter.use(jwtMiddleware.verifyToken);

// POST /assistant/generate-content
assistantRouter.post(
  '/generate-content',
  authMiddleware.verifyIsAdmin,
  [promptValidation()],
  validate,
  assistantController.generateContent,
);

// Conversation routes
assistantRouter.get(
  '/conversations',
  authMiddleware.verifyIsAdmin,
  assistantController.listConversations,
);

assistantRouter.post(
  '/conversations',
  authMiddleware.verifyIsAdmin,
  assistantController.createConversation,
);

assistantRouter.get(
  '/conversations/:conversationId',
  authMiddleware.verifyIsAdmin,
  assistantController.getConversation,
);

// Message routes
assistantRouter.get(
  '/conversations/:conversationId/messages',
  authMiddleware.verifyIsAdmin,
  assistantController.listMessages,
);

assistantRouter.post(
  '/chat',
  authMiddleware.verifyIsAdmin,
  assistantController.createMessage,
);

module.exports = assistantRouter;
