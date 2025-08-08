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

userRouter.use(jwtMiddleware.verifyToken);

userRouter.get('/profile', userController.retrieveUserProfile);

// Soft delete user
userRouter.delete('/', userController.softDeleteUser);

// Admin soft delete user
userRouter.delete(
  '/admin/soft-delete/:userId',
  userController.adminSoftDeleteUser,
);
// Admin hard delete user
userRouter.delete(
  '/admin/hard-delete/:userId',
  authMiddleware.verifyIsSuperAdmin,
  userController.adminHardDeleteUser,
);

// Get all users for admin
userRouter.get('/', authMiddleware.verifyIsAdmin, userController.getAllUsers);
// Update user profile username, first name, lastname, languageCode
userRouter.put('/profile', userController.updateUserProfile);

userRouter.get('/recent-activity', userController.getRecentActivity);

// User statistics endpoints
userRouter.get('/statistics/qr', userController.getUserQRStatistics);
userRouter.get('/statistics/audio', userController.getUserAudioStatistics);

userRouter.get(
  '/admin/:userId',
  authMiddleware.verifyIsAdmin,
  userController.getSingleUser,
);

module.exports = userRouter;
