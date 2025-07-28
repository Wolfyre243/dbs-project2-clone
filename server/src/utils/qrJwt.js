// Utility for generating and verifying JWTs for QR code exhibit access

const jwt = require('jsonwebtoken');
const {
  verifySK,
  verifyTokenDuration,
  tokenAlgorithm,
} = require('../configs/authConfig');

// Generate a JWT for QR code access
function generateQrJwt(exhibitId) {
  const payload = { exhibitId };
  // No expiry for permanent QR codes; otherwise, add: expiresIn: verifyTokenDuration
  return jwt.sign(payload, verifySK, { algorithm: tokenAlgorithm });
}

// Verify a QR JWT and return the payload if valid, else throw
function verifyQrJwt(token) {
  return jwt.verify(token, verifySK, { algorithm: tokenAlgorithm });
}

module.exports = {
  generateQrJwt,
  verifyQrJwt,
};
