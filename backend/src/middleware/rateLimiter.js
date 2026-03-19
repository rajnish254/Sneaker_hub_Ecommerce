/**
 * RATE LIMITING MIDDLEWARE
 * Prevents brute force attacks on sensitive endpoints
 */

const rateLimit = require('express-rate-limit');

// Login rate limiter - strict limits for auth attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: '❌ Too many login attempts, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    // Use IP address or user identifier
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again after 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Signup rate limiter - prevent spam account creation
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 accounts per hour per IP
  message: '❌ Too many accounts created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many signup attempts. Please try again after 1 hour.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for certain endpoints
    return req.path.includes('/health');
  }
});

module.exports = {
  loginLimiter,
  signupLimiter,
  generalLimiter
};
