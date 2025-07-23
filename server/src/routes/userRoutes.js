// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const userController = require('../controllers/userController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// const {
//   getTeamMembersValidationRules,
//   joinTeamWithCodeValidationRules,
//   validate,
// } = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const userRouter = express.Router();

userRouter.get(
  '/profile',
  jwtMiddleware.verifyToken,
  userController.retrieveUserProfile,
);

// Soft delete user
userRouter.delete(
  '/',
  jwtMiddleware.verifyToken,
  userController.softDeleteUser,
);
// Admin soft delete user
userRouter.delete(
  '/admin/soft-delete/:userId',
  jwtMiddleware.verifyToken,
  userController.adminSoftDeleteUser,
);
// Admin hard delete user
userRouter.delete(
  '/admin/hard-delete/:userId',
  jwtMiddleware.verifyToken,
  userController.adminHardDeleteUser,
);

module.exports = userRouter;
