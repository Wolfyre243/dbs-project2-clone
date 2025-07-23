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

module.exports.createSubtitle = catchAsync(async (req, res, next) => {
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

  const subtitle = await subtitleModel.create({
    subtitleText: text,
    languageCode,
    createdBy: userId,
    modifiedBy: userId,
  });

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitle.subtitleId,
    actionTypeId: AuditActions.CREATE,
    logText: `Created subtitle entity with ID ${subtitle.subtitleId}`,
  });

  logger.debug(`Text converted to audio and saved successfully: ${fileLink}`);

  res.status(201).json({
    status: 'success',
    data: {
      subtitleId: subtitle.subtitleId,
      languageCode,
      text,
      message: 'Successfully created subtitle',
    },
  });
});

//archive subtitle by setting status to archived
module.exports.archiveSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  // Check if subtitle exists
  const subtitle = await subtitleModel.getSubtitleById(subtitleId);
  if (!subtitle) {
    throw new AppError('Subtitle not found', 404);
  }

  // Archive the subtitle
  await subtitleModel.archiveSubtitle(subtitleId, userId, req.ip);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.ARCHIVE,
    logText: `Archived subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle archived successfully',
  });
});

//unarchive subtitle by setting status to active
module.exports.unarchiveSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  // Check if subtitle exists
  const subtitle = await subtitleModel.getSubtitleById(subtitleId);
  if (!subtitle) {
    throw new AppError('Subtitle not found', 404);
  }

  // Unarchive the subtitle
  await subtitleModel.unarchiveSubtitle(subtitleId, userId, req.ip);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.UNARCHIVE,
    logText: `Unarchived subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle unarchived successfully',
  });
});

//soft delete subtitle by setting status to deleted
module.exports.softDeleteSubtitle = catchAsync(async (req, res, next) => {
  const { subtitleId } = req.params;
  const userId = res.locals.user.userId;

  // Check if subtitle exists
  const subtitle = await subtitleModel.getSubtitleById(subtitleId);
  if (!subtitle) {
    throw new AppError('Subtitle not found', 404);
  }

  // Soft delete the subtitle
  await subtitleModel.softDeleteSubtitle(subtitleId, userId, req.ip);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitleId,
    actionTypeId: AuditActions.SOFT_DELETE,
    logText: `Soft deleted subtitle entity with ID ${subtitleId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subtitle soft deleted successfully',
  });
});

// get all subttilesfor admin using pagination
module.exports.getAllSubtitles = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'asc',
    search = '',
    statusFilter = null,
  } = req.query;

  const filter = {};
  if (statusFilter) {
    filter.statusId = parseInt(statusFilter);
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
    `Retrieved ${pageSize} subtitles for page ${page}, total ${result.subtitleCount} subtitles.`
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
  const userId = res.locals.user.userId;
  const isAdmin = res.locals.user.role === Roles.ADMIN;

  const subtitle = await subtitleModel.getSubtitleById({ subtitleId, userId, isAdmin });
  if (!subtitle) {
    return next(new AppError('Subtitle not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subtitle,
    },
  });
});

