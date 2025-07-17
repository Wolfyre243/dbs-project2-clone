const statusCodes = require('../configs/statusCodes');
const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

module.exports.createGuest = async (username, roleId) => {
  try {
    const user = await prisma.users.create({
      data: {
        username: username,
        statusId: statusCodes.ACTIVE,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: user.userId,
        roleId: roleId,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.create = async ({
  username,
  passwordHash,
  firstName,
  lastName,
  dob,
  gender,
  languageCode,
  encryptedEmail,
  roleId,
}) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          username: username,
          statusId: statusCodes.ACTIVE,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.userId,
          roleId: roleId,
        },
      });

      await tx.password.create({
        data: {
          userId: user.userId,
          password: passwordHash,
        },
      });

      const email = await tx.email.create({
        data: {
          userId: user.userId,
          email: encryptedEmail,
          isPrimary: true,
          statusId: statusCodes.ACTIVE,
        },
      });

      await tx.userProfile.create({
        data: {
          userId: user.userId,
          firstName: firstName,
          lastName: lastName,
          languageCode: languageCode,
          gender: gender,
          dob: new Date(dob).toISOString(),
          modifiedBy: user.userId,
          statusId: statusCodes.ACTIVE,
        },
      });

      return { user, email };
    });
    return result;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      console.log(error);
      throw error;
    }
    if (error.code === 'P2002') {
      if (
        error.meta &&
        error.meta.target &&
        error.meta.target.includes('username')
      ) {
        throw new AppError('Username is already taken.', 400);
      }
      if (
        error.meta &&
        error.meta.target &&
        error.meta.target.includes('email')
      ) {
        throw new AppError('Email is already taken.', 400);
      }
      throw new AppError('Duplicate field error.', 400);
    }
    if (error.code === 'P2003') {
      if (
        error.meta &&
        error.meta.target &&
        error.meta.target.includes('languageCode')
      ) {
        throw new AppError('Invalid language code.', 400);
      }
      throw new AppError('Foreign key constraint failed.', 400);
    }
  }
};

module.exports.retrieveById = async (userId) => {
  try {
    const user = prisma.users.findUnique({
      where: { userId: userId },
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2001') {
        throw new AppError('User not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};

module.exports.retrieveEmail = async (email) => {
  try {
    const emailObj = await prisma.email.findFirst({
      where: { email: email },
    });

    return emailObj;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.retrieveByUsername = async (username) => {
  try {
    const user = await prisma.users.findFirst({
      where: { username: username },
    });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.retrieveEmailById = async (emailId) => {
  try {
    const email = await prisma.email.findUnique({
      where: { emailId: emailId },
    });

    return email;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2001') {
        throw new AppError('Email not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};

module.exports.verifyEmail = async (userId, emailId) => {
  try {
    const email = await prisma.email.update({
      where: {
        userId: userId,
        emailId: emailId,
      },
      data: {
        verified: true,
      },
    });

    return email;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError('Email or User not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};
