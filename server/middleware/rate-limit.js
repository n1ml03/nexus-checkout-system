/**
 * Rate Limiting Middleware
 *
 * This file provides rate limiting middleware to protect against
 * brute force attacks and API abuse.
 */

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
const ipRequests = new Map();

// Maximum number of IPs to track (to prevent memory leaks)
const MAX_IPS = 10000;

/**
 * Clear expired rate limit entries
 * Run this periodically to prevent memory leaks
 */
const clearExpiredRateLimits = () => {
  const now = Date.now();

  // Remove expired entries
  for (const [ip, data] of ipRequests.entries()) {
    if (data.resetTime <= now) {
      ipRequests.delete(ip);
    }
  }

  // If we're still over the limit, remove oldest entries
  if (ipRequests.size > MAX_IPS) {
    const entriesToRemove = ipRequests.size - MAX_IPS;
    const entries = Array.from(ipRequests.entries());

    // Sort by resetTime (oldest first)
    entries.sort((a, b) => a[1].resetTime - b[1].resetTime);

    // Remove oldest entries
    for (let i = 0; i < entriesToRemove; i++) {
      if (entries[i]) {
        ipRequests.delete(entries[i][0]);
      }
    }
  }
};

// Clear expired entries every 5 minutes
setInterval(clearExpiredRateLimits, 5 * 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {Object} options Rate limiter options
 * @param {number} options.windowMs Time window in milliseconds
 * @param {number} options.max Maximum number of requests in the time window
 * @param {string} options.message Error message to return
 * @returns {Function} Express middleware function
 */
export const createRateLimiter = ({ windowMs = 60 * 1000, max = 5, message = 'Too many requests' }) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Initialize or get the request data for this IP
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const requestData = ipRequests.get(ip);

    // Reset if the time window has passed
    if (requestData.resetTime <= now) {
      requestData.count = 1;
      requestData.resetTime = now + windowMs;
      return next();
    }

    // Increment request count
    requestData.count += 1;

    // Check if the request count exceeds the maximum
    if (requestData.count > max) {
      return res.status(429).json({
        data: null,
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        }
      });
    }

    next();
  };
};

/**
 * Rate limiter for authentication routes
 * More strict limits for sensitive operations
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts, please try again later'
});

/**
 * Rate limiter for API routes
 * Less strict limits for regular API operations
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please try again later'
});

/**
 * Rate limiter for user creation routes
 * Strict limits to prevent mass account creation
 */
export const createUserLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many accounts created from this IP, please try again later'
});

export default {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  createUserLimiter
};
