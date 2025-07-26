const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const validateFields = require('../utils/validateFields');
const exhibitModel = require('../models/exhibitModel');
const statusCodes = require('../configs/statusCodes');
const AuditActions = require('../configs/auditActionConfig');
const { logAdminAudit } = require('../utils/auditlogs');

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

  logger.info(
    `Exhibit created successfully: ${exhibit.exhibitId} by Admin ${userId}`,
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
  const { exhibitId, title, description, audioId, imageId, statusId } =
    req.body;
  const createdBy = res.locals.user.userId;

  validateFields({
    exhibitId,
    title,
    description,
    audioId,
    imageId,
    statusId,
    createdBy,
  });

  try {
    const updatedExhibit = await exhibitModel.updateExhibit({
      exhibitId,
      title,
      description,
      audioId,
      imageId,
      statusId,
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
  } catch (error) {
    next(error);
  }
});

// Get single exhibit
module.exports.getSingleExhibit = catchAsync(async (req, res, next) => {
  const exhibitId = req.params.exhibitId;

  validateFields({
    exhibitId,
  });

  try {
    const exhibit = await exhibitModel.getExhibitById(exhibitId);

    if (!exhibit) {
      throw new AppError('Exhibit not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        exhibit,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Soft delete
module.exports.deleteExhibit = catchAsync(async (req, res, next) => {
  const exhibitId = req.params.exhibitId;
  const statusCode = statusCodes.ARCHIVED;

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
