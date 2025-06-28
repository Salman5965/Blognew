import express from "express";
import { body, param } from "express-validator";
import {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getFollowStats,
  getFollowSuggestions,
  getMutualFollows,
} from "../controllers/followController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateUserId = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),
];

// Apply authentication to all routes
router.use(protect);

// Toggle follow/unfollow
router.post(
  "/:userId/toggle",
  rateLimiter("follow", 10, 60), // 10 follow actions per minute
  validateUserId,
  toggleFollow,
);

// Get follow status
router.get(
  "/:userId/status",
  rateLimiter("followStatus", 30, 60), // 30 status checks per minute
  validateUserId,
  getFollowStatus,
);

// Get user's followers
router.get("/:userId/followers", validateUserId, getFollowers);

// Get user's following
router.get("/:userId/following", validateUserId, getFollowing);

// Get follow statistics
router.get("/:userId/stats", validateUserId, getFollowStats);

// Get mutual follows
router.get("/:userId/mutual", validateUserId, getMutualFollows);

// Get follow suggestions
router.get(
  "/suggestions",
  rateLimiter("suggestions", 20, 300), // 20 requests per 5 minutes
  getFollowSuggestions,
);

export default router;
