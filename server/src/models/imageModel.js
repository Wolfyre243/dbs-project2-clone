const { PrismaClient, Prisma } = require('../generated/prisma');
const AppError = require('../utils/AppError');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

module.exports.getAllImages = async () => {
  try {
    const images = await prisma.image.findMany();
    logger.info(`Fetched ${images.length} images from database`);
    return images;
  } catch (error) {
    logger.error('Error fetching images:', error);
    throw new AppError('Failed to fetch images', 500);
  }
};

module.exports.getImageById = async(imageId) => {
    try {
        const image = await prisma.image.findUnique({
            where: { imageId: parseInt(imageId) },
        });
        logger.info(`Image with ID ${imageId} retrieved successfully`);
        return image;
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
                throw new AppError(`Image with ID ${imageId} not found`, 404);
            }
        }
        logger.error(`Error fetching image with ID ${imageId}`, e);
        throw new AppError(`Failed to fetch image by ID`, 500);
    };
};

module.exports.createImage = async ({description,
            fileLink,
            fileName,
            createdBy,
            statusId, }) => {
  try {
    const image = await prisma.image.create({
      data: {
        description: description,
        createdBy: createdBy,
        statusId: statusId,
        fileLink: fileLink,
        fileName: fileName,
      },
    });
    logger.info(`Image created with ID: ${image.imageId}`);
    return image;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new AppError('Image with given unique field already exists.', 400);
      }
    }
    console.error(error);
    logger.error('Error creating image:', error);
    throw new AppError('Failed to create image', 500);
  }
};

module.exports.updateImage = async (imageId, updateData) => {
  try {
    const updatedImage = await prisma.image.update({
      where: { imageId: parseInt(imageId) },
      data: updateData,
    });
    logger.info(`Image with ID ${imageId} updated successfully`);
    return updatedImage;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    logger.error(`Error updating image with ID ${imageId}:`, error);
    throw new AppError('Failed to update image', 500);
  }
};

module.exports.archiveImage = async (imageId, statusId) => {
  try {
    const archivedImage = await prisma.image.update({
      where: { imageId: parseInt(imageId) },
      data: { statusId },
    });
    logger.info(`Image with ID ${imageId} archived successfully`);
    return archivedImage;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    logger.error(`Error archiving image with ID ${imageId}:`, error);
    throw new AppError('Failed to archive image', 500);
  }
};

module.exports.deleteImage = async (imageId) => {
  try {
    const deletedImage = await prisma.image.delete({
      where: { imageId: parseInt(imageId) },
    });
    logger.info(`Image with ID ${imageId} deleted successfully`);
    return deletedImage;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    logger.error(`Error deleting image with ID ${imageId}:`, error);
    throw new AppError('Failed to delete image', 500);
  }
};