import rateLimit from "express-rate-limit";

// Store for tracking requests
const requestStore = new Map();

// Create rate limiter with custom logic
export const rateLimiter = (identifier, maxRequests, windowMs) => {
  return rateLimit({
    windowMs: windowMs * 1000, // Convert to milliseconds
    max: maxRequests,
    message: {
      status: "error",
      message: `Too many ${identifier} requests from this IP, please try again later.`,
      retryAfter: Math.ceil(windowMs / 1000), // seconds, not minutes
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
      // Use IP + user ID if authenticated for more precise limiting
      return req.user
        ? `${req.ip}-${req.user.id}-${identifier}`
        : `${req.ip}-${identifier}`;
    },
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user && req.user.role === "admin";
    },
    // onLimitReached deprecated in v7
  });
};

// Custom rate limiter for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    status: "error",
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: true, // Don't count successful requests
  // onLimitReached deprecated in v7
});

// Progressive rate limiter that increases restrictions based on violations
export class ProgressiveRateLimiter {
  constructor() {
    this.violations = new Map();
    this.baseLimits = {
      requests: 100,
      windowMs: 60 * 1000, // 1 minute
    };
  }

  getKey(req) {
    return req.user ? `${req.ip}-${req.user.id}` : req.ip;
  }

  recordViolation(key) {
    const violations = this.violations.get(key) || 0;
    this.violations.set(key, violations + 1);

    // Clean up old violations after 1 hour
    setTimeout(
      () => {
        const current = this.violations.get(key) || 0;
        if (current <= 1) {
          this.violations.delete(key);
        } else {
          this.violations.set(key, current - 1);
        }
      },
      60 * 60 * 1000,
    );
  }

  getLimit(key) {
    const violations = this.violations.get(key) || 0;
    const multiplier = Math.pow(0.5, violations); // Halve limit for each violation
    return Math.max(10, Math.floor(this.baseLimits.requests * multiplier));
  }

  middleware() {
    return (req, res, next) => {
      const key = this.getKey(req);
      const limit = this.getLimit(key);

      // Create dynamic rate limiter
      const limiter = rateLimit({
        windowMs: this.baseLimits.windowMs,
        max: limit,
        message: {
          status: "error",
          message: `Rate limit exceeded. Current limit: ${limit} requests per minute.`,
          retryAfter: Math.ceil(this.baseLimits.windowMs / 1000),
        },
        keyGenerator: () => key,
        onLimitReached: () => {
          this.recordViolation(key);
          console.warn("Progressive rate limit exceeded:", {
            key,
            limit,
            violations: this.violations.get(key),
            timestamp: new Date().toISOString(),
          });
        },
      });

      limiter(req, res, next);
    };
  }
}

// Create instance for global use
export const progressiveRateLimiter = new ProgressiveRateLimiter();

// Specific rate limiters for different endpoints
export const createBlogRateLimiter = rateLimiter("createBlog", 5, 60); // 5 blogs per minute
export const commentRateLimiter = rateLimiter("comment", 10, 60); // 10 comments per minute
export const followRateLimiter = rateLimiter("follow", 20, 60); // 20 follow actions per minute
export const messageRateLimiter = rateLimiter("message", 30, 60); // 30 messages per minute
export const uploadRateLimiter = rateLimiter("upload", 10, 60); // 10 uploads per minute

// IP-based rate limiter for public endpoints
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute per IP - very generous for development
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for critical endpoints
  skip: (req) => {
    // Skip for health checks
    if (req.path.includes("/health")) return true;
    // Skip for authenticated users on basic reads
    if (req.user && req.method === "GET") return true;
    return false;
  },
});

// Strict rate limiter for sensitive operations
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    status: "error",
    message:
      "Too many requests for this sensitive operation, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
