import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Follow from "../models/Follow.js";
import { validationResult } from "express-validator";

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .populate("blogCount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Remove sensitive data
    const safeUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      blogCount: user.blogCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        users: safeUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("blogCount")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Return safe user data
    const safeUser = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      socialLinks: user.socialLinks,
      blogCount: user.blogCount,
      createdAt: user.createdAt,
    };

    // Get user's recent blogs
    const recentBlogs = await Blog.find({
      author: req.params.id,
      status: "published",
    })
      .select("title slug excerpt publishedAt readTime likeCount")
      .sort({ publishedAt: -1 })
      .limit(5);

    res.status(200).json({
      status: "success",
      data: {
        user: safeUser,
        recentBlogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("blogCount")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Return safe user data
    const safeUser = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      socialLinks: user.socialLinks,
      blogCount: user.blogCount,
      createdAt: user.createdAt,
    };

    // Get user's recent blogs
    const recentBlogs = await Blog.find({
      author: user._id,
      status: "published",
    })
      .select("title slug excerpt publishedAt readTime likeCount")
      .sort({ publishedAt: -1 })
      .limit(5);

    res.status(200).json({
      status: "success",
      data: {
        user: safeUser,
        recentBlogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role specified",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Prevent self-demotion from admin
    if (
      req.user.id === req.params.id &&
      req.user.role === "admin" &&
      role !== "admin"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Cannot demote yourself from admin role",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: "success",
      message: `User role updated to ${role}`,
      data: {
        user: user.getSafeUserData(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Prevent self-deactivation
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        status: "error",
        message: "Cannot change your own status",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: "success",
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        user: user.getSafeUserData(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Get blog statistics
    const blogStats = await Blog.aggregate([
      { $match: { author: user._id, status: "published" } },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
          avgReadTime: { $avg: "$readTime" },
        },
      },
    ]);

    // Get comment statistics
    const commentStats = await Comment.aggregate([
      { $match: { author: user._id, status: "active" } },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalCommentLikes: { $sum: { $size: "$likes" } },
        },
      },
    ]);

    // Get monthly blog count for the last 12 months
    const monthlyStats = await Blog.aggregate([
      {
        $match: {
          author: user._id,
          status: "published",
          publishedAt: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last 12 months
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$publishedAt" },
            month: { $month: "$publishedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const stats = {
      blogs: blogStats[0] || {
        totalBlogs: 0,
        totalViews: 0,
        totalLikes: 0,
        avgReadTime: 0,
      },
      comments: commentStats[0] || {
        totalComments: 0,
        totalCommentLikes: 0,
      },
      monthlyStats,
      joinedDate: user.createdAt,
    };

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Search query must be at least 2 characters long",
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
      .select("username firstName lastName avatar bio")
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Prevent self-deletion
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete your own account",
      });
    }

    // Delete user's blogs and comments
    await Blog.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ author: req.params.id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "User and all associated data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top authors
// @route   GET /api/users/top-authors
// @access  Public
export const getTopAuthors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topAuthors = await User.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "author",
          as: "blogs",
          pipeline: [
            { $match: { status: "published" } },
            {
              $project: {
                views: 1,
                likes: 1,
                likeCount: { $size: "$likes" },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          blogCount: { $size: "$blogs" },
          totalViews: { $sum: "$blogs.views" },
          totalLikes: { $sum: "$blogs.likeCount" },
          authorScore: {
            $add: [
              { $size: "$blogs" },
              { $multiply: [{ $sum: "$blogs.views" }, 0.01] },
              { $multiply: [{ $sum: "$blogs.likeCount" }, 0.1] },
            ],
          },
        },
      },
      {
        $match: { blogCount: { $gt: 0 } },
      },
      {
        $sort: { authorScore: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          bio: 1,
          blogCount: 1,
          totalViews: 1,
          totalLikes: 1,
          authorScore: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        authors: topAuthors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Get followers with pagination
    const followers = await Follow.find({ following: userId })
      .populate("follower", "username firstName lastName avatar bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const totalFollowers = await Follow.countDocuments({ following: userId });

    // Format response
    const formattedFollowers = followers.map((follow) => ({
      id: follow.follower._id,
      username: follow.follower.username,
      firstName: follow.follower.firstName,
      lastName: follow.follower.lastName,
      avatar: follow.follower.avatar,
      bio: follow.follower.bio,
      followedAt: follow.createdAt,
    }));

    res.status(200).json({
      status: "success",
      data: {
        followers: formattedFollowers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFollowers / limit),
          totalFollowers,
          hasNextPage: page < Math.ceil(totalFollowers / limit),
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Get following with pagination
    const following = await Follow.find({ follower: userId })
      .populate("following", "username firstName lastName avatar bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const totalFollowing = await Follow.countDocuments({ follower: userId });

    // Format response
    const formattedFollowing = following.map((follow) => ({
      id: follow.following._id,
      username: follow.following.username,
      firstName: follow.following.firstName,
      lastName: follow.following.lastName,
      avatar: follow.following.avatar,
      bio: follow.following.bio,
      followedAt: follow.createdAt,
    }));

    res.status(200).json({
      status: "success",
      data: {
        following: formattedFollowing,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFollowing / limit),
          totalFollowing,
          hasNextPage: page < Math.ceil(totalFollowing / limit),
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
