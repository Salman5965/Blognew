import express from "express";
import { body, param } from "express-validator";
import {
  toggleBookmark,
  getUserBookmarks,
  getBookmarkCollections,
  getBookmarkStatus,
  updateBookmarkCollection,
  updateBookmarkNotes,
  deleteBookmark,
  getBlogsBookmarkStatus,
} from "../controllers/bookmarkController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateBlogId = [
  param("blogId").isMongoId().withMessage("Valid blog ID is required"),
];

const validateBookmarkId = [
  param("bookmarkId").isMongoId().withMessage("Valid bookmark ID is required"),
];

const validateToggleBookmark = [
  body("collection")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Collection name must be 1-50 characters"),
];

const validateUpdateCollection = [
  body("collection")
    .trim()
    .notEmpty()
    .withMessage("Collection name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Collection name must be 1-50 characters"),
];

const validateUpdateNotes = [
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

const validateBlogsArray = [
  body("blogIds")
    .isArray({ min: 1, max: 50 })
    .withMessage("Blog IDs array is required (max 50 items)"),
  body("blogIds.*").isMongoId().withMessage("Each blog ID must be valid"),
];

// Apply authentication to all routes
router.use(protect);

// Toggle bookmark/unbookmark a blog
router.post(
  "/:blogId/toggle",
  rateLimiter("bookmark", 60, 60), // 60 bookmark actions per minute
  validateBlogId,
  validateToggleBookmark,
  toggleBookmark,
);

// Get bookmark status for a blog
router.get("/:blogId/status", validateBlogId, getBookmarkStatus);

// Get bookmark status for multiple blogs
router.post("/status/batch", validateBlogsArray, getBlogsBookmarkStatus);

// Get user's bookmarks
router.get("/user/bookmarks", getUserBookmarks);

// Get user's bookmark collections
router.get("/user/collections", getBookmarkCollections);

// Update bookmark collection
router.patch(
  "/:bookmarkId/collection",
  validateBookmarkId,
  validateUpdateCollection,
  updateBookmarkCollection,
);

// Update bookmark notes
router.patch(
  "/:bookmarkId/notes",
  validateBookmarkId,
  validateUpdateNotes,
  updateBookmarkNotes,
);

// Delete bookmark
router.delete("/:bookmarkId", validateBookmarkId, deleteBookmark);

export default router;
