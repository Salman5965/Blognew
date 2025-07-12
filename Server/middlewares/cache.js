// Simple in-memory cache implementation
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = 300) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.cache.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  get(key) {
    return this.cache.get(key);
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  del(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }
}

const cache = new SimpleCache();

// Simple response caching middleware
export const cacheResponse = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create cache key from URL and query params
    const cacheKey = `${req.originalUrl || req.url}`;

    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function (data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, duration);
        console.log(`🗄️ Cached response for ${cacheKey}`);
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache for specific patterns
export const clearCache = (pattern) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter((key) => key.includes(pattern));

  keysToDelete.forEach((key) => {
    cache.del(key);
  });

  console.log(
    `🗑️ Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`,
  );
};

export default { cacheResponse, clearCache };
