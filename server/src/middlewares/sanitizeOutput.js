const xss = require('xss');

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return xss(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

const sanitizeOutput = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const sanitizedData = sanitizeObject(data);
    return originalJson.call(this, sanitizedData);
  };

  return next();
};

module.exports = sanitizeOutput;
