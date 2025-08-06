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

/**
 * Aggregates user-specific statistics for QR scans and audio engagement.
 * Returns: {
 *   qr: { scanCount, topVisitedExhibit: { exhibitId, title, scanCount } },
 *   audio: {
 *     playCount, averageListenDuration, mostInterestedExhibit: { exhibitId, title, listenDuration }, completionRate
 *   }
 * }
 */
// module.exports.getUserStatistics = async (userId) => {
//   const prisma = require('../generated/prisma').PrismaClient ? new (require('../generated/prisma').PrismaClient)() : null;
//   // QR SCANS
//   const qrEvents = await prisma.event.findMany({
//     where: { userId, eventType: { eventType: 'QR_SCANNED' } },
//     select: { entityId: true, details: true },
//   });
//   const qrScanCount = qrEvents.length;
//   const exhibitScanMap = {};
//   for (const event of qrEvents) {
//     const exhibitId = event.entityId;
//     if (!exhibitId) continue;
//     exhibitScanMap[exhibitId] = (exhibitScanMap[exhibitId] || 0) + 1;
//   }
//   let topVisitedExhibit = null;
//   if (Object.keys(exhibitScanMap).length > 0) {
//     const topId = Object.entries(exhibitScanMap).sort((a, b) => b[1] - a[1])[0][0];
//     const exhibit = await prisma.exhibit.findUnique({ where: { exhibitId: topId }, select: { exhibitId: true, title: true } });
//     topVisitedExhibit = { exhibitId: exhibit.exhibitId, title: exhibit.title, scanCount: exhibitScanMap[topId] };
//   }

//   // AUDIO PLAYS & COMPLETION
//   const audioPlayEvents = await prisma.event.findMany({
//     where: { userId, eventType: { eventType: 'AUDIO_STARTED' } },
//     select: { entityId: true, metadata: true },
//   });
//   const audioCompleteEvents = await prisma.event.findMany({
//     where: { userId, eventType: { eventType: 'AUDIO_COMPLETED' } },
//     select: { entityId: true, metadata: true },
//   });
//   const playCount = audioPlayEvents.length;

//   // Average Listen Duration & Most Interested Exhibit
//   const listenDurationMap = {};
//   for (const event of audioCompleteEvents) {
//     const exhibitId = event.entityId;
//     const duration = event.metadata?.currentTime || 0;
//     if (!exhibitId) continue;
//     listenDurationMap[exhibitId] = (listenDurationMap[exhibitId] || 0) + duration;
//   }
//   let totalDuration = 0, totalCompletions = 0, mostInterestedExhibit = null;
//   if (Object.keys(listenDurationMap).length > 0) {
//     const topId = Object.entries(listenDurationMap).sort((a, b) => b[1] - a[1])[0][0];
//     const exhibit = await prisma.exhibit.findUnique({ where: { exhibitId: topId }, select: { exhibitId: true, title: true } });
//     mostInterestedExhibit = { exhibitId: exhibit.exhibitId, title: exhibit.title, listenDuration: listenDurationMap[topId] };
//     totalDuration = Object.values(listenDurationMap).reduce((a, b) => a + b, 0);
//     totalCompletions = Object.values(listenDurationMap).length;
//   }
//   const averageListenDuration = totalCompletions > 0 ? totalDuration / totalCompletions : 0;

//   // Completion Rate
//   const completionRate = playCount > 0 ? (audioCompleteEvents.length / playCount) * 100 : 0;

//   return {
//     qr: {
//       scanCount: qrScanCount,
//       topVisitedExhibit,
//     },
//     audio: {
//       playCount,
//       averageListenDuration,
//       mostInterestedExhibit,
//       completionRate,
//     },
//   };
// };

module.exports.getUserAudioStatistics = async (userId) => {
  const totalAudioPlays = await prisma.event.count({
    where: { userId, eventType: { eventType: 'AUDIO_STARTED' } },
  });
  const totalAudioCompletions = await prisma.event.count({
    where: { userId, eventType: { eventType: 'AUDIO_COMPLETED' } },
  });
  return {
    totalAudioPlays,
    totalAudioCompletions,
  };
};

module.exports.getUserQRStatistics = async (userId) => {
  const totalQRScans = await prisma.event.count({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
  });
  const uniqueQRScanned = await prisma.event.findMany({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
    select: { entityId: true },
    distinct: ['entityId'],
  });

  // Top visited exhibit by scan count
  // const qrEvents = await prisma.event.findMany({
  //   where: { userId, eventType: { eventType: 'QR_SCANNED' } },
  //   select: { entityId: true },
  // });

  const topExhibitId = await prisma.event.groupBy({
    by: ['entityId'],
    where: {
      userId,
    },
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: 1,
  });

  // const exhibitScanMap = {};
  // for (const event of qrEvents) {
  //   const exhibitId = event.entityId;
  //   if (!exhibitId) continue;
  //   exhibitScanMap[exhibitId] = (exhibitScanMap[exhibitId] || 0) + 1;
  // }
  // let topVisitedExhibit = null;
  // if (Object.keys(exhibitScanMap).length > 0) {
  //   const topId = Object.entries(exhibitScanMap).sort(
  //     (a, b) => b[1] - a[1],
  //   )[0][0];
  //   const exhibit = await prisma.exhibit.findUnique({
  //     where: { exhibitId: topId },
  //     select: { exhibitId: true, title: true },
  //   });
  //   topVisitedExhibit = {
  //     exhibitId: exhibit.exhibitId,
  //     title: exhibit.title,
  //     scanCount: exhibitScanMap[topId],
  //   };
  // }

  const topVisitedExhibit = await prisma.exhibit.findUnique({
    where: {
      exhibitId: topExhibitId[0].entityId,
    },
  });

  return {
    totalQRScans,
    uniqueQRScanned: uniqueQRScanned.length,
    topVisitedExhibit,
  };
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

/**
 * Aggregate user-specific QR scan statistics.
 * Returns: { totalQRScans, uniqueQRScanned }
 */
async function getUserQRStatistics(userId) {
  // Use the correct Prisma client instance
  const totalQRScans = await prisma.event.count({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
  });
  const uniqueQRScanned = await prisma.event.findMany({
    where: { userId, eventType: { eventType: 'QR_SCANNED' } },
    select: { entityId: true },
    distinct: ['entityId'],
  });
  return {
    totalQRScans,
    uniqueQRScanned: uniqueQRScanned.length,
  };
}

/**
 * Aggregate user-specific audio statistics.
 * Returns: { totalAudioPlays, totalAudioCompletions }
 */
async function getUserAudioStatistics(userId) {
  const totalAudioPlays = await prisma.event.count({
    where: { userId, eventType: { eventType: 'AUDIO_STARTED' } },
  });
  const totalAudioCompletions = await prisma.event.count({
    where: { userId, eventType: { eventType: 'AUDIO_COMPLETED' } },
  });
  return {
    totalAudioPlays,
    totalAudioCompletions,
  };
}

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

module.exports.getRecentActivity = async (userId, limit = 10) => {
  try {
    const activities = await prisma.event.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        eventType: { select: { eventType: true, description: true } },
      },
    });
    return activities;
  } catch (error) {
    throw new AppError('Failed to fetch recent activity', 500);
  }
};
