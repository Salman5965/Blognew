/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(message, type = "generic", details = {}) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorTypes = {
  NETWORK: "network",
  API: "api",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  NOT_FOUND: "not_found",
  RATE_LIMIT: "rate_limit",
  GENERIC: "generic",
};

export const handleApiError = (error, context = {}) => {
  // Network errors
  if (
    error.isNetworkError ||
    error.code === "NETWORK_ERROR" ||
    !error.response
  ) {
    return new AppError(
      "Unable to connect to the server. Please check your internet connection and try again.",
      ErrorTypes.NETWORK,
      { originalError: error, context },
    );
  }

  // Rate limiting
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers["retry-after"];
    const message = retryAfter
      ? `Too many requests. Please try again in ${retryAfter} seconds.`
      : "Too many requests. Please wait before trying again.";
    return new AppError(message, ErrorTypes.RATE_LIMIT, {
      retryAfter,
      context,
    });
  }

  // Authentication errors
  if (error.response?.status === 401) {
    return new AppError(
      "Authentication required. Please log in and try again.",
      ErrorTypes.AUTHENTICATION,
      { context },
    );
  }

  // Authorization errors
  if (error.response?.status === 403) {
    return new AppError(
      "Access denied. You do not have permission to perform this action.",
      ErrorTypes.AUTHORIZATION,
      { context },
    );
  }

  // Not found errors
  if (error.response?.status === 404) {
    return new AppError(
      error.response?.data?.message || "The requested resource was not found.",
      ErrorTypes.NOT_FOUND,
      { context },
    );
  }

  // Server errors
  if (error.response?.status >= 500) {
    return new AppError(
      "Server error. Please try again later.",
      ErrorTypes.API,
      {
        status: error.response.status,
        statusText: error.response.statusText,
        context,
      },
    );
  }

  // API errors with custom messages
  if (error.response?.data?.message) {
    return new AppError(error.response.data.message, ErrorTypes.API, {
      status: error.response.status,
      context,
    });
  }

  // Generic error fallback
  return new AppError(
    error.message || "An unexpected error occurred.",
    ErrorTypes.GENERIC,
    { originalError: error, context },
  );
};

export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    type: error.type || "unknown",
    timestamp: error.timestamp || new Date().toISOString(),
    context,
    stack: error.stack,
    details: error.details || {},
  };

  console.error("Application Error:", errorInfo);

  // In production, you might want to send this to an error tracking service
  if (import.meta.env.PROD) {
    // Example: Send to error tracking service
    // errorTrackingService.captureError(errorInfo);
  }

  return errorInfo;
};

export const createRetryHandler = (maxRetries = 3, delay = 1000) => {
  return async (fn) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain error types
        if (
          error.type === ErrorTypes.AUTHENTICATION ||
          error.type === ErrorTypes.AUTHORIZATION ||
          error.type === ErrorTypes.NOT_FOUND
        ) {
          throw error;
        }

        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  };
};
