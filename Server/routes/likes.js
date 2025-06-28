import express from "express";
import { body, param } from "express-validator";
import {
  toggleLike,
  getBlogLikes,
  getUserLikes,
  getLikeStatus,
  getBlogsLikeStatus,
} from "../controllers/likeController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateBlogId = [
  param("blogId").isMongoId().withMessage("Valid blog ID is required"),
];

const validateToggleLike = [
  body("type")
    .optional()
    .isIn(["like", "love", "laugh", "angry", "sad"])
    .withMessage("Invalid like type"),
];

const validateBlogsArray = [
  body("blogIds")
    .isArray({ min: 1, max: 50 })
    .withMessage("Blog IDs array is required (max 50 items)"),
  body("blogIds.*").isMongoId().withMessage("Each blog ID must be valid"),
];

// Apply authentication to all routes
router.use(protect);

// Toggle like/unlike a blog
router.post(
  "/:blogId/toggle",
  rateLimiter("like", 30, 60), // 30 like actions per minute
  validateBlogId,
  validateToggleLike,
  toggleLike,
);

// Get blog's likes
router.get("/:blogId/likes", validateBlogId, getBlogLikes);

// Get like status for a blog
router.get("/:blogId/status", validateBlogId, getLikeStatus);

// Get like status for multiple blogs
router.post("/status/batch", validateBlogsArray, getBlogsLikeStatus);

// Get user's liked blogs
router.get("/user/likes", getUserLikes);

export default router;
