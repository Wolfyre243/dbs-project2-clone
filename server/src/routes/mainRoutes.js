// Import dependencies
const express = require('express');

// Import external routers
const authRouter = require('./authRoutes');
const audioRouter = require('./audioRoutes');
const userRouter = require('./userRoutes');
const exhibitRouter = require('./exhibitRoutes');

// Create the main router and register routers
const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/audio', audioRouter);
mainRouter.use('/user', userRouter);
mainRouter.use('/exhibit', exhibitRouter);

mainRouter.get('/', (req, res) => {
  res.redirect('/docs');
});

// Export the main router
module.exports = mainRouter;
