const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { encryptData, decryptData } = require('../utils/encryption');
const audioModel = require('../models/audioModel');
const languageModel = require('../models/languageModel');
const {
  cookieOptions,
  verifySK,
  verifyTokenDuration,
  tokenAlgorithm,
} = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');
const Roles = require('../configs/roleConfig');
const ttsService = require('../utils/ttsService');
const { transcribeAndTranslateAudio, textToSpeech } = ttsService;
const path = require('path');
const AuditActions = require('../configs/auditActionConfig');
const fileUploader = require('../utils/fileUploader');
const statusCodes = require('../configs/statusCodes');

// Check if transcribe function is available
if (!transcribeAndTranslateAudio) {
  throw new AppError(
    'Transcription and translation service not available',
    500,
  );
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
  logger.debug(`Received file: ${JSON.stringify(req.file)}`);

  const supportedLanguages = await audioModel.getActiveLanguages();
  if (!languageCode) {
    throw new AppError('Language code is required', 400);
  }

  console.log(`Supported languages: ${supportedLanguages.join(', ')}`);

  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  // Transcribe and translate audio
  const { transcription, translations } = await transcribeAndTranslateAudio(
    filePath,
    languageCode,
  );
  if (!transcription) {
    throw new AppError('Failed to transcribe audio', 500);
  }

  // Get the translated text for the specified languageCode
  const translatedText = translations[languageCode];
  if (!translatedText) {
    throw new AppError(
      `No translation available for language code: ${languageCode}`,
      500,
    );
  }

  // Create audio record using the model
  const audio = await audioModel.createAudio({
    description: description,
    fileName: filename,
    createdBy: userId,
    languageCode: languageCode,
    statusId: 1, // Assuming 1 is active status
  });

  // Log audit action
  await audioModel.createAuditLog({
    userId,
    ipAddress: req.ip || '0.0.0.0',
    entityName: 'audio',
    entityId: audio.audioId,
    actionTypeId: AuditActions.CREATE,
    logText: `Uploaded, transcribed, and translated audio file: ${filename} to ${languageCode}`,
  });

  // Create subtitle record with translated text
  const subtitle = await audioModel.createSubtitle({
    subtitleText: translatedText,
    languageCode,
    createdBy: userId,
    modifiedBy: userId,
    statusId: 1, // active status
  });

  logger.info(
    `Audio uploaded, transcribed, and translated successfully: ${filename}`,
  );

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileName: audio.fileName,
      languageCode,
      transcription: translatedText, // Return translated text as transcription
      translations,
      subtitleId: subtitle.subtitleId,
      message:
        'Successfully uploaded audio and saved translated text as subtitle',
    },
  });
  next()
});

// Convert text to audio
module.exports.convertTextToAudio = catchAsync(async (req, res, next) => {
  const { text, languageCode, description } = req.body;
  const userId = res.locals.user.userId;

  if (!text || !languageCode) {
    throw new AppError('Text and languageCode are required', 400);
  }

  // Validate language code
  const supportedLanguages = await languageModel.getActiveLanguages();
  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  // Define the destination path for the audio file
  const destinationPath = path.join(__dirname, '../../Uploads/audio');

  // Generate audio from text
  const { fileName, filePath } = await textToSpeech(
    text,
    languageCode,
    destinationPath,
  );

  // Create audio and subtitle records using the model
  const { audio, subtitle } = await audioModel.createTextToAudio({
    text,
    fileName,
    languageCode,
    createdBy: userId,
    ipAddress: req.ip,
    description: description || 'Text-to-speech generated audio',
    statusId: statusCodes.ACTIVE,
  });

  logger.info(`Text converted to audio and saved successfully: ${fileName}`);

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileName,
      languageCode,
      subtitleId: subtitle.subtitleId,
      message: 'Successfully converted text to audio and saved as subtitle',
    },
  });
  next();
});

module.exports.updateSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const { subtitleText, languageCode } = req.body;
  const userId = res.locals.user.userId;
  const role = res.locals.user.role; // Assuming role is stored in JWT payload

  // Restrict to admins only
  if (role !== Roles.ADMIN) {
    throw new AppError('Only admins can update subtitles', 403);
  }

  // Validate inputs
  if (!subtitleText || !subtitleText.trim()) {
    throw new AppError('Subtitle text is required and cannot be empty', 400);
  }

  // Validate language code if provided
  const supportedLanguages = await audioModel.getActiveLanguages();
  if (languageCode && !supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  // Check if subtitle exists
  const subtitle = await audioModel.getSubtitleById(subtitleId);
  if (!subtitle) {
    throw new AppError('Subtitle not found', 404);
  }

  // Update subtitle
  const updatedSubtitle = await audioModel.updateSubtitle({
    subtitleId,
    subtitleText,
    languageCode: languageCode || subtitle.languageCode, // Keep existing languageCode if not provided
    modifiedBy: userId,
    ipAddress: req.ip || '0.0.0.0',
  });

  logger.info(`Subtitle updated successfully: subtitleId=${subtitleId}`);

  res.status(200).json({
    status: 'success',
    data: {
      subtitleId: updatedSubtitle.subtitleId,
      subtitleText: updatedSubtitle.subtitleText,
      languageCode: updatedSubtitle.languageCode,
      message: 'Subtitle updated successfully',
    },
  });
});

module.exports.getAllSubtitles = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const role = res.locals.user.role;

  // Restrict to admins only
  if (role !== Roles.ADMIN) {
    throw new AppError('Only admins can view subtitles', 403);
  }

  // Fetch all subtitles for admins
  const subtitles = await audioModel.getAllSubtitles({
    userId,
    isAdmin: true,
  });

  logger.info(
    `Fetched ${subtitles.length} subtitles for admin userId=${userId}`,
  );

  res.status(200).json({
    status: 'success',
    data: {
      subtitles,
      message: 'Successfully retrieved subtitles',
    },
  });
});
