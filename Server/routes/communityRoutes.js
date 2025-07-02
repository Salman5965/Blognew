import express from "express";
import { body } from "express-validator";
import {
  getPosts,
  searchPosts,
  createPost,
  getPost,
  getReplies,
  createReply,
  toggleReaction,
  getCategories,
  getStats,
  deletePost,
  deleteReply,
} from "../controllers/communityController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Get categories
router.get("/categories", getCategories);

// Get community statistics
router.get("/stats", getStats);

// Search posts
router.get("/search", searchPosts);

// Get posts
router.get("/posts", getPosts);

// Create new post
router.post(
  "/posts",
  rateLimiter(5, 15), // 5 posts per 15 minutes
  [
    body("title")
      .optional()
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be between 5 and 200 characters"),
    body("content")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Content must be between 10 and 5000 characters"),
    body("category")
      .isIn(["general", "development", "help", "career", "offtopic"])
      .withMessage("Invalid category"),
    body("tags")
      .optional()
      .isArray({ max: 5 })
      .withMessage("Maximum 5 tags allowed"),
  ],
  createPost,
);

// Get single post
router.get("/posts/:id", getPost);

// Delete post
router.delete("/posts/:id", deletePost);

// Get replies for a post
router.get("/posts/:id/replies", getReplies);

// Create reply to post
router.post(
  "/posts/:id/replies",
  rateLimiter(10, 15), // 10 replies per 15 minutes
  [
    body("content")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Reply content must be between 1 and 1000 characters"),
  ],
  createReply,
);

// Toggle reaction on post
router.post(
  "/posts/:id/reactions",
  rateLimiter(30, 5), // 30 reactions per 5 minutes
  [
    body("emoji")
      .isIn(["👍", "👎", "❤️", "😂", "😮", "😢", "😡"])
      .withMessage("Invalid emoji reaction"),
  ],
  toggleReaction,
);

// Toggle reaction on reply
router.post(
  "/replies/:id/reactions",
  rateLimiter(30, 5), // 30 reactions per 5 minutes
  [
    body("emoji")
      .isIn(["👍", "👎", "❤️", "😂", "😮", "😢", "😡"])
      .withMessage("Invalid emoji reaction"),
  ],
  toggleReaction,
);

// Delete reply
router.delete("/replies/:id", deleteReply);

// Update reply
router.put(
  "/replies/:id",
  [
    body("content")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Reply content must be between 1 and 1000 characters"),
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const ForumMessage = (await import("../models/ForumMessage.js")).default;

      const reply = await ForumMessage.findById(id);
      if (!reply) {
        return res.status(404).json({
          status: "error",
          message: "Reply not found",
        });
      }

      // Check if user owns the reply
      if (reply.author.toString() !== req.user.id) {
        return res.status(403).json({
          status: "error",
          message: "Not authorized to edit this reply",
        });
      }

      reply.content = content;
      reply.isEdited = true;
      reply.editedAt = new Date();
      await reply.save();

      await reply.populate("author", "username firstName lastName avatar role");
      await reply.populate("replyTo", "username firstName lastName");

      const transformedReply = {
        _id: reply._id,
        content: reply.content,
        author: reply.author,
        replyTo: reply.replyTo,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        isEdited: reply.isEdited,
        editedAt: reply.editedAt,
        reactions: reply.reactions || [],
        replyCount: reply.replyCount || 0,
      };

      res.status(200).json({
        status: "success",
        data: {
          reply: transformedReply,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
