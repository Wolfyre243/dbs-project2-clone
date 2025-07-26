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
  const { languageCode } = req.body;

  logger.debug(`Received file: ${req.file.originalname}`);

  // Validation for supported languages
  const supportedLanguages = await languageModel.getActiveLanguages();

  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  const { fileLink, fileName } = await fileUploader.uploadFile(
    req.file,
    'audio',
  );

  // Create audio record using the model
  const audio = await audioModel.createAudio({
    fileLink,
    fileName,
    createdBy: userId,
    languageCode,
  });

  // Log audit action
  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audio.audioId,
    actionTypeId: AuditActions.CREATE,
    logText: `Uploaded audio file at ${fileLink} in ${languageCode}`,
  });

  res.status(200).json({
    status: 'success',
    data: {
      ...audio,
      message:
        'Successfully uploaded audio and saved translated text as subtitle',
    },
  });
});

// Convert text to audio
// Creates just one audio entity
// BACKUP
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

  const { audio, subtitle } = await audioModel.createAudioWithSubtitles({
    description: 'Text-to-speech generated audio',
    fileLink,
    fileName,
    createdBy: userId,
    languageCode,
    subtitleText: text,
  });

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audio.audioId,
    actionTypeId: AuditActions.CREATE,
    logText: `Created audio file with ID ${audio.audioId}`,
  });

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitle.subtitleId,
    actionTypeId: AuditActions.CREATE,
    logText: `Created subtitle with ID ${subtitle.subtitleId}`,
  });

  logger.info(`Converted text to audio ${audio.audioId}`);

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      subtitleId: subtitle.subtitleId,
      fileLink,
      fileName,
      languageCode,
      text,
    },
  });
});

module.exports.generateAudio = catchAsync(async (req, res, next) => {
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
    logText: `(TTS) Created audio file with ID ${audio.audioId}`,
  });

  logger.info(`Converted text to audio ${audio.audioId}`);

  res.status(200).json({
    status: 'success',
    data: {
      audioId: audio.audioId,
      fileLink,
      fileName,
      languageCode,
      text,
    },
  });
});

// module.exports.updateSubtitle = catchAsync(async (req, res, next) => {
//   const { subtitleId } = req.params;
//   const { subtitleText, languageCode } = req.body;
//   const userId = res.locals.user.userId;
//   const role = res.locals.user.role; // Assuming role is stored in JWT payload

//   // Restrict to admins only
//   if (role !== Roles.ADMIN) {
//     throw new AppError('Only admins can update subtitles', 403);
//   }

//   // Validate inputs
//   if (!subtitleText || !subtitleText.trim()) {
//     throw new AppError('Subtitle text is required and cannot be empty', 400);
//   }

//   // Validate language code if provided
//   const supportedLanguages = await languageModel.getActiveLanguages();
//   if (languageCode && !supportedLanguages.includes(languageCode)) {
//     throw new AppError(
//       `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
//       400,
//     );
//   }

//   // Check if subtitle exists
//   const subtitle = await audioModel.getSubtitleById(subtitleId);
//   if (!subtitle) {
//     throw new AppError('Subtitle not found', 404);
//   }

//   // Update subtitle
//   const updatedSubtitle = await audioModel.updateSubtitle({
//     subtitleId,
//     subtitleText,
//     languageCode: languageCode || subtitle.languageCode, // Keep existing languageCode if not provided
//     modifiedBy: userId,
//     ipAddress: req.ip || '0.0.0.0',
//   });

//   logger.info(`Subtitle updated successfully: subtitleId=${subtitleId}`);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       subtitleId: updatedSubtitle.subtitleId,
//       subtitleText: updatedSubtitle.subtitleText,
//       languageCode: updatedSubtitle.languageCode,
//       message: 'Subtitle updated successfully',
//     },
//   });
// });

// Pagination
// module.exports.getAllSubtitles = catchAsync(async (req, res, next) => {
//   const userId = res.locals.user.userId;
//   const roleId = res.locals.user.roleId;

//   // Restrict to admins only
//   if (roleId !== Roles.ADMIN) {
//     throw new AppError('Only admins can view subtitles', 403);
//   }

//   // Fetch all subtitles for admins
//   const subtitles = await audioModel.getAllSubtitles({
//     userId,
//     isAdmin: true,
//   });

//   logger.info(
//     `Fetched ${subtitles.length} subtitles for admin userId=${userId}`,
//   );

//   res.status(200).json({
//     status: 'success',
//     data: {
//       subtitles,
//       message: 'Successfully retrieved subtitles',
//     },
//   });
// });

//Get single audio by ID
module.exports.getSingleAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;

  const audio = await audioModel.getAudioById(audioId);
  if (!audio) {
    throw new AppError('Audio not found', 404);
  }

  logger.info(`Fetched audio ${audioId}`);

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

  logger.info(`Archived audio ${audioId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audioId,
    actionTypeId: AuditActions.UPDATE,
    logText: `Archived audio with ID ${audioId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Audio archived successfully',
  });
});

// Hard delte audio
module.exports.hardDeleteAudio = catchAsync(async (req, res, next) => {
  const { audioId } = req.params;
  const userId = res.locals.user.userId;

  // Hard delete audio
  await audioModel.hardDeleteAudio(audioId, userId, req.ip);

  logger.info(`Hard deleted audio ${audioId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audioId,
    actionTypeId: AuditActions.DELETE,
    logText: `Hard deleted audio with ID ${audioId}`,
  });

  logger.info(`Audio with ID ${audioId} deleted successfully`);
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

  logger.info(`Unarchived audio ${audioId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audioId,
    actionTypeId: AuditActions.UPDATE,
    logText: `Unarchived audio with ID ${audioId}`,
  });

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

  logger.info(`Soft deleted audio ${audioId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'audio',
    entityId: audioId,
    actionTypeId: AuditActions.DELETE,
    logText: `Soft deleted audio with ID ${audioId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Audio soft deleted successfully',
  });
});

// get all audio with pagination, sorting, and filtering
module.exports.getAllAudio = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    languageCodeFilter = null,
  } = req.query;

  // TODO: Multi-filter?
  const filter = {};
  if (languageCodeFilter) {
    filter.languageCode = languageCodeFilter;
  }

  // Fetch all audio for admin or user's own audio
  const audioList = await audioModel.getAllAudio({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    search,
    filter,
  });

  logger.info(`Retrieved ${pageSize} audio files for page ${page}.`);

  res.status(200).json({
    status: 'success',
    data: {
      ...audioList,
      message: 'Successfully retrieved audio list',
    },
  });
});
