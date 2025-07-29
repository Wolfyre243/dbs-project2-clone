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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       401:
 *         description: Invalid credentials
 */
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

authRouter.post(
  '/register-admin',
  rateLimiter.registerLimiter,
  userValidationRules(),
  validate,
  authController.registerAdmin,
  mailMiddleware.sendMail,
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

authRouter.post(
  '/send-verification',
  jwtMiddleware.verifyToken,
  authController.generateVerificationMail,
  mailMiddleware.sendMail,
);

authRouter.put('/verify/:token', authController.verifyEmail);

authRouter.post(
  '/logout',
  jwtMiddleware.verifyRefreshToken,
  authController.logout,
);

module.exports = authRouter;
