import express from "express";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  getBlogsByUser,
  getMyBlogs,
  getPopularBlogs,
  getFeaturedBlogs,
  getBlogsByCategory,
  getBlogsWithoutTags,
  getCategories,
} from "../controllers/blogController.js";
import { protect, optionalAuth, authorize } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
  validateCreateBlog,
  validateUpdateBlog,
} from "../validators/blogValidator.js";

const router = express.Router();

/**
 * @route   GET /api/blogs
 * @desc    Get all published blogs with pagination and filters
 * @access  Public
 * @query   page, limit, category, tag, author, search, sort
 */
router.get(
  "/",
  rateLimiter("getBlogs", 120, 60), // 120 requests per minute - generous for browsing
  optionalAuth,
  getBlogs,
);

/**
 * @route   GET /api/blogs/no-tags
 * @desc    Get all blogs without any tag filtering
 * @access  Public
 * @query   page, limit, category, author, search, sort
 */
router.get("/no-tags", optionalAuth, getBlogsWithoutTags);

/**
 * @route   GET /api/blogs/popular
 * @desc    Get popular blogs based on views and likes
 * @access  Public
 * @query   limit
 */
router.get("/popular", getPopularBlogs);

/**
 * @route   GET /api/blogs/featured
 * @desc    Get featured blogs
 * @access  Public
 * @query   limit
 */
router.get("/featured", getFeaturedBlogs);

/**
 * @route   GET /api/blogs/categories
 * @desc    Get all available blog categories
 * @access  Public
 */
router.get("/categories", getCategories);

/**
 * @route   GET /api/blogs/category/:category
 * @desc    Get blogs by specific category
 * @access  Public
 * @query   page, limit, author, search, sort
 */
router.get("/category/:category", optionalAuth, getBlogsByCategory);

/**
 * @route   GET /api/blogs/my-blogs
 * @desc    Get current user's blogs (including drafts)
 * @access  Private
 * @query   page, limit, status
 */
router.get("/my-blogs", protect, getMyBlogs);

/**
 * @route   GET /api/blogs/user/:userId
 * @desc    Get blogs by specific user
 * @access  Public
 * @query   page, limit
 */
router.get("/user/:userId", getBlogsByUser);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post
 * @access  Private
 */
router.post("/", protect, validateCreateBlog, createBlog);

/**
 * @route   GET /api/blogs/:slug
 * @desc    Get single blog by slug
 * @access  Public
 */
router.get("/:slug", optionalAuth, getBlogBySlug);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update blog post
 * @access  Private (Owner or Admin)
 */
router.put("/:id", protect, validateUpdateBlog, updateBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete blog post
 * @access  Private (Owner or Admin)
 */
router.delete("/:id", protect, deleteBlog);

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Like or unlike a blog post
 * @access  Private
 */
router.post("/:id/like", protect, toggleLikeBlog);

export default router;
