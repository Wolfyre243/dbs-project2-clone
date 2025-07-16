const rateLimit = require('express-rate-limit');
const RateLimits = require('../configs/rateLimitConfig');

const createRateLimiter = (key) => {
  const config = RateLimits[key];
  if (!config) throw new Error(`Rate limit config for ${key} not found`);
  return rateLimit({
    windowMs: config.cooldown,
    max: config.maxAttempts,
    message: {
      status: 429,
      message: `Too many requests. Try again after ${config.cooldown / 60000} minutes`,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Predefined limiters for convenience
module.exports.loginLimiter = createRateLimiter('LOGIN');
module.exports.registerLimiter = createRateLimiter('REGISTER');
module.exports.adminLoginLimiter = createRateLimiter('ADMINLOGIN');
module.exports.createRateLimiter = createRateLimiter;
