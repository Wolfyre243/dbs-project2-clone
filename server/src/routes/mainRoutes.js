// Import dependencies
const express = require("express");

// Import external routers
const authRouter = require("./authRoutes");

// Create the main router and register routers
const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);

// Export the main router
module.exports = mainRouter;
