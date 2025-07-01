import express from "express";
import { body, param, query } from "express-validator";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getUserStats,
  updateUserRole,
  getFollowers,
  getFollowing,
  getTopAuthors,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validateUserUpdate } from "../validators/userValidator.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import User from "../models/User.js";

const router = express.Router();

// Validation middleware
const validateUserId = [
  param("id").isMongoId().withMessage("Valid user ID is required"),
];

const validateUserSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be 1-100 characters"),
];

// Search users
router.get(
  "/search",
  protect,
  rateLimiter("userSearch", 30, 60), // 30 searches per minute
  validateUserSearch,
  async (req, res) => {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;
      const currentUserId = req.user.id;

      if (!query || query.trim() === "") {
        return res.status(400).json({
          status: "error",
          message: "Search query is required",
        });
      }

      // Simplified search query to avoid MongoDB planning issues
      const searchCriteria = {
        _id: { $ne: currentUserId },
        $or: [
          { username: { $regex: query.trim(), $options: "i" } },
          { firstName: { $regex: query.trim(), $options: "i" } },
          { lastName: { $regex: query.trim(), $options: "i" } },
        ],
      };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const users = await User.find(searchCriteria)
        .select("username firstName lastName avatar bio")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const totalUsers = await User.countDocuments(searchCriteria);

      res.status(200).json({
        status: "success",
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / limit),
            totalItems: totalUsers,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) * limit < totalUsers,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to search users",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Get all users (admin only)
router.get("/", protect, authorize("admin"), getAllUsers);

// Get top authors (public route)
router.get("/top-authors", getTopAuthors);

// Specific routes must come before generic /:id route
// Get user statistics
router.get("/:id/stats", protect, validateUserId, getUserStats);

// Get user followers
router.get("/:id/followers", validateUserId, getFollowers);

// Get user following
router.get("/:id/following", validateUserId, getFollowing);

// Get user by ID (must come after specific routes)
router.get("/:id", protect, validateUserId, getUserById);

// Update user role (admin only)
router.put(
  "/:id/role",
  protect,
  authorize("admin"),
  validateUserId,
  validateUserUpdate,
  updateUserRole,
);

// Delete user (admin only)
router.delete("/:id", protect, authorize("admin"), validateUserId, deleteUser);

// Get user activity
router.get("/:id/activity", protect, validateUserId, async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;

    // Mock activity data for now
    const activities = [
      {
        id: 1,
        type: "blog_created",
        message: "Created a new blog post",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        data: { title: "New Blog Post" },
      },
      {
        id: 2,
        type: "blog_liked",
        message: "Liked a blog post",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        data: { title: "Interesting Article" },
      },
    ].slice(0, limit);

    res.status(200).json({
      status: "success",
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user activity",
    });
  }
});

export default router;
