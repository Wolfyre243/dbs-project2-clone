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
const subtitleModel = require('../models/subtitleModel');
const { logAdminAudit } = require('../utils/auditlogs');

module.exports.createSubtitle = catchAsync(async (req, res, next) => {
  const { text, languageCode } = req.body;
  const userId = res.locals.user.userId;

  // Validate language code
  const supportedLanguages = await languageModel.getActiveLanguages();
  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  const subtitle = await subtitleModel.create({
    subtitleText: text,
    languageCode,
    createdBy: userId,
    modifiedBy: userId,
  });

  await logAdminAudit({
    userId,
    ipAddress: req.ip,
    entityName: 'subtitle',
    entityId: subtitle.subtitleId,
    actionTypeId: AuditActions.CREATE,
    logText: `Created subtitle entity with ID ${subtitle.subtitleId}`,
  });

  logger.debug(`Text converted to audio and saved successfully: ${fileLink}`);

  res.status(201).json({
    status: 'success',
    data: {
      subtitleId: subtitle.subtitleId,
      languageCode,
      text,
      message: 'Successfully created subtitle',
    },
  });
});
