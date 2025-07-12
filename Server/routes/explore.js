import express from "express";
import {
  getExploreStats,
  getTrendingAuthors,
  getFeaturedContent,
  getPopularTags,
  getRecommendedUsers,
  getTrendingTopics,
  searchContent,
  getCommunityImpact,
} from "../controllers/exploreController.js";
import { optionalAuth } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * @route   GET /api/explore/stats
 * @desc    Get explore page statistics
 * @access  Public
 */
router.get(
  "/stats",
  rateLimiter("exploreStats", 60, 60), // 60 requests per minute
  getExploreStats,
);

/**
 * @route   GET /api/explore/community-impact
 * @desc    Get community impact statistics
 * @access  Public
 */
router.get(
  "/community-impact",
  rateLimiter("communityImpact", 60, 60),
  getCommunityImpact,
);

/**
 * @route   GET /api/explore/trending-authors
 * @desc    Get trending authors
 * @access  Public
 */
router.get(
  "/trending-authors",
  rateLimiter("trendingAuthors", 120, 60), // 120 requests per minute
  optionalAuth,
  getTrendingAuthors,
);

/**
 * @route   GET /api/explore/featured-content
 * @desc    Get featured content
 * @access  Public
 */
router.get(
  "/featured-content",
  rateLimiter("featuredContent", 120, 60),
  optionalAuth,
  getFeaturedContent,
);

/**
 * @route   GET /api/explore/popular-tags
 * @desc    Get popular tags
 * @access  Public
 */
router.get(
  "/popular-tags",
  rateLimiter("popularTags", 120, 60),
  getPopularTags,
);

/**
 * @route   GET /api/explore/recommended-users
 * @desc    Get recommended users
 * @access  Public (Private for personalized recommendations)
 */
router.get(
  "/recommended-users",
  rateLimiter("recommendedUsers", 120, 60),
  optionalAuth,
  getRecommendedUsers,
);

/**
 * @route   GET /api/explore/trending-topics
 * @desc    Get trending topics
 * @access  Public
 */
router.get(
  "/trending-topics",
  rateLimiter("trendingTopics", 120, 60),
  getTrendingTopics,
);

/**
 * @route   GET /api/explore/search
 * @desc    Search across content types (users, blogs, etc.)
 * @access  Public
 */
router.get(
  "/search",
  rateLimiter("exploreSearch", 120, 60),
  optionalAuth,
  searchContent,
);

export default router;
