const QRCode = require('qrcode');
const getBaseUrl = require('./getBaseUrl');

async function generateQrImageBuffer(path) {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = getBaseUrl(isProduction);
  const fullUrl = `${baseUrl}${path}`;

  try {
    const buffer = await QRCode.toBuffer(fullUrl);
    return {
      buffer,
      fullUrl,
    };
  } catch (error) {
    throw new Error(`Failed to generate QR code buffer: ${error.message}`);
  }
}

module.exports = generateQrImageBuffer;
