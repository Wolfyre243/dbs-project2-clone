// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const userController = require('../controllers/userController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
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
  '/profile',
  jwtMiddleware.verifyToken,
  userController.softDeleteUser
);
// Admin soft delete user
userRouter.delete(
  '/admin/soft-delete/:userId',
  jwtMiddleware.verifyToken,
  userController.adminSoftDeleteUser
);
// Admin hard delete user
userRouter.delete(
  '/admin/hard-delete/:userId',
  jwtMiddleware.verifyToken,
  userController.adminHardDeleteUser
);

// Get all users for admin
userRouter.get('/get-all-users', 
  jwtMiddleware.verifyToken, 
  authMiddleware.verifyIsAdmin,
   userController.getAllUsers);

module.exports = userRouter;
