import Like from "../models/Like.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { validationResult } from "express-validator";

// Toggle like/unlike a blog
export const toggleLike = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { blogId } = req.params;
    const userId = req.user.id;
    const { type = "like" } = req.body;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    const result = await Like.toggleLike(blogId, userId, type);
    const likeCount = await Like.getLikeCount(blogId);

    // Update blog like count (denormalized for performance)
    await Blog.findByIdAndUpdate(blogId, { likeCount });

    // Create notification if liked (not for self-likes)
    if (result.liked && !blog.author.equals(userId)) {
      await Notification.createLikeNotification(
        userId,
        blogId,
        blog.title,
        blog.author,
      );
    }

    res.status(200).json({
      status: "success",
      message: result.liked
        ? "Blog liked successfully"
        : "Blog unliked successfully",
      data: {
        liked: result.liked,
        type: result.type,
        likeCount,
      },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update like status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get blog likes
export const getBlogLikes = async (req, res) => {
  try {
    const { blogId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    const likes = await Like.getBlogLikes(blogId, { page, limit });
    const totalLikes = await Like.getLikeCount(blogId);

    res.status(200).json({
      status: "success",
      data: {
        likes: likes.map((like) => ({
          user: like.user,
          type: like.type,
          createdAt: like.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalLikes / limit),
          totalItems: totalLikes,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalLikes,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get blog likes error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get blog likes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user's liked blogs
export const getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const likes = await Like.getUserLikes(userId, { page, limit });
    const totalLikes = await Like.countDocuments({ user: userId });

    res.status(200).json({
      status: "success",
      data: {
        likes: likes.map((like) => ({
          blog: like.blog,
          type: like.type,
          likedAt: like.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalLikes / limit),
          totalItems: totalLikes,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalLikes,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user likes error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get user likes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check if user liked a blog
export const getLikeStatus = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({ blog: blogId, user: userId });

    res.status(200).json({
      status: "success",
      data: {
        isLiked: !!like,
        type: like?.type || null,
      },
    });
  } catch (error) {
    console.error("Get like status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get like status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get like statistics for multiple blogs
export const getBlogsLikeStatus = async (req, res) => {
  try {
    const { blogIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Blog IDs array is required",
      });
    }

    const likes = await Like.find({
      blog: { $in: blogIds },
      user: userId,
    }).select("blog type");

    const likeMap = {};
    likes.forEach((like) => {
      likeMap[like.blog.toString()] = {
        isLiked: true,
        type: like.type,
      };
    });

    // Fill in missing blogs with false
    blogIds.forEach((blogId) => {
      if (!likeMap[blogId]) {
        likeMap[blogId] = {
          isLiked: false,
          type: null,
        };
      }
    });

    res.status(200).json({
      status: "success",
      data: likeMap,
    });
  } catch (error) {
    console.error("Get blogs like status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get like status for blogs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
