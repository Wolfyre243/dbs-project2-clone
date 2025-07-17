// Import dependencies
const express = require('express');

// Import external routers
const authRouter = require('./authRoutes');
const audioRouter = require('./audioRoutes');

// Create the main router and register routers
const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/audio', audioRouter);

// Export the main router
module.exports = mainRouter;
