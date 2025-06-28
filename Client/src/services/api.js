// import axios from "axios";
// import { API_BASE_URL, LOCAL_STORAGE_KEYS } from "@/utils/constant";

// class ApiService {
//   constructor() {
//     this.instance = axios.create({
//       baseURL: API_BASE_URL,
//       timeout: 10000,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     this.setupInterceptors();
//   }

//   setupInterceptors() {
//     // Request interceptor to add auth token
//     this.instance.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error),
//     );

//     // Response interceptor for global error handling
//     this.instance.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         // Handle network errors gracefully
//         if (!error.response) {
//           // Network error, server down, etc.
//           console.error("Network error:", error.message);
//           const networkError = new Error("Network connection failed");
//           networkError.isNetworkError = true;
//           return Promise.reject(networkError);
//         }

//         if (error.response?.status === 401) {
//           // Clear auth data on unauthorized
//           localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
//           localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
//           window.location.href = "/login";
//         }

//         return Promise.reject(error);
//       },
//     );
//   }

//   async get(url, config) {
//     try {
//       const response = await this.instance.get(url, config);
//       return response.data;
//     } catch (error) {
//       // Handle network errors gracefully
//       if (error.isNetworkError || !error.response) {
//         throw new Error("Failed to fetch data");
//       }
//       throw error;
//     }
//   }

//   async post(url, data, config) {
//     const response = await this.instance.post(url, data, config);
//     return response.data;
//   }

//   async put(url, data, config) {
//     const response = await this.instance.put(url, data, config);
//     return response.data;
//   }

//   async patch(url, data, config) {
//     const response = await this.instance.patch(url, data, config);
//     return response.data;
//   }

//   async delete(url, config) {
//     try {
//       const response = await this.instance.delete(url, config);
//       return response.data;
//     } catch (error) {
//       // Handle network errors gracefully
//       if (error.isNetworkError || !error.response) {
//         throw new Error("Failed to delete data");
//       }
//       throw error;
//     }
//     return response.data;
//   }

//   async delete(url, config) {
//     const response = await this.instance.delete(url, config);
//     return response.data;
//   }

//   setAuthToken(token) {
//     localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
//     this.instance.defaults.headers.Authorization = `Bearer ${token}`;
//   }

//   clearAuthToken() {
//     localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
//     delete this.instance.defaults.headers.Authorization;
//   }
// }

// export const apiService = new ApiService();
// export default apiService;

import axios from "axios";
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from "@/utils/constant";
import { ApiCache } from "@/utils/cache";

class ApiService {
  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for global error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle network errors gracefully
        if (!error.response) {
          // Network error, server down, etc.
          console.error("Network error:", error.message);
          const networkError = new Error("Network connection failed");
          networkError.isNetworkError = true;
          return Promise.reject(networkError);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          const rateLimitError = new Error(
            retryAfter
              ? `Too many requests. Please try again in ${retryAfter} seconds.`
              : "Too many requests. Please wait before trying again.",
          );
          rateLimitError.isRateLimitError = true;
          rateLimitError.retryAfter = retryAfter;
          return Promise.reject(rateLimitError);
        }

        if (error.response?.status === 401) {
          // Clear auth data on unauthorized
          localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
          window.location.href = "/login";
        }

        return Promise.reject(error);
      },
    );
  }

  async get(url, config = {}) {
    try {
      // Check if caching is enabled for this request
      const enableCache = config.cache !== false;
      const cacheKey = enableCache
        ? ApiCache.generateKey(url, config.params)
        : null;

      // Try to get from cache first
      if (enableCache && cacheKey) {
        const cachedData = ApiCache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }

      const response = await this.instance.get(url, config);

      // Cache successful responses
      if (enableCache && cacheKey && response.data) {
        const ttl = config.cacheTTL || 5 * 60 * 1000; // 5 minutes default
        ApiCache.set(cacheKey, response.data, ttl);
      }

      return response.data;
    } catch (error) {
      // Handle network errors gracefully
      if (error.isNetworkError || !error.response) {
        const networkError = new Error("Failed to fetch data");
        networkError.isNetworkError = true;
        networkError.originalError = error;
        throw networkError;
      }
      throw error;
    }
  }

  async getWithCache(url, config = {}, cacheTTL = 5 * 60 * 1000) {
    return this.get(url, { ...config, cache: true, cacheTTL });
  }

  async getWithSWR(url, config = {}) {
    const cacheKey = ApiCache.generateKey(url, config.params);

    return ApiCache.getWithSWR(
      cacheKey,
      () => this.instance.get(url, config).then((res) => res.data),
      2 * 60 * 1000, // Stale after 2 minutes
      10 * 60 * 1000, // Max age 10 minutes
    );
  }

  async post(url, data, config) {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put(url, data, config) {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch(url, data, config) {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete(url, config) {
    try {
      const response = await this.instance.delete(url, config);
      return response.data;
    } catch (error) {
      // Handle network errors gracefully
      if (error.isNetworkError || !error.response) {
        throw new Error("Failed to delete data");
      }
      throw error;
    }
    return response.data;
  }

  async delete(url, config) {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  setAuthToken(token) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    this.instance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    delete this.instance.defaults.headers.Authorization;
  }
}

export const apiService = new ApiService();
export default apiService;
