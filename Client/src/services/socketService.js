import { io } from "socket.io-client";
import { LOCAL_STORAGE_KEYS } from "@/utils/constant";

class SocketService {
  constructor() {
    this.socket = null;
    this.connectionStatus = "disconnected";
    this.listeners = new Map();
  }

  connect(serverUrl) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      console.warn("No auth token found, will work without real-time features");
      this.connectionStatus = "no-auth";
      this.emit("connectionStatusChanged", "no-auth");
      return null;
    }

    // Default to backend server URL if not provided
    if (!serverUrl) {
      // Check if we're in local development (localhost)
      const isLocalDev =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocalDev) {
        // In local development, connect to backend server on port 3001
        serverUrl = "http://localhost:3001";
      } else {
        // In deployed environment, disable Socket.IO to avoid parser errors
        // The app will use polling fallback instead
        console.warn(
          "⚠️ Socket.IO disabled in deployed environment, using polling fallback",
        );
        this.connectionStatus = "disabled";
        this.emit("connectionStatusChanged", "disabled");
        return null;
      }
    }

    return this.attemptConnection(serverUrl, token);
  }

  async attemptConnection(serverUrl, token) {
    try {
      console.log(`🔌 Attempting Socket.IO connection:`);
      console.log(`  - Server URL: ${serverUrl}`);
      console.log(`  - Current hostname: ${window.location.hostname}`);
      console.log(`  - Current origin: ${window.location.origin}`);
      console.log(
        `  - Is local dev: ${window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"}`,
      );
      console.log(`  - Has token: ${!!token}`);

      // Test if Socket.IO endpoint is reachable (non-blocking)
      const testUrl = `${serverUrl}/socket.io/?transport=polling`;
      console.log(`🧪 Testing Socket.IO endpoint: ${testUrl}`);

      fetch(testUrl, {
        method: "GET",
        mode: "cors",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
        .then((response) => {
          console.log(
            `✅ Socket.IO endpoint test - Status: ${response.status}`,
          );
        })
        .catch((testError) => {
          console.error(
            `❌ Socket.IO endpoint test failed:`,
            testError.message,
          );
        });

      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ["polling", "websocket"], // Try polling first, then upgrade to websocket
        upgrade: true,
        rememberUpgrade: false, // Don't remember upgrade in case of issues
        timeout: 15000, // Increase timeout slightly
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      this.setupEventHandlers();
      return this.socket;
    } catch (error) {
      console.error("Failed to connect to socket:", error);
      return null;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.connectionStatus = "connected";
      this.emit("connectionStatusChanged", "connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.connectionStatus = "disconnected";
      this.emit("connectionStatusChanged", "disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:");
      console.error("Error object:", error);
      console.error("Error message:", error?.message || "No message");
      console.error("Error type:", error?.type || "No type");
      console.error(
        "Error description:",
        error?.description || "No description",
      );
      console.error("Server URL:", this.socket?.io?.uri || "Unknown URL");
      console.error("Error stack:", error?.stack || "No stack");

      // Try to stringify the entire error object
      try {
        console.error(
          "Full error JSON:",
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        );
      } catch (e) {
        console.error("Could not stringify error object");
      }

      // If it's an authentication error, we should still allow the app to function
      // without real-time features
      if (
        error?.message?.includes("token") ||
        error?.message?.includes("Authentication")
      ) {
        console.warn(
          "⚠️ Socket.IO authentication failed - running without real-time features",
        );
        this.connectionStatus = "no-auth";
      } else {
        this.connectionStatus = "error";
      }

      this.emit("connectionStatusChanged", this.connectionStatus);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      this.connectionStatus = "connected";
      this.emit("connectionStatusChanged", "connected");
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection failed:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = "disconnected";
      this.emit("connectionStatusChanged", "disconnected");
    }
  }

  // Join a forum channel
  joinChannel(channelId) {
    if (this.socket?.connected) {
      this.socket.emit("join_channel", channelId);
      console.log("📥 Joined channel:", channelId);
    }
  }

  // Leave a forum channel
  leaveChannel(channelId) {
    if (this.socket?.connected) {
      this.socket.emit("leave_channel", channelId);
      console.log("📤 Left channel:", channelId);
    }
  }

  // Send a message to a channel
  sendMessage(channelId, message) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", {
        channelId,
        content: message.content,
        type: message.type || "text",
      });
    }
  }

  // Start typing indicator
  startTyping(channelId) {
    if (this.socket?.connected) {
      this.socket.emit("typing_start", channelId);
    }
  }

  // Stop typing indicator
  stopTyping(channelId) {
    if (this.socket?.connected) {
      this.socket.emit("typing_stop", channelId);
    }
  }

  // Add reaction to message
  addReaction(messageId, emoji) {
    if (this.socket?.connected) {
      this.socket.emit("add_reaction", { messageId, emoji });
    }
  }

  // Event listener methods
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Store listeners for custom events
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }

    // Remove from custom listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }

    // Emit to custom listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in socket event listener:", error);
        }
      });
    }
  }

  // Getters
  get connected() {
    return this.socket?.connected || false;
  }

  get status() {
    return this.connectionStatus;
  }

  get id() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
