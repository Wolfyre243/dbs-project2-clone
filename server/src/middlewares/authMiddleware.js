const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const Roles = require('../configs/roleConfig');

module.exports.verifyIsAdmin = catchAsync(async (req, res, next) => {
  if (
    res.locals.user.roleId != Roles.ADMIN &&
    res.locals.user.roleId != Roles.SUPERADMIN
  ) {
    throw new AppError(
      `User ID (${res.locals.user.userId}) has no adminstrator rights.`,
      403,
    );
  }
  return next();
});

module.exports.verifyIsSuperAdmin = catchAsync(async (req, res, next) => {
  if (res.locals.user.roleId != Roles.SUPERADMIN) {
    throw new AppError(
      `User ID (${res.locals.user.userId}) has no super adminstrator rights.`,
      403,
    );
  }
  return next();
});

// User can only access resource if it belongs to them
// However, ADMIN privileges override this rule.
module.exports.verifyAccess = catchAsync(async (req, res, next) => {
  const loggedInUser = res.locals.user;
  const { userId } = req.query || req.params;

  if (loggedInUser.userId != userId && loggedInUser.roleId === Roles.GUEST) {
    logger.warning(
      `User ID (${res.locals.user.userId}) not allowed to access this.`,
    );
    throw new AppError(
      "Not allowed to access or modify other users' data.",
      403,
    );
  }

  return next();
});
