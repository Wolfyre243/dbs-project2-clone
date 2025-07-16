const { PrismaClient } = require('../generated/prisma');
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
