// Import types
const AppError = require('../utils/AppError');
const Roles = require('../configs/roleConfig');
const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');

// Import utilities
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { encryptData, decryptData } = require('../utils/encryption');
const {
  transcribeAndTranslateAudio,
  textToSpeech,
} = require('../utils/ttsService');
const fileUploader = require('../utils/fileUploader');

// Impoort Models
const audioModel = require('../models/audioModel');
const languageModel = require('../models/languageModel');
const subtitleModel = require('../models/subtitleModel');
const { logAdminAudit } = require('../utils/auditlogs');

// FIXME
module.exports.uploadAudio = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('No audio file uploaded', 400);
  }

  // const { filename, path: filePath } = req.file;
  const userId = res.locals.user.userId;
  const languageCode = req.body.languageCode;
  const description = req.body.description || 'No description provided';
  // TODO Include more file details
  logger.debug(`Received file: ${req.file.originalname}`);

  // Validation for supported languages
  const supportedLanguages = await languageModel.getActiveLanguages();
  // TODO Transfer to validator middlware
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
  // TODO: Make optional
  const { transcription, translations } = await transcribeAndTranslateAudio(
    req.file,
    languageCode,
  );
  if (!transcription) {
    throw new Error('Failed to transcribe audio');
  }

  // Get the translated text for the specified languageCode
  const translatedText = translations[languageCode];
  if (!translatedText) {
    throw new Error(
      `No translation available for language code: ${languageCode}`,
    );
  }

  const fileLink = await fileUploader.uploadFile(req.file, 'audio');

  // Create audio record using the model
  const audio = await audioModel.createAudio({
    description,
    fileLink,
    createdBy: userId,
    languageCode,
    statusId: statusCodes.ACTIVE,
  });

  // Log audit action
  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audio.audioId,
    actionTypeId: AuditActions.CREATE,
    logText: `Uploaded, transcribed, and translated audio file at ${fileLink} to ${languageCode}`,
  });

  // Create subtitle record with translated text
  const subtitle = await audioModel.createSubtitle({
    subtitleText: translatedText,
    languageCode,
    createdBy: userId,
    modifiedBy: userId,
    statusId: statusCodes.ACTIVE,
  });

  logger.info(`Audio uploaded, transcribed, and translated successfully`);

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileLink: audio.fileLink,
      languageCode,
      transcription: translatedText, // Return translated text as transcription
      translations,
      subtitleId: subtitle.subtitleId,
      message:
        'Successfully uploaded audio and saved translated text as subtitle',
    },
  });

  // TODO call next
});

// Convert text to audio
// Creates just one audio entity
module.exports.convertTextToAudio = catchAsync(async (req, res, next) => {
  const { text, languageCode } = req.body;
  const userId = res.locals.user.userId;

  // Validate language code
  const supportedLanguages = await languageModel.getActiveLanguages();
  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  // Generate audio from text
  const { fileLink, fileName } = await textToSpeech(text, languageCode);

  const audio = await audioModel.createAudio({
    description: 'Text-to-speech generated audio',
    fileLink,
    fileName,
    createdBy: userId,
    languageCode,
  });

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audio.audioId,
    actionTypeId: AuditActions.CREATE,
    logText: `Created audio file with ID ${audio.audioId}`,
  });

  logger.debug(`Text converted to audio and saved successfully: ${fileLink}`);

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileLink,
      fileName,
      languageCode,
      text,
      message: 'Successfully converted text to audio and saved as subtitle',
    },
  });
});

