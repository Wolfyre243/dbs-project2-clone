const statusCodes = require('../configs/statusCodes');
const { Prisma, PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const { encryptData, decryptData } = require('../utils/encryption');
const { convertDatesToStrings } = require('../utils/formatters');

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
          languageCode,
          gender: gender.toUpperCase(),
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
    const user = await prisma.users.findUnique({
      where: { userId: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        userProfile: true,
        status: true,
        emails: true,
        phoneNumbers: true,
      },
    });

    if (user.emails) user.emails.email = decryptData(user.emails.email);

    return convertDatesToStrings(user);
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
      include: {
        userRoles: true,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.retrievePasswordByUserId = async (userId) => {
  try {
    const passwordRecord = await prisma.password.findFirst({
      where: { userId: userId, isActive: true },
    });

    if (!passwordRecord) {
      throw new AppError('Password not found for user.', 404);
    }

    return passwordRecord;
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

module.exports.verifyUser = async (userId) => {
  try {
    const user = await prisma.users.update({
      where: {
        userId: userId,
      },
      data: {
        statusId: statusCodes.VERIFIED,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError('User not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};

// Soft delete user by setting status to deleted
module.exports.softDeleteUser = async (userId) => {
  try {
    const user = await prisma.users.update({
      where: { userId: userId },
      data: {
        statusId: statusCodes.DELETED,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError('User not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};

// admin can hard delete user
module.exports.hardDeleteUser = async (userId) => {
  try {
    const user = await prisma.users.delete({
      where: { userId: userId },
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError('User not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};

function calculateAge(dob) {
  // const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob?.getFullYear();
  const m = today.getMonth() - dob?.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob?.getDate())) {
    age--;
  }
  return age;
}

//get all users for admin
module.exports.getAllUsers = async ({
  page,
  pageSize,
  sortBy,
  order,
  search,
  filter = {},
}) => {
  let where = { ...filter, statusId: statusCodes.ACTIVE };

  // Conditional search terms
  if (search && search.trim() !== '') {
    where.OR = [
      { username: { contains: search } },
      { userProfile: { firstName: { contains: search } } },
      { userProfile: { lastName: { contains: search } } },
    ];
  }

  const userCount = await prisma.users.count({ where });

  const usersRaw = await prisma.users.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
    select: {
      userId: true,
      username: true,
      createdAt: true,
      modifiedAt: true,
      status: {
        select: {
          statusName: true,
        },
      },
      userProfile: {
        select: {
          firstName: true,
          lastName: true,
          dob: true,
          gender: true,
          languageCode: true,
        },
      },
      userRoles: {
        select: {
          role: {
            select: {
              roleName: true,
            },
          },
        },
      },
    },
    orderBy: {
      [sortBy]: order,
    },
  });

  const users = usersRaw
    .map((user) => ({
      ...user,
      firstName: user.userProfile?.firstName,
      lastName: user.userProfile?.lastName,
      role: user.userRoles?.role?.roleName,
      status: user.status.statusName,
      age: calculateAge(user.userProfile?.dob),
      gender: user.userProfile?.gender,
      languageCode: user.userProfile?.languageCode,
    }))
    .map((user) => convertDatesToStrings(user));

  return {
    users,
    userCount,
  };
};

// update user profile, username, lastname, firstname, statusid
module.exports.updateUserProfileWithStatus = async (
  userId,
  { username, firstName, lastName, statusId },
) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { userId: userId },
      data: {
        username: username,
        userProfile: {
          update: {
            firstName: firstName,
            lastName: lastName,
          },
        },
        statusId: statusId,
      },
      include: {
        userProfile: true,
      },
    });

    return convertDatesToStrings(updatedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError('User not found', 404);
      }
    }
    console.log(error);
    throw error;
  }
};
