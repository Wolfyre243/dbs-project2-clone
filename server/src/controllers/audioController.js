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
// module.exports.convertTextToAudio = catchAsync(async (req, res, next) => {
//   const { text, languageCode, description } = req.body;
//   const userId = res.locals.user.userId;

//   if (!text || !languageCode) {
//     throw new AppError('Text and languageCode are required', 400);
//   }

//   // Validate language code
//   const supportedLanguages = await languageModel.getActiveLanguages();
//   if (!supportedLanguages.includes(languageCode)) {
//     throw new AppError(
//       `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
//       400,
//     );
//   }

//   // Define the destination path for the audio file
//   // const destinationPath = path.join(__dirname, '../../Uploads/audio');

//   // Generate audio from text
//   const { fileLink } = await textToSpeech(text, languageCode);

//   // Create audio and subtitle records using the model
//   const { audio, subtitle } = await audioModel.createTextToAudio({
//     text,
//     fileLink,
//     languageCode,
//     createdBy: userId,
//     ipAddress: req.ip,
//     description: description || 'Text-to-speech generated audio',
//     statusId: statusCodes.ACTIVE,
//   });

//   logger.info(`Text converted to audio and saved successfully: ${fileLink}`);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       audioId: audio.audioId,
//       fileLink,
//       languageCode,
//       subtitleId: subtitle.subtitleId,
//       message: 'Successfully converted text to audio and saved as subtitle',
//     },
//   });
//   // next();
// });

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
      const { fileLink } = await textToSpeech(text, languageCode);

      const audio = await audioModel.createAudio({
        description: 'Text-to-speech generated audio',
        fileLink,
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
