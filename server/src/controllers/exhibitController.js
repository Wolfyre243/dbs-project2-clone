const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const validateFields = require('../utils/validateFields');
const exhibitModel = require('../models/exhibitModel');
const statusCodes = require('../configs/statusCodes');
const AuditActions = require('../configs/auditActionConfig');
const { logAdminAudit } = require('../utils/auditlogs');
const generateQrImageBuffer = require('../utils/generateQrImageBuffer');
const qrModel = require('../models/QRcodeModel');
const { saveAudioFile } = require('../utils/fileUploader');
const { logUserEvent } = require('../utils/eventlogs');
const { verifyQrJwt } = require('../utils/qrJwt');
const EventTypes = require('../configs/eventTypes');

// Create Exhibit controller function
// Takes in an array of subtitle and audio IDs
module.exports.createExhibit = catchAsync(async (req, res, next) => {
  const { title, assetData, imageId } = req.body;
  const description = req.body.description;

  const userId = res.locals.user.userId;

  // Validate required fields
  if (!Array.isArray(assetData.subtitleIds)) {
    throw new AppError('Subtitle IDs must be an array', 400);
  }

  // Create exhibit
  const exhibit = await exhibitModel.createExhibitWithAssets({
    title,
    description,
    createdBy: userId,
    modifiedBy: userId,
    subtitleIdArr: assetData.subtitleIds,
    imageId,
  });

  const qrCode = await qrModel.generateQRCode(userId, exhibit.exhibitId);

  logger.info(
    `Exhibit created successfully: ${exhibit.exhibitId} by Admin ${userId}`,
  );

  logger.info(
    `QR Code generated successfully: ${qrCode.qrCodeId} by Admin ${userId}`,
  );

  // Log audit action
  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'exhibit',
    entityId: exhibit.exhibitId,
    actionTypeId: AuditActions.CREATE,
    logText: `
      Exhibit created successfully: ${exhibit.exhibitId} by Admin ${userId}.\n
      Subtitles: ${assetData.subtitleIds.join(', ')}
    `,
  });

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCode.qrCodeId,
    actionTypeId: AuditActions.CREATE,
    logText: 'QR Code generated successfully',
  });

  res.status(201).json({
    status: 'success',
    data: {
      exhibitId: exhibit.exhibitId,
      message: 'Successfully created exhibit with audio and subtitle',
    },
  });
});

// Get exhibit controller function
module.exports.updateExhibit = catchAsync(async (req, res, next) => {
  const { exhibitId, title, description, imageId } = req.body;
  const createdBy = res.locals.user.userId;

  validateFields({
    exhibitId,
    title,
    description,
    imageId,
    createdBy,
  });

  const updatedExhibit = await exhibitModel.updateExhibit({
    exhibitId,
    title,
    description,
    imageId,
    createdBy,
  });

  if (!updatedExhibit) {
    throw new AppError('Exhibit not found or update failed', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      exhibit: updatedExhibit,
      message: 'Exhibit updated successfully',
    },
  });
});

// Get single exhibit
module.exports.getSingleExhibit = catchAsync(async (req, res, next) => {
  const exhibitId = req.params.exhibitId;
  const exhibit = await exhibitModel.getExhibitById(exhibitId);

  res.status(200).json({
    status: 'success',
    data: {
      exhibit,
    },
  });
});

module.exports.getSingleExhibitMetadata = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const exhibitId = req.params.exhibitId;

  const exhibit = await exhibitModel.getExhibitMetadataById(exhibitId);
  const isFavourite = await exhibitModel.checkExhibitFavourited(
    userId,
    exhibitId,
  );
  res.status(200).json({
    status: 'success',
    data: {
      exhibit,
      isFavourite,
    },
  });
});

