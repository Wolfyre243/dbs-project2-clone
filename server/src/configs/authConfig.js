const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: process.env.COOKIE_MAXAGE,
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
