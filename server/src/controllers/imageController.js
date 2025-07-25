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


// Getting all images
module.exports.getAllImages = catchAsync( async(req, res, next) => {
    try {
        const images = await imageModel.getAllImages();
        res.status(200).json({
            status: 'success',
            data: images,
        });
    } catch (error) {
        logger.error('Error to retrieve images:', error);
        next(error);
    }
});

//Getting image by ID
module.exports.getImageById = catchAsync( async(req, res, next) => {
    try {
        const imageId = req.params.imageId;
        const imageData = await imageModel.getImageById(imageId);

        res.status(200).json({
            status: 'success',
            message: `Image with ID ${imageId} retrieved successfully`,
            image: imageData
        });
    } catch (error) {
        logger.error('Error fetching image by ID:', error);
        next(error);
    }
})

// Creating new image
module.exports.createImage = catchAsync( async(req, res, next) => {
    try {
        const { description, fileLink, fileName } = req.body;
        const createdBy = res.locals.user.userId;
        const statusId = statusCodes.ACTIVE;

        const image = await imageModel.createImage({
            description,
            fileLink,
            fileName,
            createdBy,
            statusId, 
        });

        logger.info(`Image created successfully by user ${createdBy}`);

        res.status(201).json({
            status: 'success',
            data: image,
        });
    } catch (error) {
        logger.error('Error creating image:', error);
        next(error);
    }
});

// Update new image
module.exports.updateImage = catchAsync( async(req, res, next) => {
    try {
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

        logger.info(`Image with ID ${imageId} updated by user ${updatedBy}`);

        res.status(200).json({
            status: 'success',
            data: updatedImage,
        });
    } catch (error) {
        logger.error('Error updating image:', error);
        next(error);
    }
});

// Archiving image
module.exports.archiveImage = catchAsync( async(req, res, next) => {
    try {
        const imageId = req.params.imageId;
        const statusId = statusCodes.ARCHIVED;

        const archivedImage = await imageModel.archiveImage(imageId, statusId);

        if (!archivedImage) {
            logger.warn(`Image with ID ${imageId} not found for archive`);
            throw new AppError('Image not found', 404);
        }

        logger.info(`Image with ID ${imageId} archived`);

        res.status(200).json({
            status: 'success',
            data: archivedImage,
            message: 'Image archived successfully',
        });
    } catch (error) {
        logger.error('Error archiving image:', error);
        next(error);
    }
});

// Deleting image
module.exports.deleteImage = catchAsync( async(req, res, next) => {
    try {
        const imageId = req.params.imageId;
        const deletedImage = await imageModel.deleteImage(imageId);

        if(!deletedImage) {
            logger.warn(`Image with ID ${imageId} not found for deletion`);
            throw new AppError('Image not found', 404);
        }

        logger.info(`Image with ID ${imageId} deleted successfully`);
        res.status(200).json({
            status: 'success',
            message: 'Image deleted successfully',
            data: deletedImage,
        });
    } catch (error) {
        logger.error('Error deleting imasge:', error);
        next(error);
    }
});