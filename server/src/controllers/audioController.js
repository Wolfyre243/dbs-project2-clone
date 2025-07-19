const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
const ttsService = require('../utils/ttsService');
const { transcribeAndTranslateAudio } = ttsService;

// Check if transcribe function is available
if (!transcribeAndTranslateAudio) {
  throw new AppError('Transcription and translation service not available', 500);
} else {
  logger.info('Transcription and translation service loaded successfully');
}

module.exports.uploadAudio = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('No audio file uploaded', 400);
  }

  const { filename, path: filePath } = req.file;
  const userId = res.locals.user.userId;
  const languageCode = req.body.languageCode;
  const description = req.body.description || 'No description provided';
  logger.info(`Uploaded file: ${JSON.stringify(req.file)}`);

  // Validate language code
  const supportedLanguages = [
  'eng', // English
    'spa', // Spanish
    'fre', // French
    'ger', // German
    'zho', // Chinese (Mandarin)
    'msa', // Malay
    'tam', // Tamil
  ];
  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  // Transcribe and translate audio
  const { transcription, translations } = await transcribeAndTranslateAudio(filePath, languageCode);
  if (!transcription) {
    throw new AppError('Failed to transcribe audio', 500);
  }

  // Create audio record using the model
  const audio = await audioModel.createAudio({
    description: description,
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
    actionType: 'CREATE',
    logText: `Uploaded, transcribed, and translated audio file: ${filename} to ${languageCode}`,
  });

 // Create subtitle record with transcription text and custom subtitleId format
  const subtitle = await audioModel.createSubtitle({
    subtitleText: transcription,
    languageCode,
    createdBy: userId,
    modifiedBy: userId,
    statusId: 1, // active status
  });

logger.info(`Audio uploaded, transcribed, and translated successfully: ${filename}`);

 res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileName: audio.fileName,
      languageCode,
      transcription,
      translations,
      subtitleId: subtitle.subtitleId,
      message: 'Successfully uploaded audio and saved transcription as subtitle',
    },
  });
});