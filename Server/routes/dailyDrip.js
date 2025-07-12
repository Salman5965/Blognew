import express from "express";
import { body, param } from "express-validator";
import {
  getDailyDripPosts,
  createDailyDripPost,
  updateDailyDripPost,
  deleteDailyDripPost,
  getDailyDripStats,
} from "../controllers/dailyDripController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateDailyDripPost = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),
];

const validatePostId = [
  param("postId").isMongoId().withMessage("Valid post ID is required"),
];

// Public routes
router.get("/", getDailyDripPosts);
router.get("/stats", getDailyDripStats);

// Protected routes (admin only)
router.use(protect);

// Create daily drip post (admin only)
router.post(
  "/",
  rateLimiter("createDailyDrip", 5, 3600), // 5 posts per hour
  validateDailyDripPost,
  createDailyDripPost,
);

// Update daily drip post (admin only)
router.put(
  "/:postId",
  rateLimiter("updateDailyDrip", 10, 3600), // 10 updates per hour
  validatePostId,
  validateDailyDripPost,
  updateDailyDripPost,
);

// Delete daily drip post (admin only)
router.delete(
  "/:postId",
  rateLimiter("deleteDailyDrip", 5, 3600), // 5 deletions per hour
  validatePostId,
  deleteDailyDripPost,
);

export default router;
