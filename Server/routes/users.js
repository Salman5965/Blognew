import express from "express";
import { body, param, query } from "express-validator";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validateUpdateUser } from "../validators/userValidator.js";
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

      const users = await User.searchUsers(query, {
        page: parseInt(page),
        limit: parseInt(limit),
        excludeIds: [currentUserId],
      });

      const totalUsers = await User.countDocuments({
        isActive: true,
        _id: { $ne: currentUserId },
        ...(query && {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
          ],
        }),
      });

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
router.get("/", authenticateToken, authorizeAdmin, getAllUsers);

// Get user by ID
router.get("/:id", authenticateToken, validateUserId, getUserById);

// Update user
router.put(
  "/:id",
  authenticateToken,
  validateUserId,
  validateUpdateUser,
  updateUser,
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  validateUserId,
  deleteUser,
);

// Get user statistics
router.get("/:id/stats", authenticateToken, validateUserId, getUserStats);

export default router;
