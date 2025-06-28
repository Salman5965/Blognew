// // Environment-aware API configuration
// const getApiBaseUrl = () => {
//   // Check if we have an explicit environment variable
//   if (import.meta.env.VITE_API_BASE_URL) {
//     return import.meta.env.VITE_API_BASE_URL;
//   }

//   // Detect if running in development or production
//   const isDevelopment = import.meta.env.DEV;
//   const isProduction = import.meta.env.PROD;

//   // Check current URL to determine environment
//   const currentUrl = window.location.href;

//   // If running on localhost or local development
//   if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
//     return "/api"; // Use proxy in development
//   }

//   // If running on a deployed environment (Fly.dev, Vercel, etc.)
//   if (
//     currentUrl.includes(".fly.dev") ||
//     currentUrl.includes(".vercel.app") ||
//     currentUrl.includes(".netlify.app")
//   ) {
//     // For deployed environments, try to detect backend URL
//     const baseUrl = window.location.origin;
//     return `${baseUrl}/api`;
//   }

//   // Fallback - use relative path with proxy
//   return "/api";
// };

// export const API_BASE_URL = getApiBaseUrl();

// // Export function for dynamic detection if needed
// export const getApiUrl = (endpoint = "") => {
//   const baseUrl = API_BASE_URL;
//   return endpoint.startsWith("/")
//     ? `${baseUrl}${endpoint}`
//     : `${baseUrl}/${endpoint}`;
// };

// // Debug function to help troubleshoot API configuration
// export const debugApiConfig = () => {
//   console.log("API Configuration Debug:");
//   console.log("Current URL:", window.location.href);
//   console.log("Environment Mode:", import.meta.env.MODE);
//   console.log("Is Development:", import.meta.env.DEV);
//   console.log("Is Production:", import.meta.env.PROD);
//   console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
//   console.log("Computed API_BASE_URL:", API_BASE_URL);

//   // Test API connectivity
//   fetch(getApiUrl("/health"))
//     .then((response) => {
//       console.log("API Health Check:", response.status, response.statusText);
//       return response.json();
//     })
//     .then((data) => {
//       console.log("API Health Data:", data);
//     })
//     .catch((error) => {
//       console.error("API Health Check Failed:", error);
//     });
// };

// export default {
//   API_BASE_URL,
//   getApiUrl,
//   debugApiConfig,
// };

// Environment-aware API configuration
const getApiBaseUrl = () => {
  // Check if we have an explicit environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Detect if running in development or production
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Check current URL to determine environment
  const currentUrl = window.location.href;

  // If running on localhost or local development
  if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
    return "/api"; // Use proxy in development
  }

  // If running on a deployed environment (Fly.dev, Vercel, etc.)
  if (
    currentUrl.includes(".fly.dev") ||
    currentUrl.includes(".vercel.app") ||
    currentUrl.includes(".netlify.app")
  ) {
    // For deployed environments, try to detect backend URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/api`;
  }

  // Fallback - use relative path with proxy
  return "/api";
};

export const API_BASE_URL = getApiBaseUrl();

// Export function for dynamic detection if needed
export const getApiUrl = (endpoint = "") => {
  const baseUrl = API_BASE_URL;
  return endpoint.startsWith("/")
    ? `${baseUrl}${endpoint}`
    : `${baseUrl}/${endpoint}`;
};

// Debug function to help troubleshoot API configuration
export const debugApiConfig = () => {
  console.log("API Configuration Debug:");
  console.log("Current URL:", window.location.href);
  console.log("Environment Mode:", import.meta.env.MODE);
  console.log("Is Development:", import.meta.env.DEV);
  console.log("Is Production:", import.meta.env.PROD);
  console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
  console.log("Computed API_BASE_URL:", API_BASE_URL);

  // Test API connectivity with proper error handling
  fetch(getApiUrl("/health"))
    .then((response) => {
      console.log("API Health Check:", response.status, response.statusText);

      // Handle rate limiting gracefully
      if (response.status === 429) {
        console.warn("API Health Check: Rate limited, skipping body parsing");
        return { status: response.status, message: "Rate limited" };
      }

      // Clone response before reading body to avoid "body stream already read" error
      if (
        response.ok &&
        response.headers.get("content-type")?.includes("application/json")
      ) {
        return response.clone().json();
      } else {
        return response
          .clone()
          .text()
          .then((text) => ({ message: text || "OK", status: response.status }));
      }
    })
    .then((data) => {
      console.log("API Health Data:", data);
    })
    .catch((error) => {
      console.warn("API Health Check Failed:", error.message || error);
    });
};

export default {
  API_BASE_URL,
  getApiUrl,
  debugApiConfig,
};
