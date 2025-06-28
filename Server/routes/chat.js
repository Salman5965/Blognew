import express from "express";
import { body, param } from "express-validator";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage,
  editMessage,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateConversationId = [
  param("conversationId")
    .isMongoId()
    .withMessage("Valid conversation ID is required"),
];

const validateMessageId = [
  param("messageId").isMongoId().withMessage("Valid message ID is required"),
];

const validateCreateConversation = [
  body("participantId")
    .isMongoId()
    .withMessage("Valid participant ID is required"),
];

const validateSendMessage = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 2000 })
    .withMessage("Message content cannot exceed 2000 characters"),
  body("type")
    .optional()
    .isIn(["text", "image", "file"])
    .withMessage("Invalid message type"),
];

const validateEditMessage = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 2000 })
    .withMessage("Message content cannot exceed 2000 characters"),
];

// Apply authentication to all routes
router.use(protect);

// Get user's conversations
router.get(
  "/conversations",
  rateLimiter("chat", 60, 60), // 60 requests per minute
  getConversations,
);

// Create or get conversation
router.post(
  "/conversations",
  rateLimiter("createConversation", 10, 60), // 10 new conversations per minute
  validateCreateConversation,
  createConversation,
);

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  validateConversationId,
  getMessages,
);

// Send a message
router.post(
  "/conversations/:conversationId/messages",
  rateLimiter("sendMessage", 30, 60), // 30 messages per minute
  validateConversationId,
  validateSendMessage,
  sendMessage,
);

// Mark conversation as read
router.patch(
  "/conversations/:conversationId/read",
  validateConversationId,
  markAsRead,
);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Edit a message
router.patch(
  "/messages/:messageId",
  validateMessageId,
  validateEditMessage,
  editMessage,
);

// Delete a message
router.delete("/messages/:messageId", validateMessageId, deleteMessage);

export default router;
