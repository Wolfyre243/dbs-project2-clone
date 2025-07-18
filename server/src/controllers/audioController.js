// Import dependencies
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import services
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { encryptData, decryptData } = require('../utils/encryption');
const audioModel = require('../models/audioModel');
const {
  cookieOptions,
  verifySK,
  verifyTokenDuration,
  tokenAlgorithm,
} = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');

const Roles = require('../configs/roleConfig');

const ttsService = require('../utils/ttsService'); // Import the entire module to debug
const { transcribeAudio } = ttsService; // Destructure transcribeAudio

// Debug import
console.log('ttsService loaded:', ttsService);
if (!transcribeAudio) {
  throw new AppError('Transcription service not available', 500);
}

/* module.exports.uploadAudio = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const fileName = req.file.filename;
  console.log('New name of file: ', fileName);
  res.status(200).json({ message: 'Successfully uploaded file' });
}); */

module.exports.uploadAudio = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('No audio file uploaded', 400);
  }

  const { filename, path: filePath } = req.file;
  const userId = req.locals.user.userId;
  const languageCode = req.body.languageCode;

  // Validate language code
  const supportedLanguages = [
    'en-US',
    'es-ES',
    'fr-FR',
    'de-DE',
    'ja-JP',
    'cmn-CN',
    'ml-IN',
    'ta-IN',
  ];
  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  // Transcribe audio to text
  const transcription = await transcribeAudio(filePath, languageCode);
  if (!transcription) {
    throw new AppError('Failed to transcribe audio', 500);
  }

  // Create audio record using the model
  const audio = await audioModel.createAudio({
    fileName: filename,
    createdBy: userId,
    languageId: languageCode,
    statusId: 1, // Assuming 1 is active status
  });

  // Log audit action
  await audioModel.createAuditLog({
    userId,
    ipAddress: req.ip || '0.0.0.0',
    entityName: 'audio',
    entityId: audio.audioId,
    actionType: 'UPLOAD_AND_TRANSCRIBE_AUDIO',
    logText: `Uploaded and transcribed audio file: ${filename} to ${languageCode}`,
  });

  logger.info(`Audio uploaded and transcribed successfully: ${filename}`);

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileName: audio.fileName,
      languageCode,
      message: 'Successfully uploaded and transcribed audio',
    },
  });
});
