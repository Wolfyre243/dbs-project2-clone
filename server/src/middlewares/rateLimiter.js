// Import express-rate-limit module
const rateLimit = require("express-rate-limit");

//==============================================================================
// Login rate limiter
//==============================================================================
const loginCooldown = 60 * 1000; // 1 min, in milliseconds
const loginLimiter = rateLimit({
  windowMs: loginCooldown,
  max: 5,
  message: {
    status: 429,
    message: `Too many login attempts. Try again after ${loginCooldown / 60000} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//================================================================================
// Admin-login limiter
//================================================================================
const adminLoginCooldown = 60 * 1000; // 1 min, in milliseconds
const adminLoginLimiter = rateLimit({
  windowMs: adminLoginCooldown,
  max: 3,
  message: {
    status: 429,
    message: `Too many admin login attempts. Try again after ${adminLoginCooldown / 60000} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  adminLoginLimiter,
};
