import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blogs.js";
import commentRoutes from "./routes/comments.js";
import userRoutes from "./routes/users.js";
import followRoutes from "./routes/follow.js";
import chatRoutes from "./routes/chat.js";
import likeRoutes from "./routes/likes.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import uploadRoutes from "./routes/uploads.js";
import notificationRoutes from "./routes/notifications.js";
import forumRoutes from "./routes/forum.js";
import dailyDripRoutes from "./routes/dailyDrip.js";
import storyRoutes from "./routes/stories.js";
import exploreRoutes from "./routes/explore.js";

// Import middleware
import errorHandler from "./middlewares/errorHandler.js";
import {
  publicRateLimiter,
  loginRateLimiter,
} from "./middlewares/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for accurate client IP detection
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Apply general rate limiting
app.use("/api/", publicRateLimiter);

// Special rate limiting for auth routes
app.use("/api/auth/login", loginRateLimiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

// API health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "success",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || "not connected",
    },
    environment: process.env.NODE_ENV || "development",
    features: [
      "authentication",
      "blogs",
      "comments",
      "users",
      "follow_system",
      "messaging",
      "likes",
      "bookmarks",
      "file_uploads",
      "notifications",
    ],
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/daily-drip", dailyDripRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/explore", exploreRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BlogHub API v2.0",
    version: "2.0.0",
    documentation: "/api/docs",
    features: [
      "User Authentication & Authorization",
      "Blog Management (CRUD)",
      "Comment System",
      "Social Follow System",
      "Real-time Messaging",
      "Like & Bookmark System",
      "File Upload Service",
      "Push Notifications",
      "Rate Limiting & Security",
    ],
    endpoints: {
      auth: "/api/auth",
      blogs: "/api/blogs",
      comments: "/api/comments",
      users: "/api/users",
      follow: "/api/follow",
      chat: "/api/chat",
      likes: "/api/likes",
      bookmarks: "/api/bookmarks",
      uploads: "/api/uploads",
      notifications: "/api/notifications",
    },
  });
});

// Handle 404 routes
app.all("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    suggestion: "Check the API documentation for available endpoints",
  });
});

// Global error handling middleware
app.use(errorHandler);

export default app;
