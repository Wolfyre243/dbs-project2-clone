const statusCodes = require('../configs/statusCodes');
const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { encryptData, decryptData } = require('../utils/encryption');
const { convertDatesToStrings } = require('../utils/formatters');

// Create New Exhibit Model
module.exports.newExhibit = async (title, desc, audioId, createdBy, imageId, statusId) => {
  try {
    const exhibit = await prisma.exhibit.create({
      data: {
        title: title,
        description: desc,
        audioId: audioId,
        createdBy: createdBy,
        imageId: imageId,
        statusId: statusId,
      },
    });

    // Add a record in the exhibitAudioRelation table
    await prisma.exhibitAudioRelation.create({
      data: {
        exhibitId: exhibit.exhibitId,
        audioId: audioId,
      },
    });

    return exhibit;
  } catch (error) {
    // Log error and throw a custom AppError for upstream handling
    console.error('Error creating new exhibit:', error);
    throw new AppError('Failed to create new exhibit', 500);
  }
};

// Update exhibit
module.exports.updateExhibit = async ({
  exhibitId,
  title,
  description,
  audioId,
  imageId,
  statusId,
  createdBy,
}) => {
  try {
    const updated = await prisma.exhibit.update({
      where: { exhibitId: Number(exhibitId) },
      data: {
        title,
        description,
        audioId,
        imageId,
        statusId,
        createdBy,
      },
    });
    return updated;
  } catch (error) {
    console.error('Error updating exhibit:', error);
    throw new AppError('Failed to update exhibit', 500);
  }
};

// Get Exhibits By Exhibit ID
module.exports.getExhibitById = async (exhibitId) => {
  try {
    const exhibit = await prisma.exhibit.findUnique({
      where: { exhibitId: parseInt(exhibitId) },
    });
    return exhibit;
  } catch (error) {
    console.error('Error fetching exhibit:', error);
    throw new AppError('Failed to fetch exhibit', 500);
  }
};

// Soft delete
module.exports.softDeleteExhibit = async (exhibitId, statusCode) => {
  try {
    const updatedExhibit = await prisma.exhibit.update({
      where: {
        exhibitId: parseInt(exhibitId),
      },
      data: {
        statusId: statusCode,
      },
    });

    if (!updatedExhibit) {
      logger.warn(`Exhibit with ID ${exhibitId} not found for soft delete.`);
      return null;
    }

    logger.info(`Exhibit with ID ${exhibitId} soft deleted (status set to ${statusCode}).`);
    return { id: exhibitId, status: statusCode };
  } catch (error) {
    logger.error(`Error soft deleting exhibit with ID ${exhibitId}:`, error);
    throw new AppError('Failed to delete exhibit', 500);
  }
};

module.exports.getEveryExhibit = async () => {
  try {
    const exhibit = await prisma.exhibit.findMany({
      select: {
        exhibitId: true,
        title: true,
        description: true,
        createdAt: true,
      },
      include: {
        audio: true,
        exhibitCreatedBy: true,
        image: true,
        status: true,
      },
    });
    return teams;
  } catch (e) {
    console.error(e);
    throw new AppError('Error fetching all teams', 500);
  }
};

