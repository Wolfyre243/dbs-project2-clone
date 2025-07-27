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
const imageModel = require('../models/imageModel');
const { logAdminAudit } = require('../utils/auditlogs');
const { uploadFile } = require('../utils/fileUploader');

// Getting all images
// TODO: Pagination
module.exports.getAllImages = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'desc',
    search = '',
  } = req.query;

  const result = await imageModel.getAllImages({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    search,
  });

  res.status(200).json({
    status: 'success',
    pageCount: Math.ceil(result.imageCount / pageSize),
    data: result.images,
  });
});

//Getting image by ID
module.exports.getImageById = catchAsync(async (req, res, next) => {
  const imageId = req.params.imageId;
  const imageData = await imageModel.getImageById(imageId);

  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: imageId,
    actionTypeId: AuditActions.READ,
    logText: 'Image retrieved by ID successfully',
  });

  res.status(200).json({
    status: 'success',
    message: `Image with ID ${imageId} retrieved successfully`,
    image: imageData,
  });
});

// Creating new image
module.exports.createImage = catchAsync(async (req, res, next) => {
  const description = req.body.description;
  const createdBy = res.locals.user.userId;

  const image = await imageModel.createImage({
    description,
    createdBy,
  });

  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: image.imageId,
    actionTypeId: AuditActions.CREATE,
    logText: 'Image created successfully',
  });

  logger.info(`Image created successfully by user ${createdBy}`);

  res.status(201).json({
    status: 'success',
    data: image,
  });
});

module.exports.uploadImage = catchAsync(async (req, res, next) => {
  const description = req.body.description;
  const createdBy = res.locals.user.userId;

  logger.debug(`Received file: ${req.file.originalname}`);

  const { fileLink, fileName } = await uploadFile(req.file, 'images');

  const image = await imageModel.createImage({
    description,
    createdBy,
    fileLink,
    fileName,
  });

  await logAdminAudit({
    userId: createdBy,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: image.imageId,
    actionTypeId: AuditActions.CREATE,
    logText: 'Image created successfully',
  });

  logger.info(`Image created successfully by user ${createdBy}`);

  res.status(201).json({
    status: 'success',
    data: {
      ...image,
    },
  });
});

// Update new image
module.exports.updateImage = catchAsync(async (req, res, next) => {
  const imageId = req.params.imageId;
  const { description, fileLink, fileName } = req.body;
  const updateData = {
    description,
    fileLink,
    fileName,
  };

  const updatedImage = await imageModel.updateImage(imageId, updateData);

  if (!updatedImage) {
    logger.warn(`Image with ID ${imageId} not found for update`);
    throw new AppError('Image not found', 404);
  }

  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: imageId,
    actionTypeId: AuditActions.UPDATE,
    logText: 'Image updated successfully',
  });

  logger.info(`Image with ID ${imageId} updated`);

  res.status(200).json({
    status: 'success',
    data: updatedImage,
  });
});

// Archiving image
module.exports.archiveImage = catchAsync(async (req, res, next) => {
  const imageId = req.params.imageId;
  const statusId = statusCodes.DELETED;

  const archivedImage = await imageModel.archiveImage(imageId, statusId);

  if (!archivedImage) {
    logger.warn(`Image with ID ${imageId} not found for archive`);
    throw new AppError('Image not found', 404);
  }

  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: imageId,
    actionTypeId: AuditActions.DELETE,
    logText: 'Image archived successfully',
  });

  logger.info(`Image with ID ${imageId} archived`);

  res.status(200).json({
    status: 'success',
    data: archivedImage,
    message: 'Image archived successfully',
  });
});

// Deleting image
module.exports.deleteImage = catchAsync(async (req, res, next) => {
  const imageId = req.params.imageId;
  const deletedImage = await imageModel.deleteImage(imageId);

  if (!deletedImage) {
    logger.warn(`Image with ID ${imageId} not found for deletion`);
    throw new AppError('Image not found', 404);
  }

  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: imageId,
    actionTypeId: AuditActions.DELETE,
    logText: 'Image deleted successfully',
  });

  logger.info(`Image with ID ${imageId} deleted successfully`);
  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully',
    data: deletedImage,
  });
});

module.exports.hardDeleteImage = catchAsync(async (req, res, next) => {
  const imageId = req.params.imageId;
  const userId = res.locals.user.userId;

  const deletedImage = await imageModel.deleteImage(imageId);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: imageId,
    actionTypeId: AuditActions.DELETE,
    logText: `Image deleted successfully with ID ${imageId}`,
  });

  logger.info(`Image with ID ${imageId} deleted successfully`);
  res.status(200).json({
    status: 'success',
    message: 'Image hard deleted successfully',
  });
});

// Unarchiving image
module.exports.unarchiveImage = catchAsync(async (req, res, next) => {
  const imageId = req.params.imageId;
  const userId = res.locals.user.userId;

  // Check if image exists
  const image = await imageModel.getImageById(imageId);
  if (!image) {
    throw new AppError('Image not found', 404);
  }

  // Unarchive image (set status to ACTIVE)
  await imageModel.unarchiveImage(imageId);

  logger.info(`Unarchived image ${imageId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'image',
    entityId: imageId,
    actionTypeId: AuditActions.UPDATE,
    logText: `Unarchived image with ID ${imageId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'Image unarchived successfully',
  });
});
