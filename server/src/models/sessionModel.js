const { Prisma, PrismaClient } = require('../generated/prisma');
const AppError = require('../utils/AppError');
const prisma = new PrismaClient();

module.exports.create = async ({ userId, deviceInfo }) => {
  try {
    const session = await prisma.session.create({
      data: {
        userId,
        deviceInfo,
      },
    });
    return session;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.invalidateById = async (sessionId) => {
  try {
    const session = await prisma.session.update({
      where: { sessionId },
      data: {
        isActive: false,
        //TODO: Track logout as well?
      },
    });
    return session;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new AppError('Invalid session ID', 404);
    }
    console.log(error);
    throw error;
  }
};
