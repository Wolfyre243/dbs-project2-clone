// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const eventLogController = require('../controllers/eventLogController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const eventLogRouter = express.Router();

eventLogRouter.use(jwtMiddleware.verifyToken);

// Paginated audit logs with filter
// eventLogRouter.get('/', eventLogController.getPaginatedEventLogs);

// List all audit log types
eventLogRouter.get('/log-types', eventLogController.getAllEventLogTypes);

eventLogRouter.post(
  '/audio/:eventTypeId',
  eventLogController.createAudioEventLog,
);

module.exports = eventLogRouter;
