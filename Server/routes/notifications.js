import express from "express";
import { body, param, query } from "express-validator";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  createNotification,
  broadcastNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateNotificationId = [
  param("notificationId")
    .isMongoId()
    .withMessage("Valid notification ID is required"),
];

const validateNotificationSettings = [
  body("emailNotifications")
    .optional()
    .isBoolean()
    .withMessage("Email notifications must be boolean"),
  body("pushNotifications")
    .optional()
    .isBoolean()
    .withMessage("Push notifications must be boolean"),
  body("marketingEmails")
    .optional()
    .isBoolean()
    .withMessage("Marketing emails must be boolean"),
];

const validateCreateNotification = [
  body("recipientId").isMongoId().withMessage("Valid recipient ID is required"),
  body("type")
    .isIn([
      "follow",
      "like",
      "comment",
      "blog_published",
      "message",
      "mention",
      "system",
    ])
    .withMessage("Invalid notification type"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
  body("entityType")
    .isIn(["Blog", "Comment", "User", "Message", "Conversation"])
    .withMessage("Invalid entity type"),
  body("entityId").isMongoId().withMessage("Valid entity ID is required"),
  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"])
    .withMessage("Invalid priority level"),
];

const validateBroadcastNotification = [
  body("recipientIds")
    .isArray({ min: 1, max: 1000 })
    .withMessage("Recipient IDs array is required (max 1000 recipients)"),
  body("recipientIds.*")
    .isMongoId()
    .withMessage("Each recipient ID must be valid"),
  body("type")
    .isIn(["system", "blog_published", "mention"])
    .withMessage("Invalid broadcast notification type"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"])
    .withMessage("Invalid priority level"),
];

// Apply authentication to all routes
router.use(protect);

// Get user notifications
router.get(
  "/",
  rateLimiter("notifications", 60, 60), // 60 requests per minute
  getNotifications,
);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", validateNotificationId, markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Archive notification
router.patch(
  "/:notificationId/archive",
  validateNotificationId,
  archiveNotification,
);

// Delete notification
router.delete("/:notificationId", validateNotificationId, deleteNotification);

// Get notification settings
router.get("/settings", getNotificationSettings);

// Update notification settings
router.patch(
  "/settings",
  validateNotificationSettings,
  updateNotificationSettings,
);

// Create manual notification (admin only)
router.post(
  "/create",
  rateLimiter("createNotification", 10, 60), // 10 notifications per minute
  validateCreateNotification,
  createNotification,
);

// Broadcast notification (admin only)
router.post(
  "/broadcast",
  rateLimiter("broadcastNotification", 5, 300), // 5 broadcasts per 5 minutes
  validateBroadcastNotification,
  broadcastNotification,
);

export default router;
