const rateLimit = require('express-rate-limit');

const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
  message: { error: 'Too many requests.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                                        
    keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip,
    message: { error: 'Too many attempts, please try again later.' }
});

module.exports = { ipLimiter, authLimiter };