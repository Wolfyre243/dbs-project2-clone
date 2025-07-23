// Import types
const AppError = require('../utils/AppError');
const Roles = require('../configs/roleConfig');
const AuditActions = require('../configs/auditActionConfig');
const statusCodes = require('../configs/statusCodes');

// Import utilities
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { encryptData, decryptData } = require('../utils/encryption');

// Impoort Models
const languageModel = require('../models/languageModel');
const { logAdminAudit } = require('../utils/auditlogs');

module.exports.retrieveAllLanguages = catchAsync(async (req, res, next) => {
  const supportedLanguages = await languageModel.getActiveLanguages();

  logger.info(
    `Successfully retrieved ${supportedLanguages.length} supported languages!`,
  );

  return res.status(200).json({
    status: 'success',
    data: supportedLanguages,
  });
});
