import NodeCache from "node-cache";

// Create cache instance with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

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
