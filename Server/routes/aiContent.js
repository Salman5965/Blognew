import express from "express";
import { body, param } from "express-validator";
import {
  getAIContentStats,
  getAIContent,
  getAIContentById,
  generateContent,
  publishContent,
  scheduleContent,
  updateContent,
  deleteContent,
  triggerDailyGeneration,
  getReadyContent,
} from "../controllers/aiContentController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateContentGeneration = [
  body("categories")
    .isArray()
    .withMessage("Categories must be an array")
    .notEmpty()
    .withMessage("Categories array cannot be empty"),
  body("categories.*")
    .isIn(["news", "technology", "space", "ocean", "nature", "travel"])
    .withMessage("Invalid category"),
  body("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Limit must be between 1 and 20"),
];

const validateContentPublishing = [
  body("contentIds")
    .isArray()
    .withMessage("Content IDs must be an array")
    .notEmpty()
    .withMessage("Content IDs array cannot be empty"),
  body("contentIds.*")
    .isMongoId()
    .withMessage("Each content ID must be a valid MongoDB ObjectId"),
];

const validateContentScheduling = [
  param("contentId").isMongoId().withMessage("Valid content ID is required"),
  body("publishDateTime")
    .isISO8601()
    .withMessage("Valid publish date time is required")
    .custom((value) => {
      const publishDate = new Date(value);
      if (publishDate <= new Date()) {
        throw new Error("Publish date must be in the future");
      }
      return true;
    }),
];

const validateContentUpdate = [
  param("contentId").isMongoId().withMessage("Valid content ID is required"),
  body("status")
    .optional()
    .isIn(["pending", "generated", "published", "failed", "rejected"])
    .withMessage("Invalid status"),
  body("reviewNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Review notes cannot exceed 1000 characters"),
  body("generatedTitle")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("generatedContent")
    .optional()
    .trim()
    .isLength({ min: 100 })
    .withMessage("Content must be at least 100 characters"),
  body("generatedExcerpt")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),
  body("generatedTags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("generatedTags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),
];

const validateMongoId = [
  param("contentId").isMongoId().withMessage("Valid content ID is required"),
];

// Public routes (for stats and read-only access)
router.get("/stats", getAIContentStats);
router.get("/ready", getReadyContent);

// Protected routes (admin only)
router.use(protect);

// Get AI content with filters and pagination
router.get("/", getAIContent);

// Get specific AI content by ID
router.get("/:contentId", validateMongoId, getAIContentById);

// Generate new content
router.post(
  "/generate",
  rateLimiter("generateAIContent", 10, 3600), // 10 generations per hour
  validateContentGeneration,
  generateContent,
);

// Publish content
router.post(
  "/publish",
  rateLimiter("publishAIContent", 20, 3600), // 20 publishes per hour
  validateContentPublishing,
  publishContent,
);

// Schedule content for future publishing
router.post(
  "/:contentId/schedule",
  rateLimiter("scheduleAIContent", 30, 3600), // 30 schedules per hour
  validateContentScheduling,
  scheduleContent,
);

// Update content (edit or review)
router.put(
  "/:contentId",
  rateLimiter("updateAIContent", 50, 3600), // 50 updates per hour
  validateContentUpdate,
  updateContent,
);

// Delete content
router.delete(
  "/:contentId",
  rateLimiter("deleteAIContent", 20, 3600), // 20 deletions per hour
  validateMongoId,
  deleteContent,
);

// Trigger daily content generation manually
router.post(
  "/trigger/daily",
  rateLimiter("triggerDailyGeneration", 3, 3600), // 3 triggers per hour
  triggerDailyGeneration,
);

export default router;
