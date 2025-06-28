import { API_BASE_URL } from "@/utils/constant";

/**
 * Network connectivity and API health utilities
 */

export const checkNetworkConnectivity = () => {
  return navigator.onLine;
};

export const checkApiHealth = async (timeout = 5000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    let healthData = null;
    try {
      // Clone response to avoid "body stream already read" error
      const responseClone = response.clone();
      if (response.headers.get("content-type")?.includes("application/json")) {
        healthData = await responseClone.json();
      } else {
        healthData = await responseClone.text();
      }
    } catch (parseError) {
      // Ignore parsing errors for health checks
      healthData = "Health check response received";
    }

    return {
      isHealthy: response.ok,
      status: response.status,
      message: response.ok
        ? "API is healthy"
        : `API returned ${response.status}`,
      data: healthData,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        isHealthy: false,
        status: "timeout",
        message: "API health check timed out",
      };
    }

    return {
      isHealthy: false,
      status: "error",
      message: error.message || "API health check failed",
    };
  }
};

export const waitForNetworkRecovery = (callback, maxRetries = 5) => {
  let retries = 0;

  const checkAndRetry = () => {
    if (checkNetworkConnectivity() && retries < maxRetries) {
      checkApiHealth().then((health) => {
        if (health.isHealthy) {
          callback();
        } else {
          retries++;
          if (retries < maxRetries) {
            setTimeout(checkAndRetry, 2000 * retries); // Exponential backoff
          }
        }
      });
    }
  };

  // Start checking immediately
  checkAndRetry();

  // Also listen for online events
  const handleOnline = () => {
    setTimeout(checkAndRetry, 1000); // Wait a moment for connection to stabilize
  };

  window.addEventListener("online", handleOnline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
  };
};

export const createOfflineWarning = () => {
  if (!checkNetworkConnectivity()) {
    return {
      type: "warning",
      message:
        "You are currently offline. Some features may not work properly.",
    };
  }
  return null;
};

// Hook for network status monitoring
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(checkNetworkConnectivity());
  const [apiHealth, setApiHealth] = React.useState(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check API health periodically when online
    let healthCheckInterval;
    if (isOnline) {
      healthCheckInterval = setInterval(async () => {
        const health = await checkApiHealth();
        setApiHealth(health);
      }, 30000); // Check every 30 seconds
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [isOnline]);

  return { isOnline, apiHealth };
};
