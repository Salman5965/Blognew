import express from "express";
import { body, param, query } from "express-validator";
import {
  getChannels,
  getChannelById,
  createChannel,
  getChannelMessages,
  sendMessage,
  addReaction,
  removeReaction,
  getForumStats,
  deleteMessage,
} from "../controllers/forumController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateChannelId = [
  param("channelId").isMongoId().withMessage("Valid channel ID is required"),
];

const validateMessageId = [
  param("messageId").isMongoId().withMessage("Valid message ID is required"),
];

const validateCreateChannel = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Channel name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage(
      "Channel name can only contain letters, numbers, hyphens, and underscores",
    ),
  body("description")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Description must be between 1 and 200 characters"),
  body("category")
    .isIn(["general", "development", "help", "career", "offtopic"])
    .withMessage("Invalid category"),
  body("icon").optional().isString().withMessage("Icon must be a string"),
  body("isPrivate")
    .optional()
    .isBoolean()
    .withMessage("isPrivate must be a boolean"),
];

const validateSendMessage = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Message content must be between 1 and 5000 characters"),
  body("parentMessage")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent message ID"),
  body("replyTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid reply to user ID"),
];

const validateReaction = [
  body("emoji")
    .isString()
    .isLength({ min: 1, max: 10 })
    .withMessage("Emoji must be a valid string"),
];

// Apply authentication to all routes
router.use(protect);

// Get forum statistics
router.get(
  "/stats",
  rateLimiter("forumStats", 30, 60), // 30 requests per minute
  getForumStats,
);

// Get all channels
router.get(
  "/channels",
  rateLimiter("getChannels", 60, 60), // 60 requests per minute
  getChannels,
);

// Create new channel (moderator/admin only)
router.post(
  "/channels",
  authorize("moderator", "admin"),
  rateLimiter("createChannel", 5, 60), // 5 channel creations per minute
  validateCreateChannel,
  createChannel,
);

// Get specific channel
router.get(
  "/channels/:channelId",
  rateLimiter("getChannel", 60, 60),
  validateChannelId,
  getChannelById,
);

// Get messages in a channel
router.get(
  "/channels/:channelId/messages",
  rateLimiter("getMessages", 120, 60), // 120 requests per minute for messages
  validateChannelId,
  getChannelMessages,
);

// Send message to channel
router.post(
  "/channels/:channelId/messages",
  rateLimiter("sendMessage", 30, 60), // 30 messages per minute
  validateChannelId,
  validateSendMessage,
  sendMessage,
);

// Add reaction to message
router.post(
  "/messages/:messageId/reactions",
  rateLimiter("addReaction", 60, 60), // 60 reactions per minute
  validateMessageId,
  validateReaction,
  addReaction,
);

// Remove reaction from message
router.delete(
  "/messages/:messageId/reactions",
  rateLimiter("removeReaction", 60, 60),
  validateMessageId,
  validateReaction,
  removeReaction,
);

// Delete message
router.delete(
  "/messages/:messageId",
  rateLimiter("deleteMessage", 10, 60), // 10 deletions per minute
  validateMessageId,
  deleteMessage,
);

export default router;
