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
const adminAudit = require('../utils/auditlogs')

// Create Exhibit controller function
module.exports.createExhibit = catchAsync(async (req, res, next) => {
  // Extract mode (transcribe or synthesize) from request body
  const { mode, title, description, imageId, languageCode } = req.body;
  const userId = res.locals.user.userId;

  // Use validateFields utility for required fields
  validateFields({
    mode,
    title,
    description,
    imageId,
    languageCode,
  });

  // Validate mode
  if (!exhibitModes.values.includes(mode)) {
    throw new AppError('Invalid exhibit mode', 400);
  }

  let audioId;

  // --- AUDIO LOGIC PLACEHOLDER ---
  // If mode is TRANSCRIBE, require audio file and handle audio upload/transcription
  // If mode is SYNTHESIZE, require text and handle text-to-speech
  // Set audioId after audio is created
  // ------------------------------------------------

  // Require audioId before creating exhibit
  if (!audioId) {
    throw new AppError('Audio creation failed or missing audioId', 500);
  }

  // Create the exhibit
  const exhibit = await exhibitModel.newExhibit(
    title,
    description,
    audioId,
    userId,
    imageId,
    status.ACTIVE // or another status as needed
  );

  // Add a record in the exhibitAudioRelation table
  await exhibitModel.createExhibitAudioRelation(exhibit.exhibitId, audioId);

  res.status(201).json({
    status: 'success',
    data: {
      exhibit,
      message: 'Exhibit created successfully',
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


