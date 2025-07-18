// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const authController = require('../controllers/authController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const mailMiddleware = require('../middlewares/mailMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');
const {
  userValidationRules,
  validate,
  loginValidationRules,
} = require('../middlewares/validators');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/guest-login:
 *   post:
 *     summary: Login as a guest
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       401:
 *         description: Invalid credentials
 */
authRouter.post(
  '/guest-login',
  rateLimiter.loginLimiter,
  authController.guestLogin,
  jwtMiddleware.generateRefreshToken,
  jwtMiddleware.generateAccessToken,
  jwtMiddleware.setTokens,
);

authRouter.post(
  '/login',
  rateLimiter.loginLimiter,
  loginValidationRules(),
  validate,
  authController.login,
  jwtMiddleware.generateRefreshToken,
  jwtMiddleware.generateAccessToken,
  jwtMiddleware.setTokens,
);

authRouter.post(
  '/register',
  rateLimiter.registerLimiter,
  userValidationRules(),
  validate,
  authController.register,
  jwtMiddleware.generateRefreshToken,
  jwtMiddleware.generateAccessToken,
  mailMiddleware.sendMail,
  jwtMiddleware.setTokens,
);

/**
 * POST
 * Refreshes access token
 * (POST because access token is created)
 */
authRouter.post(
  '/refresh',
  jwtMiddleware.verifyRefreshToken,
  jwtMiddleware.generateAccessToken,
  async (req, res) => {
    return res.status(200).json({ accessToken: res.locals.accessToken });
  },
);

// TODO: Add verification
authRouter.put('/verify/:token', authController.verifyEmail);

authRouter.post(
  '/logout',
  jwtMiddleware.verifyRefreshToken,
  authController.logout, // TODO: Invalidate session
);

module.exports = authRouter;
