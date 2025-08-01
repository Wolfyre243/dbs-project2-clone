// IMPORTS-----------------------------------------------------------------

const AppError = require('../utils/AppError');
const Roles = require('../configs/roleConfig');
const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');

const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { encryptData, decryptData } = require('../utils/encryption');

const qrModel = require('../models/QRcodeModel');
const { logAdminAudit } = require('../utils/auditlogs');
const { error } = require('winston');

//========================================================================
// CONTROLLER FUNCTIONS
//========================================================================
// GENERATE QR-CODE
module.exports.generateQRCode = catchAsync(async (req, res, next) => {
  const createdBy = res.locals.user.userId;
  const { exhibitId } = req.body;

  const { qrCodeId, fileLink, fileName } = await qrModel.generateQRCode(
    createdBy,
    exhibitId,
  );

  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCodeId,
    actionTypeId: AuditActions.CREATE,
    logText: 'QR-code generated successfully',
  });

  logger.info(`QR code with ID ${qrCodeId} generated by ${createdBy}`);

  res.status(201).json({
    status: 'success',
    message: 'QR-code generated successfully',
    data: {
      qrCodeId,
      fileLink,
      fileName,
    },
  });
});

// RE-GENERATE QR-CODE
module.exports.regenerateQRcode = catchAsync(async (req, res, next) => {
  const exhibitId = req.params.exhibitId;
  const createdBy = res.locals.user.userId;

  const { fileLink, fileName, qrCodeId } = await qrModel.generateQRCode(
    createdBy,
    exhibitId,
  );

  await logAdminAudit({
    userId: createdBy,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCodeId,
    actionTypeId: AuditActions.UPDATE,
    logText: 'QR-code regenerated successfully',
  });

  logger.info(`New QR code with ID ${qrCodeId} regenerated by ${createdBy}`);

  res.status(200).json({
    status: 'success',
    message: 'QR-code successfully re-generated',
    data: {
      qrCodeId: qrCodeId,
      fileLink: fileLink,
      fileName: fileName,
    },
  });
});

// GET QR-CODE BY ID
module.exports.getQRCodeById = catchAsync(async (req, res, next) => {
  try {
    const qrCodeId = req.params.qrCodeId;

    if (!qrCodeId) {
      throw new AppError('qrCodeId not provided', 400);
    }

    const getQRcode = await qrModel.getQRCodeById(qrCodeId);

    await logAdminAudit({
      userId: res.locals.user.userId,
      ipAddress: req.ip,
      entityName: 'qrCode',
      entityId: qrCodeId,
      actionTypeId: AuditActions.READ,
      logText: 'QR-code retrived by ID successfully',
    });

    res.status(200).json({
      status: 'success',
      message: `QR-code with ID ${qrCodeId} retrieved successfuly`,
      data: { getQRcode },
    });
  } catch (error) {
    logger.error('Error fetching image by ID', error);
    next(error);
  }
});

// GET ALL QR-CODES
module.exports.getAllQRcodes = catchAsync(async (req, res, next) => {
  try {
    const QRcodes = await qrModel.getAllQRcodes();

    res.status(200).json({
      status: 'success',
      message: 'All QR-codes retrieved successfully',
      data: QRcodes,
    });
  } catch (error) {
    logger.error('Error getting all images', error);
    next(error);
  }
});

// SOFT-DELETE QR-CODES
module.exports.softDeleteQRCode = catchAsync(async (req, res, next) => {
  const { qrCodeId } = req.params;
  await qrModel.softDeleteQRCode(qrCodeId);
  await logAdminAudit({
    userId: res.locals.user.userId,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCodeId,
    actionTypeId: AuditActions.DELETE,
    logText: 'QR-code soft deleted',
  });
  res.status(200).json({
    status: 'success',
    message: 'QR-code soft deleted successfully',
  });
});

// ARCHIVE QR-CODE BY ID
module.exports.archiveQRCode = catchAsync(async (req, res, next) => {
  const { qrCodeId } = req.params;
  const userId = res.locals.user.userId;
  const ipAddress = req.ip;
  await qrModel.archiveQRCode(qrCodeId, userId, ipAddress);
  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCodeId,
    actionTypeId: AuditActions.UPDATE,
    logText: 'QR-code archived',
  });
  res.status(200).json({
    status: 'success',
    message: 'QR-code archived successfully',
  });
});

// HARD DELETE QR-CODE
module.exports.hardDeleteQRCode = catchAsync(async (req, res, next) => {
  const { qrCodeId } = req.params;
  const userId = res.locals.user.userId;
  const ipAddress = req.ip;
  await qrModel.hardDeleteQRCode(qrCodeId, userId, ipAddress);
  await logAdminAudit({
    userId: userId,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCodeId,
    actionTypeId: AuditActions.DELETE,
    logText: 'QR-code hard deleted',
  });
  res.status(200).json({
    status: 'success',
    message: 'QR-code hard deleted successfully',
  });
});

// UNARCHIVE QR-CODE
module.exports.unarchiveQRCode = catchAsync(async (req, res, next) => {
  const { qrCodeId } = req.params;
  const userId = res.locals.user.userId;
  const ipAddress = req.ip;

  // Check if QR code exists
  const qrCode = await qrModel.getQRCodeById(qrCodeId);
  if (!qrCode) {
    throw new AppError('QR code not found', 404);
  }

  // Unarchive QR code
  await qrModel.unarchiveQRCode(qrCodeId, userId, ipAddress);

  logger.info(`Unarchived QR code ${qrCodeId}`);

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'qrCode',
    entityId: qrCodeId,
    actionTypeId: AuditActions.UPDATE,
    logText: `Unarchived QR code with ID ${qrCodeId}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'QR code unarchived successfully',
  });
});



module.exports.getScansPerExhibit = catchAsync(async (req, res, next) => {
  const result = await qrModel.getScansPerExhibitStats();

  res.status(200).json({
    status: 'success',
    data: result,
  });
});