const SenderTypes = require('../configs/senderTypeConfig');
const assistantModel = require('../models/assistantModel');
const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /assistant/generate-content
 */
module.exports.generateContent = catchAsync(async (req, res, next) => {
  const { prompt } = req.body;
  const fullPrompt = `User prompt: ${prompt}`;
  const aiResponse = await aiService.generateContent(fullPrompt);
  res.status(200).json({ content: aiResponse });
});

/**
 * GET /assistant/conversations
 * List all conversations for the current admin/user.
 */
module.exports.listConversations = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const conversations = await assistantModel.listConversations(userId);
  res.status(200).json({ conversations });
});

/**
 * POST /assistant/conversations
 * Create a new conversation.
 */
module.exports.createConversation = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { title } = req.body;
  const conversation = await assistantModel.createConversation(userId, title);
  res.status(201).json({ conversation });
});

/**
 * GET /assistant/conversations/:conversationId
 * Get conversation details and messages.
 */
module.exports.getConversation = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { conversationId } = req.params;
  const conversation = await assistantModel.getConversation(
    userId,
    conversationId,
  );
  if (!conversation)
    return res.status(404).json({ message: 'Conversation not found' });
  res.status(200).json({ conversation });
});

/**
 * GET /assistant/conversations/:conversationId/messages
 * Get paginated messages for a conversation.
 */
module.exports.listMessages = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { conversationId } = req.params;
  const { page = 1, pageSize = 100 } = req.query;
  const messages = await assistantModel.listMessages(
    userId,
    conversationId,
    Number(page),
    Number(pageSize),
  );
  res.status(200).json({ messages });
});

/**
 * POST /assistant/conversations/:conversationId/messages
 * Send a message (admin or AI), creating the conversation if it does not exist.
 */
module.exports.createMessage = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  let { conversationId } = req.query;
  const { content } = req.body;

  // TODO Send request to AI assistant (JSON)
  // Fetch conversation history for context
  let history;
  if (conversationId) {
    history = (
      await assistantModel.listMessages(userId, conversationId, 1, 50)
    ).map((m) => ({
      role: m.senderType,
      parts: [{ text: m.content }],
    }));

    console.log(history);
  }

  // Calling Gemini...
  const aiResponse = await aiService.generateResponse(content, history ?? []);
  console.log(aiResponse);
  // Make sure conversation belongs to user
  let conversation;
  if (
    !conversationId ||
    conversationId === 'null' ||
    conversationId === 'undefined'
  ) {
    // Create new conversation if not provided
    conversation = await assistantModel.createConversation(
      userId,
      'New Conversation',
    ); // TODO Ask AI to generate a title for convo
    conversationId = conversation.conversationId;
  } else {
    // Try to get conversation, if not found, create it
    conversation = await assistantModel.getConversation(userId, conversationId);

    if (!conversation) {
      conversation = await assistantModel.createConversation(
        userId,
        'New Conversation',
      );
      conversationId = conversation.conversationId;
    }
  }

  // Store admin message
  const message = await assistantModel.createMessage(
    conversationId,
    SenderTypes.USER,
    content,
  );

  // Store assistant message
  const aiMessage = await assistantModel.createMessage(
    conversationId,
    SenderTypes.ASSISTANT,
    aiResponse.message,
  );

  res.status(201).json({ conversation, message, aiMessage });
});

module.exports.getAllConversations = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'modifiedAt',
    order = 'desc',
    search = '',
  } = req.query;

  const filter = {};
  // Add more filters if needed

  const conversationList = await assistantModel.getAllConversations({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    search,
    filter,
    userId: res.locals.user.userId, // or get userId from elsewhere if needed
  });

  res.status(200).json({
    status: 'success',
    data: {
      ...conversationList,
      message: 'Successfully retrieved conversation list',
    },
  });
});