module.exports.convertMultiTextToAudio = catchAsync(async (req, res, next) => {
  const { subtitleArr } = req.body;
  const userId = res.locals.user.userId;

  const supportedLanguages = await languageModel.getActiveLanguages();

  if (!Array.isArray(subtitleArr)) {
    throw new AppError('subtitleArr must be an array', 400);
  }

  // Create an array of audio + subtitle
  const generatedAssetIdsArray = subtitleArr.map(async (subtitleObj) => {
    const { text, languageCode, tts } = subtitleObj;
    if (!text || !languageCode || !tts) {
      throw new AppError(
        'Text, languageCode and TTS options are required',
        400,
      );
    }

    // Validate language code
    if (!supportedLanguages.includes(languageCode)) {
      throw new AppError(
        `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
        400,
      );
    }

    let assetObj = {};
    // If user wants TTS
    if (tts) {
      // Generate audio from text
      // We are assuming text input is already translated
      const { fileLink, fileName } = await textToSpeech(text, languageCode);

      const audio = await audioModel.createAudio({
        description: 'Text-to-speech generated audio',
        fileLink,
        fileName,
        createdBy: userId,
        languageCode,
      });
      // console.log('Generated Audio: ', audio)
      assetObj['audioId'] = audio.audioId;

      await logAdminAudit({
        userId,
        ipAddress: req.ip,
        entityName: 'audio',
        entityId: audio.audioId,
        actionTypeId: AuditActions.CREATE,
        logText: `Created audio file with ID ${audio.audioId}`,
      });

      logger.debug(
        `Text converted to audio and saved successfully: ${fileLink}`,
      );
    }

    const subtitle = await subtitleModel.create({
      subtitleText: text,
      languageCode,
      createdBy: userId,
      modifiedBy: userId,
    });
    assetObj['subtitleId'] = subtitle.subtitleId;

    await logAdminAudit({
      userId,
      ipAddress: req.ip,
      entityName: 'subtitle',
      entityId: subtitle.subtitleId,
      actionTypeId: AuditActions.CREATE,
      logText: `Created subtitle entity with ID ${subtitle.subtitleId}`,
    });

    return assetObj;
  });

  // Pass on the IDs of the generated assets
  res.locals.generatedAssetIdsArray = await Promise.all(generatedAssetIdsArray);
  return next();
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
  const supportedLanguages = await languageModel.getActiveLanguages();
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

//Get single audio by ID
module.exports.getSingleAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;

  const audio = await audioModel.getAudioById(audioId);
  if (!audio) {
    throw new AppError('Audio not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      audio,
      message: 'Successfully retrieved audio',
    },
  });
});

// archive audio by setting status to archived
module.exports.archiveAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;
  const userId = res.locals.user.userId;

  // Check if audio exists
  const audio = await audioModel.getAudioById(audioId);
  if (!audio) {
    throw new AppError('Audio not found', 404);
  }

  
  await audioModel.archiveAudio(audioId, userId, req.ip);

  res.status(200).json({
    status: 'success',
    message: 'Audio archived successfully',
  });
});

// Hard delte audio
module.exports.hardDeleteAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;
  const userId = res.locals.user.userId;

  // Check if audio exists
  const audio = await audioModel.getAudioById(audioId);
  if (!audio) {
    throw new AppError('Audio not found', 404);
  }

  // Hard delete audio
  await audioModel.hardDeleteAudio(audioId, userId, req.ip);

  res.status(200).json({
    status: 'success',
    message: 'Audio hard deleted successfully',
  });
});

// unarchive audio
module.exports.unarchiveAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;
  const userId = res.locals.user.userId;

  // Check if audio exists
  const audio = await audioModel.getAudioById(audioId);
  if (!audio) {
    throw new AppError('Audio not found', 404);
  }

  // Unarchive audio
  await audioModel.unarchiveAudio(audioId, userId, req.ip);

  res.status(200).json({
    status: 'success',
    message: 'Audio unarchived successfully',
  });
});

// soft delte audio
module.exports.softDeleteAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;
  const userId = res.locals.user.userId;

  // Check if audio exists
  const audio = await audioModel.getAudioById(audioId);
  if (!audio) {
    throw new AppError('Audio not found', 404);
  }

  // Soft delete audio by setting status to deleted
  await audioModel.softDeleteAudio(audioId, userId, req.ip);

  res.status(200).json({
    status: 'success',
    message: 'Audio soft deleted successfully',
  });
});

//get all audio with pagination, sorting, and filtering
module.exports.getAllAudio = catchAsync(async (req, res, next) => {
  const { page = 1, pageSize = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
  const userId = res.locals.user.userId;
  const isAdmin = res.locals.user.role === Roles.ADMIN;

  // Fetch all audio for admin or user's own audio
  const audioList = await audioModel.getAllAudio({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    userId,
    isAdmin,
  });

  res.status(200).json({
    status: 'success',
    data: {
      audioList,
      message: 'Successfully retrieved audio list',
    },
  });
});
