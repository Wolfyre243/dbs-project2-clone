// --------------------------------------IMPORT---------------------------------------
// Import dependencies
const express = require('express');

// Import controllers
const adminAuditController = require('../controllers/adminAuditController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// -----------------------------------SET UP ROUTES-----------------------------------
// Create the router
const adminAuditRouter = express.Router();

adminAuditRouter.use(jwtMiddleware.verifyToken, authMiddleware.verifyIsAdmin);

// Paginated audit logs with filter
adminAuditRouter.get('/all-logs', adminAuditController.getPaginatedAuditLogs);

// List all audit log types
adminAuditRouter.get('/log-types', adminAuditController.getAllAuditLogTypes);

module.exports = adminAuditRouter;