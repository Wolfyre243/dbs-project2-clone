const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production
  sameSite: 'lax',
  maxAge: Number(process.env.COOKIE_MAXAGE) || 7 * 24 * 60 * 60 * 1000, // 7 days default
};

// JWT Secrets
const verifySK = process.env.JWT_VERIFY_SECRET_KEY;
const verifyTokenDuration = process.env.JWT_VERIFY_EXPIRES_IN;
const accessSK = process.env.JWT_ACCESS_SECRET_KEY;
const accessTokenDuration = process.env.JWT_ACCESS_EXPIRES_IN;
const refreshSK = process.env.JWT_REFRESH_SECRET_KEY;
const refreshTokenDuration = process.env.JWT_REFRESH_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;

module.exports = {
  cookieOptions,
  verifySK,
  verifyTokenDuration,
  accessSK,
  accessTokenDuration,
  refreshSK,
  refreshTokenDuration,
  tokenAlgorithm,
};
