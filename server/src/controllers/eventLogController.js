// Import types
const AppError = require('../utils/AppError');
// Import utilities
const catchAsync = require('../utils/catchAsync');
// Import Models
const eventLogModel = require('../models/eventLogModel');
const { logUserEvent } = require('../utils/eventlogs');
const EventTypes = require('../configs/eventTypes');

// module.exports.getPaginatedEventLogs = catchAsync(async (req, res, next) => {
module.exports.getPaginatedEventLogs = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'timestamp',
    order = 'desc',
    eventTypeId,
    search = '',
  } = req.query;

  const result = await eventLogModel.getPaginatedEventLogs({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    eventTypeId,
    search,
  });

  res.status(200).json({
    status: 'success',
    pageCount: Math.ceil(result.totalCount / pageSize),
    data: result.logs,
    totalCount: result.totalCount,
  });
});
// Get all audit log types
module.exports.getAllEventLogTypes = catchAsync(async (req, res, next) => {
  const types = await eventLogModel.getAllEventLogTypes();
  res.status(200).json({
    status: 'success',
    data: types,
  });
});

module.exports.createAudioEventLog = catchAsync(async (req, res, next) => {
  const userId = res.locals.user.userId;
  const role = res.locals.user.roleId;
  const { entityId, details } = req.body;
  const metadata = req.body.metadata;
  const { eventTypeId } = req.params;

  const allowedEventTypes = [
    EventTypes.AUDIO_STARTED,
    EventTypes.AUDIO_PAUSED,
    EventTypes.AUDIO_STOPPED,
    EventTypes.AUDIO_SEEKED,
    EventTypes.AUDIO_COMPLETED,
    EventTypes.AUDIO_VOLUME_CHANGED,
    EventTypes.AUDIO_MUTED,
    EventTypes.AUDIO_UNMUTED,
  ];

  if (!allowedEventTypes.includes(parseInt(eventTypeId))) {
    throw new AppError('Invalid audio event type', 400);
  }

  const eventLog = await logUserEvent({
    userId,
    entityId,
    entityName: 'audio',
    eventTypeId: parseInt(eventTypeId),
    details,
    metadata,
    role,
  });

  res.status(200).json({
    status: 'success',
    data: { ...eventLog },
  });
});
