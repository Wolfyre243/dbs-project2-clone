// Import types
const AppError = require('../utils/AppError');


// Import utilities
const catchAsync = require('../utils/catchAsync');

// Import Models
const adminAuditModel = require('../models/adminAuditModel');


// Get paginated admin audit logs
module.exports.getPaginatedAuditLogs = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'timestamp',
    order = 'desc',
    actionTypeId,
    search = '',
  } = req.query;

  const result = await adminAuditModel.getPaginatedAuditLogs({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    sortBy,
    order,
    actionTypeId,
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
module.exports.getAllAuditLogTypes = catchAsync(async (req, res, next) => {
  const types = await adminAuditModel.getAllAuditLogTypes();
  res.status(200).json({
    status: 'success',
    data: types,
  });
});