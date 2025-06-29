import axios from "axios";
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from "@/utils/constant";
import { ApiCache } from "@/utils/cache";
import {
  debugApiRequest,
  debugApiResponse,
  isDebugMode,
} from "@/utils/debugMode";

class ApiService {
  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Increased to 30 seconds
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
          // Network error, server down, timeout, etc.
          console.error("Network error:", {
            message: error.message,
            code: error.code,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              timeout: error.config?.timeout,
            },
          });

          let errorMessage = "Network connection failed";
          if (
            error.code === "ECONNABORTED" ||
            error.message.includes("timeout")
          ) {
            errorMessage = "Request timed out. Please try again.";
          } else if (error.message.includes("Network Error")) {
            errorMessage =
              "Unable to connect to server. Please check your internet connection.";
          }

          const networkError = new Error(errorMessage);
          networkError.isNetworkError = true;
          networkError.originalError = error;
          return Promise.reject(networkError);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          const responseData = error.response.data;

          // Extract retry time from response data if available
          let retryTime = retryAfter;
          if (
            responseData &&
            typeof responseData === "object" &&
            responseData.retryAfter
          ) {
            retryTime = responseData.retryAfter;
          }

          // Cap retry time to maximum of 60 seconds for UX
          const cappedRetryTime = Math.min(parseInt(retryTime) || 60, 60);

          const rateLimitError = new Error(
            `Too many requests. Please try again in ${cappedRetryTime} seconds.`,
          );
          rateLimitError.isRateLimitError = true;
          rateLimitError.retryAfter = cappedRetryTime;
          rateLimitError.status = 429;
          rateLimitError.response = error.response;

          // Log rate limiting for debugging
          console.warn("Rate limit hit:", {
            url: error.config?.url,
            retryAfter: cappedRetryTime,
            originalRetryAfter: retryTime,
            message: responseData?.error || responseData?.message,
          });

          return Promise.reject(rateLimitError);
        }

        if (error.response?.status === 401) {
          // Only clear auth data and redirect if this is not a login/register attempt
          const isAuthEndpoint =
            error.config?.url?.includes("/auth/login") ||
            error.config?.url?.includes("/auth/register");
          if (!isAuthEndpoint) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
            window.location.href = "/login";
          }
        }

        // Log detailed error information for debugging
        if (error.response?.status === 400) {
          console.error("400 Bad Request Error:", {
            url: error.config?.url,
            method: error.config?.method,
            data: JSON.parse(error.config?.data || "{}"),
            responseData: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
          });
        }

        return Promise.reject(error);
      },
    );
  }

  async get(url, config = {}) {
    try {
      // Debug logging
      debugApiRequest(url, "GET", config.params);

      // Rate limiting can be added here if needed

      // Check if caching is enabled for this request
      const enableCache = config.cache !== false;
      const cacheKey = enableCache
        ? ApiCache.generateKey(url, config.params)
        : null;

      // Try to get from cache first
      if (enableCache && cacheKey) {
        const cachedData = ApiCache.get(cacheKey);
        if (cachedData) {
          if (isDebugMode()) {
            console.log(`📦 Cache hit for ${url}`);
          }
          return cachedData;
        }
      }

      const response = await this.instance.get(url, config);

      // Debug response
      debugApiResponse(url, response.data);

      // Cache successful responses
      if (enableCache && cacheKey && response.data) {
        const ttl = config.cacheTTL || 5 * 60 * 1000; // 5 minutes default
        ApiCache.set(cacheKey, response.data, ttl);
      }

      return response.data;
    } catch (error) {
      // Handle 404 errors first before any other processing
      if (error.response?.status === 404) {
        return {
          _isError: true,
          status: 404,
          message: "Not Found",
          data: null,
        };
      }
      // Debug error response
      debugApiResponse(url, null, error);

      // Only log errors that aren't expected 404s
      if (error.response?.status !== 404) {
        // Log the error for debugging with proper serialization
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          isNetworkError: error.isNetworkError,
          code: error.code,
          baseURL: this.instance.defaults.baseURL,
          url: url,
          timestamp: new Date().toISOString(),
        };
        console.error(
          `API Error for ${url}:`,
          JSON.stringify(errorDetails, null, 2),
        );

        // Also log response data if available
        if (error.response?.data) {
          console.error(
            "Error response data:",
            JSON.stringify(error.response.data, null, 2),
          );
        }
      }

      // Handle network errors gracefully
      if (error.isNetworkError || !error.response) {
        const networkError = new Error("Failed to fetch data");
        networkError.isNetworkError = true;
        networkError.originalError = error;
        networkError.details = {
          url: url,
          baseURL: this.instance.defaults.baseURL,
          timeout: this.instance.defaults.timeout,
        };
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
      if (error.response?.status === 404) {
        // Handle 404 gracefully for delete operations
        return {
          status: "success",
          message: "Resource not found or already deleted",
        };
      }
      throw error;
    }
  }

  // Retry utility for network operations
  async withRetry(operation, maxRetries = 2, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Only retry network errors
        if (error.isNetworkError && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    throw lastError;
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
