const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');
const statusCodes = require('../configs/statusCodes');
const uploadFile = require('../utils/fileUploader').uploadFile;
const generateQrImageBuffer = require('../utils/generateQrImageBuffer');


module.exports.generateQRCode = async (createdBy, exhibitId, imageId) => {

    //Check if QR code already exists
    const exists = await prisma.qrCode.findUnique({
        where: { exhibitId },
    });

    if (exists) {
        throw new AppError('QRcode already exists for this exhibit', 400);
    }

    //Generate image buffer
    const { buffer } = await generateQrImageBuffer(`/exhibit/${exhibitId}`);

    //Upload QR to supabase sorry Junkai had to do it HAHA
    const { fileLink, fileName } = await uploadFile(
        { buffer, originalname: `qr-exhibit-${exhibitId}.png` },
        'images'
    );

    // Create record in the image table
    const image = await require('./imageModel').createImage({
  fileLink,
  fileName,
  createdBy,
  statusId: statusCodes.ACTIVE,
});

// Create qrcode record 
const qrCode = await prisma.qrCode.create({
    data: {
        exhibitId,
        imageId: image.imageId,
        createdBy,
        statusId: statusCodes.ACTIVE,
  },
});

return {
    qrCodeId: qrCode.qrCodeId,
    fileLink,
    fileName,
}

};

module.exports.reGenerateQRcode = async(qrCodeId, createdBy) => {

    // Find the record
    const qrCode = await prisma.qrCode.findUnique({
        where: { qrCodeId }
    });

    if(!qrCode) {
        throw new AppError(`QR code not found`, 404);
    }

    // Re-generate new buffer
   const { buffer } = await generateQrImageBuffer(`/exhibit/${qrCode.exhibitId}`);

   // Upload new QR code image to supabase
   const { fileLink, fileName } = await uploadFile(
    { buffer, originalname: `qr-exhibit-${qrCode.exhibitId}.png`},
    'images'
   );

   //Creating new image record beofre creating qrcode record
  await require('./imageModel').updateImage(qrCode.imageId, {
        fileLink,
        fileName,
        createdBy: createdBy,
        createdAt: new Date(),
    });

        await logAdminAudit({
        userId: createdBy,
        ipAddress: req.ip,
        entityName: 'image',
        entityId: qrCode.imageId,
        actionTypeId: 3,
        logText: 'Image updated successfully',
      });

// Updating qrcode table record
await prisma.qrCode.update({
    where: { qrCodeId },
    data: {
        createdAt: new Date(),
    },
});

return {
    fileLink,
    fileName,
};

};