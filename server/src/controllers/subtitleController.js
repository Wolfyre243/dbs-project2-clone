// Import types
const AppError = require('../utils/AppError');
const Roles = require('../configs/roleConfig');
const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');

// Import utilities
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { encryptData, decryptData } = require('../utils/encryption');

// Impoort Models
const languageModel = require('../models/languageModel');
const subtitleModel = require('../models/subtitleModel');
const { logAdminAudit } = require('../utils/auditlogs');

// module.exports.createSubtitle = catchAsync(async (req, res, next) => {
//   const { text, languageCode } = req.body;
//   const userId = res.locals.user.userId;

//   // Validate language code
//   const supportedLanguages = await languageModel.getActiveLanguages();
//   if (!supportedLanguages.includes(languageCode)) {
//     throw new AppError(
//       `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
//       400,
//     );
//   }

//   const subtitle = await subtitleModel.create({
//     subtitleText: text,
//     languageCode,
//     createdBy: userId,
//     modifiedBy: userId,
//   });

//   await logAdminAudit({
//     userId,
//     ipAddress: req.ip,
//     entityName: 'subtitle',
//     entityId: subtitle.subtitleId,
//     actionTypeId: AuditActions.CREATE,
//     logText: `Created subtitle entity with ID ${subtitle.subtitleId}`,
//   });

//   logger.debug(`Subtitle created successfully with ID: ${subtitle.subtitleId}`);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       subtitleId: subtitle.subtitleId,
//       languageCode,
//       text,
//       message: 'Successfully created subtitle',
//     },
//   });
// });

// Archive subtitle
module.exports.archiveSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  await subtitleModel.archiveSubtitle(subtitleId, userId);

  logger.info(`Archived subtitle ${subtitleId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.UPDATE,
    logText: `Archived subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle archived successfully',
  });
});

// Unarchive subtitle
module.exports.unarchiveSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  await subtitleModel.unarchiveSubtitle(subtitleId, userId);

  logger.info(`Unarchived subtitle ${subtitleId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.UPDATE,
    logText: `Unarchived subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle unarchived successfully',
  });
});

// Soft delete subtitle
module.exports.softDeleteSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  await subtitleModel.softDeleteSubtitle(subtitleId, userId);

  logger.info(`Soft deleted subtitle ${subtitleId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.DELETE,
    logText: `Soft deleted subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle soft deleted successfully',
  });
});

// hard delete subtitle
module.exports.hardDeleteSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  await subtitleModel.hardDeleteSubtitle(subtitleId, userId);

  logger.info(`Hard deleted subtitle ${subtitleId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.DELETE,
    logText: `Hard deleted subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle hard deleted successfully',
  });
});

// get all subttiles for admin using pagination
module.exports.getAllSubtitles = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    languageCodeFilter = null,
  } = req.query;

  const filter = {};
  if (languageCodeFilter) {
    filter.languageCode = languageCodeFilter;
  }

  const result = await subtitleModel.getAllSubtitles({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    search,
    filter,
  });

  logger.info(
    `Retrieved ${pageSize} subtitles for page ${page}, total ${result.subtitleCount} subtitles.`,
  );

  res.status(200).json({
    status: 'success',
    pageCount: Math.ceil(result.subtitleCount / pageSize),
    data: result.subtitles,
  });
});

// Get a single subtitle by ID
module.exports.getSubtitleById = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;

  const subtitle = await subtitleModel.getSubtitleById(subtitleId);
  if (!subtitle) {
    return next(new AppError('Subtitle not found', 404));
  }

  logger.info(`Fetched subtitle ${subtitleId}`);

  res.status(200).json({
    status: 'success',
    data: {
      ...subtitle,
    },
  });
});
