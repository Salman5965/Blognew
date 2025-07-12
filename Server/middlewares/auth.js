import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Token is valid but user no longer exists",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          status: "error",
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (tokenError) {
      if (tokenError.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          message: "Token has expired. Please login again.",
        });
      } else if (tokenError.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: "error",
          message: "Invalid token. Please login again.",
        });
      } else {
        return res.status(401).json({
          status: "error",
          message: "Token verification failed",
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error during authentication",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Optional authentication - does not block if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (tokenError) {
      // If token is invalid, continue without authentication
      // This allows the route to work for both authenticated and unauthenticated users
    }

    next();
  } catch (error) {
    // If there's a server error, continue without authentication
    next();
  }
};

// Check if user owns the resource or is admin
export const checkOwnership = (resourceModel, resourceParam = "id") => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params[resourceParam]);

      if (!resource) {
        return res.status(404).json({
          status: "error",
          message: "Resource not found",
        });
      }

      // Check if user owns the resource or is admin/moderator
      const isOwner = resource.author?.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";
      const isModerator = req.user.role === "moderator";

      if (!isOwner && !isAdmin && !isModerator) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. You can only access your own resources.",
        });
      }

      // Add resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting for authentication endpoints
export const authRateLimit = (req, res, next) => {
  // This is a placeholder for more sophisticated rate limiting
  // In production, you might want to use Redis for distributed rate limiting
  next();
};

// Verify email middleware (for features requiring email verification)
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      status: "error",
      message: "Email verification required to access this feature",
    });
  }
  next();
};
