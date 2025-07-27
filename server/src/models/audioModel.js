const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');
const { PrismaClient } = require('../generated/prisma');
const { convertDatesToStrings } = require('../utils/formatters');
const { logAdminAudit } = require('../utils/auditlogs');
const { deleteFile } = require('../utils/fileUploader');
const AppError = require('../utils/AppError');

const prisma = new PrismaClient();

// Create a new audio record
module.exports.createAudio = async ({
  description = undefined,
  fileLink,
  fileName,
  createdBy,
  languageCode,
  statusId = statusCodes.ACTIVE,
}) => {
  try {
    const audio = await prisma.audio.create({
      data: {
        description,
        fileLink,
        fileName,
        createdBy,
        languageCode,
        statusId,
      },
    });

    return audio;
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint failed
      throw new AppError(
        'Audio with this file link or file name already exists.',
        409,
      );
    }
    throw error;
  }
};

module.exports.createAudioWithSubtitles = async ({
  description,
  fileLink,
  fileName,
  createdBy,
  languageCode,
  subtitleText,
  statusId = statusCodes.ACTIVE,
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const audio = await tx.audio.create({
        data: {
          description,
          fileLink,
          fileName,
          createdBy,
          languageCode,
          statusId,
        },
      });

      const subtitle = await tx.subtitle.create({
        data: {
          subtitleText,
          languageCode,
          createdBy,
          modifiedBy: createdBy,
          audioId: audio.audioId,
          statusId,
        },
      });

      return { audio, subtitle };
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(
        'Audio with this file link or file name already exists.',
        409,
      );
    }
    throw error;
  }
};

module.exports.getAudioById = async function (audioId) {
  try {
    const audio = await prisma.audio.findUnique({
      where: { audioId },
    });
    if (!audio) {
      throw new AppError('Audio not found', 404);
    }
    return audio;
  } catch (error) {
    throw error;
  }
};

//archive audio by setting status to archived
module.exports.archiveAudio = async function (audioId) {
  try {
    const audio = await prisma.audio.update({
      where: { audioId },
      data: { statusId: statusCodes.ARCHIVED },
    });
    return audio;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Audio not found', 404);
    }
    throw error;
  }
};

//Hard delete audio
module.exports.hardDeleteAudio = async function (audioId) {
  try {
    const audio = await prisma.audio.findUnique({
      where: { audioId },
      select: { fileName: true },
    });

    console.log(audio);

    // Delete from supabase
    await deleteFile('audio', audio.fileName);

    // Delete from database
    const deletedAudio = await prisma.audio.delete({
      where: { audioId },
    });

    return audio;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Audio not found', 404);
    }
    throw error;
  }
};

//unarchive audio by setting status to active
module.exports.unarchiveAudio = async function (audioId) {
  try {
    const audio = await prisma.audio.update({
      where: { audioId },
      data: { statusId: statusCodes.ACTIVE },
    });
    return audio;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Audio not found', 404);
    }
    throw error;
  }
};

// soft delete audio by setting status to deleted
module.exports.softDeleteAudio = async function (audioId) {
  try {
    const audio = await prisma.audio.update({
      where: { audioId },
      data: { statusId: statusCodes.DELETED },
    });

    return audio;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Audio not found', 404);
    }
    throw error;
  }
};

//get all audio with pagination, sorting, and filtering
module.exports.getAllAudio = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
  filter,
}) => {
  try {
    let where = {
      ...filter,
      statusId: statusCodes.ACTIVE,
    };

    if (search && search.trim() !== '') {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const audioCount = await prisma.audio.count({
      where: where,
    });

    const audioList = await prisma.audio.findMany({
      where: where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        audioCreatedBy: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      pageCount: Math.ceil(audioCount / pageSize),
      audioList: audioList.map((audio) =>
        convertDatesToStrings({
          ...audio,
          createdBy: audio.audioCreatedBy.username,
        }),
      ),
    };
  } catch (error) {
    throw error;
  }
};
