import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";
import User from "./models/User.js";
import Conversation from "./models/Conversation.js";

// Load environment variables
dotenv.config();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    console.log("🔐 Socket.IO authentication attempt");

    const token = socket.handshake.auth.token;
    console.log("Token present:", !!token);

    if (!token) {
      console.error("❌ No token provided");
      return next(new Error("No token provided"));
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not configured");
      return next(new Error("Server configuration error"));
    }

    // Verify JWT token
    const jwt = await import("jsonwebtoken");

    let decoded;
    try {
      decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified for user ID:", decoded.id);
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError.message);
      return next(new Error("Invalid token"));
    }

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.error("❌ User not found:", decoded.id);
      return next(new Error("User not found"));
    }

    if (!user.isActive) {
      console.error("❌ User account is inactive:", decoded.id);
      return next(new Error("Account is inactive"));
    }

    socket.userId = user._id.toString();
    socket.user = user;

    // Update user online status
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date(),
    });

    console.log("✅ Socket.IO authentication successful for:", user.username);
    next();
  } catch (error) {
    console.error("❌ Socket.IO authentication error:", error.message);
    return next(new Error("Authentication failed"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User ${socket.user.username} connected (${socket.userId})`);

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Broadcast online status to all connected users
  io.emit("user_status_changed", {
    userId: socket.userId,
    status: "online",
    lastSeen: new Date(),
  });

  // Join user to their conversation rooms
  socket.on("join_conversations", async () => {
    try {
      const conversations = await Conversation.find({
        participants: socket.userId,
        isActive: true,
      }).select("_id");

      conversations.forEach((conv) => {
        socket.join(`conversation:${conv._id}`);
      });

      console.log(
        `User ${socket.user.username} joined ${conversations.length} conversation rooms`,
      );
    } catch (error) {
      console.error("Error joining conversations:", error);
    }
  });

  // Handle joining a specific conversation
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(
      `User ${socket.user.username} joined conversation ${conversationId}`,
    );
  });

  // Handle leaving a conversation
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(
      `User ${socket.user.username} left conversation ${conversationId}`,
    );
  });

  // Handle typing indicators
  socket.on("typing_start", (conversationId) => {
    socket.to(`conversation:${conversationId}`).emit("user_typing", {
      userId: socket.userId,
      username: socket.user.username,
      conversationId,
    });
  });

  socket.on("typing_stop", (conversationId) => {
    socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
      userId: socket.userId,
      conversationId,
    });
  });

  // Handle message read receipts
  socket.on("message_read", (data) => {
    const { conversationId, messageId } = data;
    socket.to(`conversation:${conversationId}`).emit("message_read_receipt", {
      messageId,
      readBy: socket.userId,
      readAt: new Date(),
    });
  });

  // Handle user status updates
  socket.on("status_update", async (status) => {
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: status === "online",
        lastSeen: new Date(),
      });

      // Broadcast status to all connected users
      io.emit("user_status_changed", {
        userId: socket.userId,
        status,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  });

  // Handle online status query
  socket.on("get_online_status", async (userIds) => {
    try {
      const onlineUsers = await User.find({
        _id: { $in: userIds },
        isOnline: true,
      }).select("_id");

      const onlineUserIds = onlineUsers.map((user) => user._id.toString());
      socket.emit("online_status_response", onlineUserIds);
    } catch (error) {
      console.error("Error getting online status:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", async (reason) => {
    console.log(`User ${socket.user.username} disconnected: ${reason}`);

    try {
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Broadcast offline status to all connected users
      io.emit("user_status_changed", {
        userId: socket.userId,
        status: "offline",
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error("Error updating user offline status:", error);
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for user ${socket.user.username}:`, error);
  });
});

// Make io available to route handlers
app.set("io", io);

// Middleware to make io available in req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to database
const connectToDatabase = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectToDatabase();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`💬 WebSocket Server: ws://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");

  // Close Socket.IO server
  io.close(() => {
    console.log("Socket.IO server closed");
  });

  // Close HTTP server
  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");

  // Update all online users to offline
  try {
    await User.updateMany(
      { isOnline: true },
      {
        isOnline: false,
        lastSeen: new Date(),
      },
    );
    console.log("Updated all users to offline status");
  } catch (error) {
    console.error("Error updating users offline status:", error);
  }

  // Close Socket.IO server
  io.close(() => {
    console.log("Socket.IO server closed");
  });

  // Close HTTP server
  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default httpServer;
