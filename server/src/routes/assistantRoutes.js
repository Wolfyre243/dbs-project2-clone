const express = require('express');

const assistantController = require('../controllers/assistantController');
const authMiddleware = require('../middlewares/authMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const { promptValidation } = require('../validators/assistantValidators');
const { validate } = require('../middlewares/validators');

const assistantRouter = express.Router();

assistantRouter.use(jwtMiddleware.verifyToken);

/**
 * @swagger
 * tags:
 *   name: Assistant
 *   description: Endpoints for the admin AI assistant (conversations, messages, content generation)
 */

/**
 * @swagger
 * /assistant/generate-content:
 *   post:
 *     summary: Generate AI content for exhibit subtitles
 *     tags: [Assistant]
 *     description: Generates AI-powered subtitle text for exhibits. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt for the AI to generate content
 *     responses:
 *       200:
 *         description: Generated content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

// POST /assistant/generate-content
assistantRouter.post(
  '/generate-content',
  authMiddleware.verifyIsAdmin,
  [promptValidation()],
  validate,
  assistantController.generateContent,
);

// Conversation routes
// assistantRouter.get(
//   '/conversations',
//   authMiddleware.verifyIsAdmin,
//   assistantController.listConversations,
// );

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

assistantRouter.delete(
  '/conversations/:conversationId',
  assistantController.deleteConversation,
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

assistantRouter.get('/conversations', assistantController.getAllConversations);

/**
 * @swagger
 * /assistant/conversations:
 *   get:
 *     summary: List all conversations for the current admin
 *     tags: [Assistant]
 *     description: Returns a list of all conversations for the authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       conversationId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       modifiedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /assistant/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Assistant]
 *     description: Creates a new conversation for the authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Optional conversation title
 *     responses:
 *       201:
 *         description: Conversation created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     modifiedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /assistant/conversations/{conversationId}:
 *   get:
 *     summary: Get conversation details and messages
 *     tags: [Assistant]
 *     description: Returns a conversation and its messages for the authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     modifiedAt:
 *                       type: string
 *                       format: date-time
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           messageId:
 *                             type: string
 *                           senderType:
 *                             type: string
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /assistant/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get paginated messages for a conversation
 *     tags: [Assistant]
 *     description: Returns paginated messages for a conversation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
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
 *           default: 100
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Paginated messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       messageId:
 *                         type: string
 *                       senderType:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /assistant/chat:
 *   post:
 *     summary: Send a message and get an AI response
 *     tags: [Assistant]
 *     description: Sends a message to the assistant and receives an AI response. If no conversationId is provided, a new conversation is created.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: Optional conversation ID (if omitted, a new conversation is created)
 *               content:
 *                 type: string
 *                 description: The message content
 *     responses:
 *       201:
 *         description: Message sent and AI response returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                 message:
 *                   type: object
 *                 aiMessage:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /assistant/conversations:
 *   get:
 *     summary: Get all conversations (admin)
 *     tags: [Assistant]
 *     description: Returns all conversations for the admin, with pagination and search.
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
 *           default: modifiedAt
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
 *         description: Search term for title or conversationId
 *     responses:
 *       200:
 *         description: Paginated conversation list
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
 *                     pageCount:
 *                       type: integer
 *                     conversationList:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           conversationId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           modifiedAt:
 *                             type: string
 *                             format: date-time
 *                     message:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */

module.exports = assistantRouter;
