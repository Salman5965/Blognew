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
//     // For deployed environments, use relative path for proxy or same-origin backend
//     return "/api";
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

//   // Test API connectivity with proper error handling
//   try {
//     fetch(getApiUrl("/health"))
//       .then((response) => {
//         console.log("API Health Check:", response.status, response.statusText);

//         // Handle rate limiting gracefully
//         if (response.status === 429) {
//           console.warn("API Health Check: Rate limited, skipping body parsing");
//           return { status: response.status, message: "Rate limited" };
//         }

//         // Clone response before reading body to avoid "body stream already read" error
//         if (
//           response.ok &&
//           response.headers.get("content-type")?.includes("application/json")
//         ) {
//           return response.clone().json();
//         } else {
//           return response
//             .clone()
//             .text()
//             .then((text) => ({
//               message: text || "OK",
//               status: response.status,
//             }));
//         }
//       })
//       .then((data) => {
//         console.log("API Health Data:", data);
//       })
//       .catch((error) => {
//         console.warn("API Health Check Failed:", error.message || error);
//       });
//   } catch (error) {
//     console.warn(
//       "API Health Check initialization failed:",
//       error.message || error,
//     );
//   }
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
    // For deployed environments, use relative path for proxy or same-origin backend
    return "/api";
  }

  // Fallback - use relative path with proxy
  return "/api";
};

// export const API_BASE_URL = getApiBaseUrl();
export const API_BASE_URL = "/api";

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
  try {
    // Use a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(getApiUrl("/health"), {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        clearTimeout(timeoutId);
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
            .then((text) => ({
              message: text || "OK",
              status: response.status,
            }));
        }
      })
      .then((data) => {
        console.log("API Health Data:", data);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn("API Health Check: Request timeout");
        } else {
          console.warn("API Health Check Failed:", error.message || error);
        }
      });
  } catch (error) {
    console.warn(
      "API Health Check initialization failed:",
      error.message || error,
    );
  }
};

export default {
  API_BASE_URL,
  getApiUrl,
  debugApiConfig,
};
