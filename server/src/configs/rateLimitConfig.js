// This is a config file for rate limiting

const RateLimits = {
  LOGIN: {
    cooldown: 60 * 1000, // 1 min, in milliseconds
    maxAttempts: 5,
  },
  ADMINLOGIN: {
    cooldown: 60 * 1000, // 1 min, in milliseconds
    maxAttempts: 3,
  },
  REGISTER: {
    cooldown: 60 * 1000, // 1 min, in milliseconds
    maxAttempts: 5,
  },
  CHAT: {
    cooldown: 60 * 1000,
    maxAttempts: 5,
  },
};

module.exports = RateLimits;
