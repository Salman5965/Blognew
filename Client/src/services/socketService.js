import { io } from "socket.io-client";
import { LOCAL_STORAGE_KEYS } from "@/utils/constant";

class SocketService {
  constructor() {
    this.socket = null;
    this.connectionStatus = "disconnected";
    this.listeners = new Map();
  }

  connect(serverUrl = window.location.origin) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      console.warn("No auth token found, cannot connect to socket");
      return null;
    }

    try {
      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false,
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
      // Only log if it's not a typical deployment websocket error
      if (!error.message.includes("websocket error")) {
        console.error("Socket connection error:", error);
      }
      this.connectionStatus = "error";
      this.emit("connectionStatusChanged", "error");
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
