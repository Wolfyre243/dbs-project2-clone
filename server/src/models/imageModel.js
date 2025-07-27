const statusCodes = require('../configs/statusCodes');
const { PrismaClient, Prisma } = require('../generated/prisma');
const AppError = require('../utils/AppError');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { deleteFile } = require('../utils/fileUploader');
const { convertDatesToStrings } = require('../utils/formatters');

module.exports.getAllImages = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
}) => {
  try {
    let where = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { fileName: { contains: search } },
        { fileLink: { contains: search } },
      ];
    }

    const imageCount = await prisma.image.count({ where });

    const imagesRaw = await prisma.image.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy: {
        [sortBy]: order,
      },
    });

    return {
      images: imagesRaw.map((img) => convertDatesToStrings(img)),
      imageCount,
    };
  } catch (error) {
    throw error;
  }
};

module.exports.getImageById = async (imageId) => {
  try {
    const image = await prisma.image.findUnique({
      where: { imageId: imageId },
    });

    logger.info(`Image with ID ${imageId} retrieved successfully`);
    return convertDatesToStrings(image);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    console.error(e);
    throw e;
  }
};

module.exports.createImage = async ({
  description = undefined,
  fileLink,
  fileName,
  createdBy,
  statusId = statusCodes.ACTIVE,
}) => {
  try {
    const image = await prisma.image.create({
      data: {
        description,
        createdBy,
        statusId,
        fileLink,
        fileName,
      },
    });

    return convertDatesToStrings(image);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new AppError(
          'Image with given unique field already exists.',
          400,
        );
      }
    }

    throw error;
  }
};

module.exports.updateImage = async (imageId, updateData) => {
  try {
    const updatedImage = await prisma.image.update({
      where: { imageId: imageId },
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
    console.error('ERRROR: ' + error);
    throw error;
  }
};

module.exports.archiveImage = async (imageId, statusId) => {
  try {
    const archivedImage = await prisma.image.update({
      where: { imageId: imageId },
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
    console.log('ERROR:' + error);
    throw error;
  }
};

module.exports.unarchiveImage = async function (imageId) {
  try {
    const image = await prisma.image.update({
      where: { imageId },
      data: { statusId: statusCodes.ACTIVE },
    });
    return image;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new AppError('Image not found', 404);
    }
    throw error;
  }
};

module.exports.deleteImage = async (imageId) => {
  try {
    const deletedImage = await prisma.image.update({
      where: { imageId },
      data: { statusId: statusCodes.DELETED },
    });

    return deletedImage;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    throw error;
  }
};

module.exports.hardDeleteImage = async (imageId) => {
  try {
    const { fileName } = await prisma.image.findUnique({
      where: { imageId },
      select: { fileName: true },
    });

    // Delete from supabase
    await deleteFile('images', fileName);

    const image = await prisma.image.delete({
      where: { imageId },
    });

    return image;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    throw error;
  }
};
