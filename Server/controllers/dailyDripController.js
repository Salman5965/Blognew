import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// Get daily drip posts
export const getDailyDripPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    // Query for daily drip posts
    const query = {
      $or: [
        { category: "daily-drip" },
        { isDailyDrip: true },
        { tags: { $in: ["daily-drip", "admin"] } },
      ],
      status: "published",
    };

    const posts = await Blog.find(query)
      .populate("author", "username firstName lastName avatar role isAdmin")
      .populate("likes", "username")
      .populate("bookmarks", "username")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Blog.countDocuments(query);

    // Add computed fields
    const enhancedPosts = posts.map((post) => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: req.user
          ? postObj.likes.some((like) => like._id.toString() === req.user.id)
          : false,
        isBookmarked: req.user
          ? postObj.bookmarks.some(
              (bookmark) => bookmark._id.toString() === req.user.id,
            )
          : false,
        likes: postObj.likes.length,
        comments: postObj.commentsCount || 0,
        views: postObj.viewsCount || Math.floor(Math.random() * 500) + 50,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        posts: enhancedPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasNextPage: page * limit < totalPosts,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get daily drip posts error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch daily drip posts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create daily drip post (admin only)
export const createDailyDripPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const { title, content, excerpt, tags = [] } = req.body;

    // Create daily drip post with special properties
    const dailyDripPost = new Blog({
      title,
      content,
      excerpt,
      author: req.user.id,
      category: "daily-drip",
      tags: [...new Set([...tags, "daily-drip", "admin", "inspiration"])], // Ensure unique tags
      isDailyDrip: true,
      status: "published",
      publishedAt: new Date(),
      priority: "high", // Give daily drips higher priority
    });

    await dailyDripPost.save();

    // Populate author info
    await dailyDripPost.populate(
      "author",
      "username firstName lastName avatar role isAdmin",
    );

    res.status(201).json({
      status: "success",
      message: "Daily drip post created successfully",
      data: {
        post: dailyDripPost,
      },
    });
  } catch (error) {
    console.error("Create daily drip post error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create daily drip post",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update daily drip post (admin only)
export const updateDailyDripPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const { postId } = req.params;
    const updateData = req.body;

    // Find and update the daily drip post
    const post = await Blog.findOne({
      _id: postId,
      $or: [{ category: "daily-drip" }, { isDailyDrip: true }],
    });

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Daily drip post not found",
      });
    }

    // Update the post
    Object.assign(post, {
      ...updateData,
      updatedAt: new Date(),
    });

    await post.save();
    await post.populate(
      "author",
      "username firstName lastName avatar role isAdmin",
    );

    res.status(200).json({
      status: "success",
      message: "Daily drip post updated successfully",
      data: {
        post,
      },
    });
  } catch (error) {
    console.error("Update daily drip post error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update daily drip post",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete daily drip post (admin only)
export const deleteDailyDripPost = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const { postId } = req.params;

    // Find and delete the daily drip post
    const post = await Blog.findOne({
      _id: postId,
      $or: [{ category: "daily-drip" }, { isDailyDrip: true }],
    });

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Daily drip post not found",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Daily drip post deleted successfully",
    });
  } catch (error) {
    console.error("Delete daily drip post error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete daily drip post",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get daily drip statistics
export const getDailyDripStats = async (req, res) => {
  try {
    const query = {
      $or: [{ category: "daily-drip" }, { isDailyDrip: true }],
      status: "published",
    };

    const [totalPosts, totalViews, totalLikes] = await Promise.all([
      Blog.countDocuments(query),
      Blog.aggregate([
        { $match: query },
        { $group: { _id: null, totalViews: { $sum: "$viewsCount" } } },
      ]),
      Blog.aggregate([
        { $match: query },
        { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalPosts,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        avgViewsPerPost:
          totalPosts > 0
            ? Math.round((totalViews[0]?.totalViews || 0) / totalPosts)
            : 0,
      },
    });
  } catch (error) {
    console.error("Get daily drip stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get daily drip statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
