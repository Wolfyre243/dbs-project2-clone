const assistantModel = require('../models/assistantModel');
const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');

module.exports.generateContent = catchAsync(async (req, res, next) => {
  // const userId = res.locals.user.userId;
  const { prompt } = req.body;

  console.log('Prompt: ', prompt);
  const fullPrompt = `User prompt: ${prompt}`;

  // Call AI service
  const aiResponse = await aiService.generateContent(fullPrompt);

  // TODO: Log event?
  console.log('Output: ', aiResponse);

  res.status(200).json({ content: aiResponse });
});
