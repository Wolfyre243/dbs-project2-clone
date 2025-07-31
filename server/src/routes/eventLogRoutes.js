/**
 * @swagger
 * tags:
 *   name: EventLog
 *   description: Endpoints for viewing and managing user event logs
 */

/**
 * @swagger
 * /event-log/:
 *   get:
 *     summary: Get paginated event logs
 *     tags: [EventLog]
 *     description: Returns a paginated list of user event logs. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: timestamp
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: eventTypeId
 *         schema:
 *           type: integer
 *         description: Filter by event type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for entityName or details
 *     responses:
 *       200:
 *         description: Paginated event logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 pageCount:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /event-log/log-types:
 *   get:
 *     summary: Get all event log types
 *     tags: [EventLog]
 *     description: Returns a list of all possible event log types.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of event log types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventTypeId:
 *                         type: integer
 *                       eventType:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /event-log/audio/{eventTypeId}:
 *   post:
 *     summary: Log an audio event
 *     tags: [EventLog]
 *     description: Logs an audio event (play, pause, stop, etc.) for a user. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event type ID (see /event-log/log-types)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entityId:
 *                 type: string
 *                 description: The ID of the audio entity
 *               details:
 *                 type: string
 *                 description: Details about the event
 *               metadata:
 *                 type: object
 *                 description: Optional metadata for the event
 *     responses:
 *       200:
 *         description: Event log created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid event type
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /event-log/{eventId}:
 *   get:
 *     summary: Get a single event log by ID
 *     tags: [EventLog]
 *     description: Returns a single event log entry by its ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event log ID
 *     responses:
 *       200:
 *         description: Event log details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Event log not found
 *       401:
 *         description: Unauthorized
 */
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
eventLogRouter.get('/', eventLogController.getPaginatedEventLogs);

// List all audit log types
eventLogRouter.get('/log-types', eventLogController.getAllEventLogTypes);

eventLogRouter.post(
  '/audio/:eventTypeId',
  eventLogController.createAudioEventLog,
);

eventLogRouter.get('/:eventId', eventLogController.getEventLogById);

module.exports = eventLogRouter;
