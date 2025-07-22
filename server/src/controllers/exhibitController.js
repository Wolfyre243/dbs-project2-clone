const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { encryptData, decryptData } = require('../utils/encryption');
const audioModel = require('../models/audioModel');
const {
  cookieOptions,
  verifySK,
  verifyTokenDuration,
  tokenAlgorithm,
} = require('../configs/authConfig');
const catchAsync = require('../utils/catchAsync');
const status = require('../configs/statusCodes');
const validateFields = require('../utils/validateFields');
const exhibitModel = require('../models/exhibitModel');
const exhibitModes = require('../configs/exhibitModes');
const statusCodes = require('../configs/statusCodes');
const AuditActions = require('../configs/auditActionConfig');

const { logAdminAudit } = require('../utils/auditlogs'); 
// Create Exhibit controller function
module.exports.createExhibit = catchAsync(async (req, res, next) => {
  const { title, description, languageCode } = req.body;
  const userId = res.locals.user.userId;
  const imageId = req.body.imageId; // Assuming imageId is provided in the request
  const audioData = res.locals.audioData; // this Data from audioController 

  // Validate required fields
  if (!title) {
    throw new AppError('Title is required', 400);
  }

  if (!audioData) {
    throw new AppError('Audio processing failed or no audio data provided', 500);
  }

 // Validate imageId if provided
  if (imageId) {
    const image = await prisma.image.findUnique({
      where: { imageId },
    });
    if (!image) {
      throw new AppError('Invalid imageId provided', 400);
    }
  }


  const { audioId, fileName, subtitleId, transcription, translations } = audioData;

  // Create exhibit
  const exhibit = await exhibitModel.createExhibit({
    title,
    description,
    audioId,
    createdBy: userId,
    modifiedBy: userId,
    imageId,
    statusId: 1,
  });

  // Create exhibit-subtitle relation
  await exhibitModel.createExhibitSubtitle({
    exhibitId: exhibit.exhibitId,
    subtitleId,
  });

  // Log audit action
  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'exhibit',
    entityId: exhibit.exhibitId,
    actionTypeId: AuditActions.CREATE,
    logText: `Admin created exhibit with audio: ${fileName} in ${languageCode}`,
  });


  logger.info(`Exhibit created successfully: ${exhibit.exhibitId}`);

  res.status(200).json({
    status: 'success',
    data: {
      exhibitId: exhibit.exhibitId,
      audioId,
      fileName,
      languageCode,
      subtitleId,
      transcription,
      translations,
      message: 'Successfully created exhibit with audio and subtitle',
    },
  });
});

// Get exhibit controller function
module.exports.updateExhibit = catchAsync(async (req, res, next) => {
  const { exhibitId, title, description, audioId, imageId, statusId } = req.body;
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
        exhibitId
    });

    try {
        const softDelete = await exhibitModel.softDeleteExhibit(exhibitId, statusCode);

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
        return next(new AppError('Failed to delete exhibit. Please try again later.', 500));
    }
});

// Getting all exhibit data
module.exports.getAllExhibits = catchAsync(async (req, res, next) => {
  const exhibits = await exhibitModel.getEveryExhibit();
  if (!exhibits || exhibits.length === 0) {
    logger.warning('No exhibits found');
    return next(new AppError('No exhibits found', 404));
  }

  logger.info('All exhibits retrieved successfully');
  res.status(200).json({
    status: 'success',
    data: {
      exhibits,
    },
  });
});


