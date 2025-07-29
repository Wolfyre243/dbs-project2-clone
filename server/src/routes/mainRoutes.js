// Import dependencies
const express = require('express');

// Import external routers
const authRouter = require('./authRoutes');
const audioRouter = require('./audioRoutes');
const userRouter = require('./userRoutes');
const exhibitRouter = require('./exhibitRoutes');
const subtitleRouter = require('./subtitleRoutes');
const languageRouter = require('./languageRoutes');
const imageRouter = require('./imageRoutes');
const QRcodeRouter = require('./QRcodeRoutes');
const statisticsRouter = require('./statisticsRoutes');
const survey = require('./surveyRoutes');
const adminAuditRouter = require('./adminAuditRoute');
const eventLogRouter = require('./eventLogRoutes');

// Create the main router and register routers
const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/audio', audioRouter);
mainRouter.use('/user', userRouter);
mainRouter.use('/exhibit', exhibitRouter);
mainRouter.use('/subtitle', subtitleRouter);
mainRouter.use('/language', languageRouter);
mainRouter.use('/image', imageRouter);
mainRouter.use('/qrcode', QRcodeRouter);
mainRouter.use('/statistics', statisticsRouter);
mainRouter.use('/admin-audit', adminAuditRouter);
mainRouter.use('/event-log', eventLogRouter);

//mainRouter.use('/survey', survey);
mainRouter.get('/', (req, res) => {
  res.redirect('/docs');
});

// Export the main router
module.exports = mainRouter;