// Soft delete
module.exports.deleteExhibit = catchAsync(async (req, res, next) => {
  const exhibitId = req.params.exhibitId;
  const statusCode = statusCodes.DELETED;
  const userId = res.locals.user.userId;

  validateFields({
    exhibitId,
  });

  try {
    const softDelete = await exhibitModel.softDeleteExhibit(
      exhibitId,
      statusCode,
    );

    if (!softDelete) {
      return next(new AppError('Exhibit not found or already deleted.', 404));
    }

    // Log admin audit for soft delete
    await logAdminAudit({
      userId,
      ipAddress: req.ip,
      entityName: 'exhibit',
      entityId: exhibitId,
      actionTypeId: AuditActions.DELETE,
      logText: `Exhibit with ID ${exhibitId} soft deleted by Admin ${userId}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Exhibit deleted',
      deletedRecord: softDelete,
    });
  } catch (error) {
    logger.error('Error deleting exhibit:', error);
    return next(
      new AppError('Failed to delete exhibit. Please try again later.', 500),
    );
  }
});

// Bulk soft delete exhibits
module.exports.bulkDeleteExhibits = catchAsync(async (req, res, next) => {
  const { exhibitIds } = req.body;
  const userId = res.locals.user.userId;

  if (!Array.isArray(exhibitIds) || exhibitIds.length === 0) {
    throw new AppError('exhibitIds must be a non-empty array', 400);
  }

  const result = await exhibitModel.bulkSoftDeleteExhibits(exhibitIds);
  // Log admin audit for each exhibit
  for (const exhibitId of exhibitIds) {
    await logAdminAudit({
      userId,
      ipAddress: req.ip,
      entityName: 'exhibit',
      entityId: exhibitId,
      actionTypeId: AuditActions.DELETE,
      logText: `Exhibit with ID ${exhibitId} soft deleted by Admin ${userId} (bulk)`,
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Bulk deleted ${result.count} exhibits`,
    deletedCount: result.count,
    exhibitIds: result.ids,
  });
});

// Validate QR JWT for exhibit access
// to log users scanning w/ QR code
module.exports.validateQrToken = catchAsync(async (req, res, next) => {
  const { exhibitId } = req.params;
  const { token } = req.body;

  if (!token) {
    throw new AppError('Missing QR token', 400);
  }

  const payload = verifyQrJwt(token);
  if (payload.exhibitId !== exhibitId) {
    throw new AppError('Invalid QR token for this exhibit', 403);
  }

  // Log the QR scan event for statistics
  const userId = res.locals.user?.userId || null;
  console.log('PAYLOAD: ', payload);
  await logUserEvent({
    userId,
    entityId: payload.exhibitId,
    entityName: 'exhibit',
    eventTypeId: EventTypes.QR_SCANNED,
    details: `QR code scanned for exhibit ${exhibitId}`,
    role: res.locals.user?.roleId,
  });

  logger.info(
    `QR code scanned for exhibit ${exhibitId} by user ${userId || 'guest'}`,
  );

  res.status(200).json({ status: 'success', valid: true });
});

// Get all exhibits with pagination, sorting, and search
module.exports.getAllExhibits = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
    statusFilter = null,
  } = req.query;

  const filter = {};
  if (statusFilter) {
    filter.statusId = parseInt(statusFilter);
  }

  const result = await exhibitModel.getAllExhibits({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    search,
    filter,
  });

  logger.info(
    `Retrieved ${pageSize} exhibits for page ${page}, total ${result.exhibitCount} exhibits.`,
  );

  res.status(200).json({
    status: 'success',
    pageCount: Math.ceil(result.exhibitCount / pageSize),
    data: result.exhibits,
  });
});

// Add exhibit to favorites
module.exports.addFavorite = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { exhibitId } = req.params;

  await exhibitModel.addFavoriteExhibit(userId, exhibitId);

  res.status(201).json({ status: 'success', message: 'Exhibit favorited!' });
});

// Remove exhibit from favorites
module.exports.removeFavorite = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { exhibitId } = req.params;

  await exhibitModel.removeFavoriteExhibit(userId, exhibitId);

  res
    .status(200)
    .json({ status: 'success', message: 'Exhibit removed from favorites.' });
});

// Get user's favorite exhibits
module.exports.getFavorites = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;

  const favorites = await exhibitModel.getFavoriteExhibits(userId);

  res.status(200).json({
    status: 'success',
    data: favorites,
  });
});

module.exports.getExhibitsDiscovered = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const { totalCount, discoveredCount } =
    await exhibitModel.getExhibitsDiscoveredCount(userId);

  res.status(200).json({
    status: 'success',
    data: { exhibitsDiscovered: discoveredCount, totalCount },
  });
});
