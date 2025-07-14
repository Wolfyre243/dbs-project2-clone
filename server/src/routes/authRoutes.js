// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require("express");

// Import controllers
const authController = require("../controllers/authController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const rateLimiter = require("../middlewares/rateLimiter");
const {
  userValidationRules,
  validate,
  loginValidationRules,
} = require("../middlewares/validators");

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const authRouter = express.Router();

/**
 * POST
 * Logs the user in as guest
 */
authRouter.post(
  "/login",
  rateLimiter.loginLimiter,
  loginValidationRules(),
  validate,
  authController.guestLogin,
  jwtMiddleware.generateRefreshToken,
  jwtMiddleware.generateAccessToken,
  jwtMiddleware.setTokens,
);

module.exports = authRouter;
