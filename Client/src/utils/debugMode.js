/**
 * Debug mode utilities for troubleshooting API and network issues
 */

import { debugApiConfig } from "./apiConfig";

export const isDebugMode = () => {
  return (
    import.meta.env.DEV ||
    localStorage.getItem("debug") === "true" ||
    window.location.search.includes("debug=true")
  );
};

export const enableDebugMode = () => {
  localStorage.setItem("debug", "true");
  console.log("Debug mode enabled");
};

export const disableDebugMode = () => {
  localStorage.removeItem("debug");
  console.log("Debug mode disabled");
};

export const logDebugInfo = (label, data) => {
  if (isDebugMode()) {
    console.group(`🐛 ${label}`);
    console.log(data);
    console.groupEnd();
  }
};

export const debugApiRequest = (url, method = "GET", data = null) => {
  if (isDebugMode()) {
    console.group(`🌐 API Request: ${method} ${url}`);
    console.log("Timestamp:", new Date().toISOString());
    console.log("URL:", url);
    console.log("Method:", method);
    if (data) console.log("Data:", data);
    console.log("Headers:", {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("authToken")
        ? "Bearer [TOKEN]"
        : "None",
    });
    console.groupEnd();
  }
};

export const debugApiResponse = (url, response, error = null) => {
  if (isDebugMode()) {
    const emoji = error ? "❌" : "✅";
    console.group(`${emoji} API Response: ${url}`);
    console.log("Timestamp:", new Date().toISOString());
    if (error) {
      console.error("Error:", error);
      console.log("Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        isNetworkError: error.isNetworkError,
      });
    } else {
      console.log("Response:", response);
      console.log("Status: Success");
    }
    console.groupEnd();
  }
};

export const showDebugPanel = () => {
  if (isDebugMode()) {
    const panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    `;

    const info = {
      "Debug Mode": "ON",
      Environment: import.meta.env.MODE,
      "API Base URL": import.meta.env.VITE_API_BASE_URL || "auto-detected",
      Network: navigator.onLine ? "Online" : "Offline",
      "User Agent": navigator.userAgent.substring(0, 50) + "...",
    };

    panel.innerHTML = Object.entries(info)
      .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
      .join("");

    // Remove existing panel
    const existing = document.getElementById("debug-panel");
    if (existing) existing.remove();

    document.body.appendChild(panel);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (panel.parentNode) {
        panel.remove();
      }
    }, 5000);
  }
};

// Auto-run API config debug if debug mode is enabled
if (isDebugMode()) {
  console.log("🐛 Debug mode is enabled");
  console.log(
    "Add ?debug=true to URL or run enableDebugMode() to enable debug logging",
  );

  // Show debug panel on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showDebugPanel);
  } else {
    showDebugPanel();
  }

  // Run API config debug
  setTimeout(() => {
    debugApiConfig();
  }, 1000);
}

// Make debug functions available globally in development
if (import.meta.env.DEV) {
  window.debugMode = {
    enable: enableDebugMode,
    disable: disableDebugMode,
    isEnabled: isDebugMode,
    showPanel: showDebugPanel,
    logInfo: logDebugInfo,
  };
}
