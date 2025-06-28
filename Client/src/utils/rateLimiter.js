/**
 * Client-side rate limiter to prevent excessive API requests
 */

class RateLimiter {
  constructor() {
    this.requests = new Map(); // url -> [timestamps]
    this.globalBackoff = null; // Global backoff timestamp
  }

  canMakeRequest(url, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();

    // Check global backoff
    if (this.globalBackoff && now < this.globalBackoff) {
      return {
        allowed: false,
        reason: "global_backoff",
        retryAfter: Math.ceil((this.globalBackoff - now) / 1000),
      };
    }

    // Clean up old requests
    this.cleanup(url, windowMs);

    // Get current requests for this URL
    const urlRequests = this.requests.get(url) || [];

    if (urlRequests.length >= maxRequests) {
      const oldestRequest = urlRequests[0];
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

      return {
        allowed: false,
        reason: "rate_limit",
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    return { allowed: true };
  }

  recordRequest(url) {
    const now = Date.now();
    const urlRequests = this.requests.get(url) || [];
    urlRequests.push(now);
    this.requests.set(url, urlRequests);
  }

  setGlobalBackoff(seconds) {
    this.globalBackoff = Date.now() + seconds * 1000;
    console.warn(`Rate limiter: Global backoff set for ${seconds} seconds`);
  }

  clearGlobalBackoff() {
    this.globalBackoff = null;
  }

  cleanup(url, windowMs) {
    const now = Date.now();
    const urlRequests = this.requests.get(url) || [];
    const validRequests = urlRequests.filter(
      (timestamp) => now - timestamp < windowMs,
    );

    if (validRequests.length === 0) {
      this.requests.delete(url);
    } else {
      this.requests.set(url, validRequests);
    }
  }

  cleanupAll() {
    const now = Date.now();
    const windowMs = 60000; // 1 minute cleanup window

    for (const [url, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        (timestamp) => now - timestamp < windowMs,
      );

      if (validRequests.length === 0) {
        this.requests.delete(url);
      } else {
        this.requests.set(url, validRequests);
      }
    }
  }

  getStatus() {
    return {
      activeUrls: this.requests.size,
      globalBackoff: this.globalBackoff
        ? Math.ceil((this.globalBackoff - Date.now()) / 1000)
        : null,
      requests: Object.fromEntries(this.requests.entries()),
    };
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup old requests every 5 minutes
setInterval(
  () => {
    rateLimiter.cleanupAll();
  },
  5 * 60 * 1000,
);

// Enhanced API wrapper with rate limiting
export const withRateLimit = async (url, apiCall, options = {}) => {
  const { maxRequests = 5, windowMs = 60000, retryOnLimit = false } = options;

  // Check if request is allowed
  const check = rateLimiter.canMakeRequest(url, maxRequests, windowMs);

  if (!check.allowed) {
    const error = new Error(
      check.reason === "global_backoff"
        ? `Global rate limit active. Try again in ${check.retryAfter} seconds.`
        : `Rate limit exceeded for ${url}. Try again in ${check.retryAfter} seconds.`,
    );
    error.isRateLimitError = true;
    error.retryAfter = check.retryAfter;
    error.reason = check.reason;

    if (!retryOnLimit) {
      throw error;
    }

    // Auto-retry after backoff
    console.log(`Rate limit hit, waiting ${check.retryAfter} seconds...`);
    await new Promise((resolve) =>
      setTimeout(resolve, check.retryAfter * 1000),
    );
    return withRateLimit(url, apiCall, options);
  }

  try {
    // Record the request
    rateLimiter.recordRequest(url);

    // Make the API call
    const result = await apiCall();

    // Clear global backoff on successful request
    rateLimiter.clearGlobalBackoff();

    return result;
  } catch (error) {
    // Handle 429 responses by setting global backoff
    if (error.response?.status === 429 || error.isRateLimitError) {
      const retryAfter =
        error.retryAfter || error.response?.headers["retry-after"] || 60; // Default 1 minute

      rateLimiter.setGlobalBackoff(parseInt(retryAfter));
    }

    throw error;
  }
};

// Debug function
export const debugRateLimiter = () => {
  console.log("Rate Limiter Status:", rateLimiter.getStatus());
};

// Make available globally in development
if (import.meta.env.DEV) {
  window.rateLimiter = rateLimiter;
  window.debugRateLimiter = debugRateLimiter;
}

export default rateLimiter;
