const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const statusCodes = require('../configs/statusCodes');
const uploadFile = require('../utils/fileUploader').uploadFile;
const generateQrImageBuffer = require('../utils/generateQrImageBuffer');
const { generateQrJwt } = require('../utils/qrJwt');
const AuditActions = require('../configs/auditActionConfig');
const { saveImageFile } = require('../utils/fileUploader');

//======================================================================================
// MODEL FUNCTIONS
//======================================================================================

module.exports.generateQRCode = async (createdBy, exhibitId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      //Check if QR code already exists
      const exists = await tx.qrCode.findUnique({
        where: { exhibitId },
      });

      // Generate JWT for QR code access
      const qrJwt = generateQrJwt(exhibitId);
      const qrCodeUrl = `/home/exhibits/${exhibitId}?token=${qrJwt}`;

      //Generate image buffer with JWT in URL
      const { buffer } = await generateQrImageBuffer(qrCodeUrl);

      const { fileLink, fileName } = await saveImageFile(buffer);

      // Create record in the image table
      const image = await tx.image.create({
        data: {
          fileLink,
          fileName,
          createdBy,
          statusId: statusCodes.ACTIVE,
        },
      });

      let qrCode;
      if (exists) {
        await tx.image.update({
          where: { imageId: exists.imageId },
          data: {
            statusId: statusCodes.DELETED,
          },
        });

        qrCode = await tx.qrCode.update({
          where: { exhibitId },
          data: {
            url: qrCodeUrl,
            imageId: image.imageId,
          },
        });
      } else {
        qrCode = await tx.qrCode.create({
          data: {
            exhibitId,
            imageId: image.imageId,
            url: qrCodeUrl,
            createdBy,
            statusId: statusCodes.ACTIVE,
          },
        });
      }

      return {
        qrCodeId: qrCode.qrCodeId,
        fileLink,
        fileName,
        url: qrCodeUrl,
        qrJwt,
      };
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(
        'QR Code with this file link or file name already exists.',
        409,
      );
    }
    throw error;
  }
};

module.exports.getQRCodeById = async (qrCodeId) => {
  try {
    const qrCode = prisma.qrCode.findUnique({
      where: { qrCodeId: qrCodeId },
    });
    logger.info(`QRcode with ID ${qrCodeId} retrieved successfully`);
    return qrCode;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new AppError(`Image with ID ${imageId} not found`, 404);
      }
    }
    console.error(e);
    logger.error(`Error fetching image with ID ${imageId}`, e);
    throw new AppError(`Failed to fetch image by ID`, 500);
  }
};

// Get all QR codes
module.exports.getAllQRcodes = async () => {
  try {
    return await prisma.qrCode.findMany({
      include: { image: true, exhibit: true, status: true },
    });
  } catch (error) {
    throw new AppError('Failed to fetch QR codes', 500);
  }
};

// Soft delete QR code (set status to DELETED)
module.exports.softDeleteQRCode = async (qrCodeId) => {
  try {
    const qrCode = await prisma.qrCode.update({
      where: { qrCodeId },
      data: { statusId: statusCodes.DELETED },
    });
    return qrCode;
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('QR code not found', 404);
    throw error;
  }
};

// Archive QR code (set status to ARCHIVED)
module.exports.archiveQRCode = async (qrCodeId, userId, ipAddress) => {
  try {
    const qrCode = await prisma.qrCode.update({
      where: { qrCodeId },
      data: { statusId: statusCodes.ARCHIVED },
    });

    // Invoking archive image from imageModel.js
    await require('./imageModel').archiveImage(
      qrCode.imageId,
      statusCodes.ARCHIVED,
    );

    // Audit action for archiving image
    await logAdminAudit({
      userId,
      ipAddress,
      entityName: 'image',
      entityId: qrCode.imageId,
      actionTypeId: AuditActions.UPDATE,
      logText: 'Image archived successfully',
    });

    return qrCode;
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('QR code not found', 404);
    throw error;
  }
};

// Hard delete QR code (delete from DB and Supabase)
module.exports.hardDeleteQRCode = async (qrCodeId, userId, ipAddress) => {
  try {
    const qrCode = await prisma.qrCode.findUnique({
      where: { qrCodeId },
      include: { image: true },
    });
    if (!qrCode) throw new AppError('QR code not found', 404);

    // Delete image from Supabase
    await deleteFile('images', qrCode.image.fileName);

    // Delete image record
    await prisma.image.delete({ where: { imageId: qrCode.imageId } });

    await logAdminAudit({
      userId: userId,
      ipAddress,
      entityName: 'image',
      entityId: qrCode.imageId,
      actionTypeId: AuditActions.DELETE,
      logText: 'Image hard deleted successfully',
    });

    // Delete QR code record
    await prisma.qrCode.delete({ where: { qrCodeId } });

    return { qrCodeId };
  } catch (error) {
    if (error.code === 'P2025') throw new AppError('QR code not found', 404);
    throw error;
  }
};

// Unarchive model
module.exports.unarchiveQRCode = async function (qrCodeId, userId, ipAddress) {
  try {
    const qrCode = await prisma.qrCode.update({
      where: { qrCodeId },
      data: { statusId: statusCodes.ACTIVE },
    });

    // Unarchive image function from imageModel.js
    await require('./imageModel').unarchiveImage(qrCode.imageId);

    // Audit action for archiving image
    await logAdminAudit({
      userId,
      ipAddress,
      entityName: 'image',
      entityId: qrCode.imageId,
      actionTypeId: AuditActions.UPDATE,
      logText: 'Image unarchived successfully',
    });

    return qrCode;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('QR code not found', 404);
    }
    throw error;
  }
};




// Get scan counts grouped by exhibit
module.exports.getScansPerExhibitStats = async () => {
  try {
    const where = {
      entityName: 'qrCode',
      eventTypeId: 1, // QR_SCANNED
    };

    // Get all scan events
    const scans = await prisma.event.findMany({
      where,
      select: { details: true }
    });

    // Aggregate counts per exhibitId
    const exhibitScanCounts = {};
scans.forEach(scan => {
  let exhibitId = null;
  // Try to parse as JSON first
  try {
    const detailsObj = JSON.parse(scan.details);
    exhibitId = detailsObj.exhibitId;
  } catch {
    // If not JSON, try to extract from plain text
    const match = scan.details.match(/exhibit (\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/);
    if (match) {
      exhibitId = match[1];
    }
  }
  if (exhibitId) {
    exhibitScanCounts[exhibitId] = (exhibitScanCounts[exhibitId] || 0) + 1;
  }
});

    // Get exhibit info for each exhibitId
    const exhibitIds = Object.keys(exhibitScanCounts);
    const exhibits = await prisma.exhibit.findMany({
      where: { exhibitId: { in: exhibitIds } },
      select: { exhibitId: true, title: true, description: true }
    });

    // Combine counts and exhibit info
    const result = exhibits.map(exhibit => ({
      exhibitId: exhibit.exhibitId,
      title: exhibit.title,
      description: exhibit.description,
      scanCount: exhibitScanCounts[exhibit.exhibitId] || 0,
    }));

    return result;
  } catch (error) {
    throw new AppError('Failed to get scans per exhibit', 500);
  }
};