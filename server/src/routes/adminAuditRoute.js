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

/**
 * @swagger
 * tags:
 *   name: AdminAudit
 *   description: Endpoints for viewing and managing admin audit logs (admin only)
 */

/**
 * @swagger
 * /admin-audit/:
 *   get:
 *     summary: Get paginated admin audit logs
 *     tags: [AdminAudit]
 *     description: Returns a paginated list of admin audit logs. Requires admin authentication.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: timestamp }
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Sort order
 *       - in: query
 *         name: actionTypeId
 *         schema: { type: integer }
 *         description: Filter by action type
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search term for entityName or logText
 *     responses:
 *       200:
 *         description: Paginated audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 pageCount: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 totalCount: { type: integer }
 *       401:
 *         description: Unauthorized
 */

// Paginated audit logs with filter
adminAuditRouter.get('/', adminAuditController.getPaginatedAuditLogs);

/**
 * @swagger
 * /admin-audit/log-types:
 *   get:
 *     summary: Get all audit log types
 *     tags: [AdminAudit]
 *     description: Returns a list of all possible audit log action types.
 *     responses:
 *       200:
 *         description: List of audit log types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditAction'
 *       401:
 *         description: Unauthorized
 */

// List all audit log types
adminAuditRouter.get('/log-types', adminAuditController.getAllAuditLogTypes);

/**
 * @swagger
 * /admin-audit/{auditLogId}:
 *   get:
 *     summary: Get a single audit log by ID
 *     tags: [AdminAudit]
 *     parameters:
 *       - in: path
 *         name: auditLogId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Audit log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuditLog'
 *       404:
 *         description: Audit log not found
 *       401:
 *         description: Unauthorized
 */

// Get audit log by ID
adminAuditRouter.get('/:auditLogId', adminAuditController.getAuditLogById);

module.exports = adminAuditRouter;
