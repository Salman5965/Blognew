import ForumMessage from "../models/ForumMessage.js";
import ForumChannel from "../models/ForumChannel.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// @desc    Get community posts (using forum messages)
// @route   GET /api/community/posts
// @access  Private
export const getPosts = async (req, res, next) => {
  try {
    const {
      category = "all",
      sortBy = "recent",
      page = 1,
      limit = 20,
      search,
      tags,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {
      parentMessage: null, // Only top-level posts
      isDeleted: false,
    };

    // Category filter (map to forum channels)
    if (category && category !== "all") {
      const channels = await ForumChannel.find({ category }).select("_id");
      if (channels.length > 0) {
        query.channel = { $in: channels.map((c) => c._id) };
      }
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Tags filter (if implemented in ForumMessage)
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      // This would need to be implemented in the ForumMessage schema
      // query.tags = { $in: tagArray };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case "trending":
        // Sort by engagement (reactions + replies)
        sortOptions = {
          "reactions.0.count": -1,
          replyCount: -1,
          createdAt: -1,
        };
        break;
      case "popular":
        sortOptions = { "reactions.0.count": -1, createdAt: -1 };
        break;
      case "unanswered":
        query.replyCount = { $eq: 0 };
        sortOptions = { createdAt: -1 };
        break;
      default: // recent
        sortOptions = { isPinned: -1, createdAt: -1 };
    }

    // Get posts with populated data
    const posts = await ForumMessage.find(query)
      .populate("author", "username firstName lastName avatar role isOnline")
      .populate("channel", "name category")
      .populate("replyTo", "username firstName lastName")
      .populate({
        path: "reactions.users",
        select: "username",
      })
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await ForumMessage.countDocuments(query);
    const hasMore = skip + posts.length < total;

    // Transform posts to match frontend expectations
    const transformedPosts = posts.map((post) => ({
      _id: post._id,
      title:
        post.content.substring(0, 100) +
        (post.content.length > 100 ? "..." : ""), // Generate title from content
      content: post.content,
      author: post.author,
      category: post.channel?.category || "general",
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isEdited: post.isEdited,
      isPinned: post.isPinned,
      reactions: post.reactions || [],
      replyCount: post.replyCount || 0,
      views: Math.floor(Math.random() * 1000), // Mock views for now
      tags: [], // Add tags when implemented
      attachments: post.attachments || [],
    }));

    res.status(200).json({
      status: "success",
      data: {
        posts: transformedPosts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          hasMore,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search community posts
// @route   GET /api/community/search
// @access  Private
export const searchPosts = async (req, res, next) => {
  try {
    const {
      q: query,
      category,
      sortBy = "relevance",
      page = 1,
      limit = 20,
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Search query must be at least 2 characters long",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = {
      $text: { $search: query },
      parentMessage: null,
      isDeleted: false,
    };

    // Category filter
    if (category) {
      const channels = await ForumChannel.find({ category }).select("_id");
      if (channels.length > 0) {
        searchQuery.channel = { $in: channels.map((c) => c._id) };
      }
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "popular":
        sortOptions = { "reactions.0.count": -1, createdAt: -1 };
        break;
      default: // relevance
        sortOptions = { score: { $meta: "textScore" }, createdAt: -1 };
        searchQuery.$text.$caseSensitive = false;
    }

    const posts = await ForumMessage.find(searchQuery)
      .populate("author", "username firstName lastName avatar role")
      .populate("channel", "name category")
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await ForumMessage.countDocuments(searchQuery);
    const hasMore = skip + posts.length < total;

    // Transform posts
    const transformedPosts = posts.map((post) => ({
      _id: post._id,
      title:
        post.content.substring(0, 100) +
        (post.content.length > 100 ? "..." : ""),
      content: post.content,
      author: post.author,
      category: post.channel?.category || "general",
      createdAt: post.createdAt,
      reactions: post.reactions || [],
      replyCount: post.replyCount || 0,
      views: Math.floor(Math.random() * 1000),
    }));

    res.status(200).json({
      status: "success",
      data: {
        posts: transformedPosts,
        total,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new community post
// @route   POST /api/community/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, content, category, tags } = req.body;

    // Find or create channel for category
    let channel = await ForumChannel.findOne({ category });
    if (!channel) {
      // Create default channel for category
      channel = await ForumChannel.create({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        description: `${category} discussions`,
        category,
        createdBy: req.user.id,
      });
    }

    // Create the post as a forum message
    const postContent = title ? `${title}\n\n${content}` : content;

    const post = await ForumMessage.create({
      content: postContent,
      author: req.user.id,
      channel: channel._id,
      // tags could be added to the schema later
    });

    // Populate the created post
    await post.populate("author", "username firstName lastName avatar role");
    await post.populate("channel", "name category");

    // Update channel activity
    await channel.incrementMessageCount();

    const transformedPost = {
      _id: post._id,
      title: title || post.content.substring(0, 100),
      content: post.content,
      author: post.author,
      category: post.channel.category,
      createdAt: post.createdAt,
      reactions: [],
      replyCount: 0,
      views: 0,
      tags: tags || [],
    };

    res.status(201).json({
      status: "success",
      data: {
        post: transformedPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post with replies
// @route   GET /api/community/posts/:id
// @access  Private
export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await ForumMessage.findById(id)
      .populate("author", "username firstName lastName avatar role")
      .populate("channel", "name category")
      .populate("reactions.users", "username");

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Get replies
    const replies = await ForumMessage.find({
      parentMessage: id,
      isDeleted: false,
    })
      .populate("author", "username firstName lastName avatar role")
      .populate("replyTo", "username firstName lastName")
      .sort({ createdAt: 1 });

    const transformedPost = {
      _id: post._id,
      title: post.content.substring(0, 100),
      content: post.content,
      author: post.author,
      category: post.channel?.category,
      createdAt: post.createdAt,
      reactions: post.reactions || [],
      replies: replies.map((reply) => ({
        _id: reply._id,
        content: reply.content,
        author: reply.author,
        replyTo: reply.replyTo,
        createdAt: reply.createdAt,
        reactions: reply.reactions || [],
      })),
    };

    res.status(200).json({
      status: "success",
      data: {
        post: transformedPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get replies for a post
// @route   GET /api/community/posts/:id/replies
// @access  Private
export const getReplies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parent } = req.query;

    const query = {
      parentMessage: parent || id,
      isDeleted: false,
    };

    const replies = await ForumMessage.find(query)
      .populate("author", "username firstName lastName avatar role")
      .populate("replyTo", "username firstName lastName")
      .populate("reactions.users", "username")
      .sort({ createdAt: 1 });

    const transformedReplies = replies.map((reply) => ({
      _id: reply._id,
      content: reply.content,
      author: reply.author,
      replyTo: reply.replyTo,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      isEdited: reply.isEdited,
      reactions: reply.reactions || [],
      replyCount: reply.replyCount || 0,
    }));

    res.status(200).json({
      status: "success",
      data: {
        replies: transformedReplies,
        total: replies.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create reply to post
// @route   POST /api/community/posts/:id/replies
// @access  Private
export const createReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, parentMessage, replyTo } = req.body;

    // Find the original post
    const originalPost = await ForumMessage.findById(id);
    if (!originalPost) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    const reply = await ForumMessage.create({
      content,
      author: req.user.id,
      channel: originalPost.channel,
      parentMessage: parentMessage || id,
      replyTo: replyTo || originalPost.author,
    });

    await reply.populate("author", "username firstName lastName avatar role");
    await reply.populate("replyTo", "username firstName lastName");

    const transformedReply = {
      _id: reply._id,
      content: reply.content,
      author: reply.author,
      replyTo: reply.replyTo,
      createdAt: reply.createdAt,
      reactions: [],
      replyCount: 0,
    };

    res.status(201).json({
      status: "success",
      data: {
        reply: transformedReply,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle reaction on post
// @route   POST /api/community/posts/:id/reactions
// @access  Private
export const toggleReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    const post = await ForumMessage.findById(id);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    const existingReaction = post.reactions.find((r) => r.emoji === emoji);
    let isLiked = false;
    let count = 0;

    if (existingReaction) {
      const userIndex = existingReaction.users.indexOf(req.user.id);
      if (userIndex > -1) {
        // Remove reaction
        existingReaction.users.splice(userIndex, 1);
        existingReaction.count = existingReaction.users.length;
        isLiked = false;
      } else {
        // Add reaction
        existingReaction.users.push(req.user.id);
        existingReaction.count = existingReaction.users.length;
        isLiked = true;
      }
      count = existingReaction.count;

      // Remove reaction if no users left
      if (existingReaction.count === 0) {
        post.reactions = post.reactions.filter((r) => r.emoji !== emoji);
      }
    } else {
      // Create new reaction
      post.reactions.push({
        emoji,
        users: [req.user.id],
        count: 1,
      });
      isLiked = true;
      count = 1;
    }

    await post.save();

    res.status(200).json({
      status: "success",
      data: {
        isLiked,
        count,
        reactions: post.reactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get community categories
// @route   GET /api/community/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      {
        id: "general",
        name: "General Discussion",
        description: "General topics and discussions",
      },
      {
        id: "development",
        name: "Development",
        description: "Programming and development topics",
      },
      {
        id: "help",
        name: "Help & Support",
        description: "Get help with your questions",
      },
      {
        id: "career",
        name: "Career",
        description: "Career advice and opportunities",
      },
      { id: "offtopic", name: "Off Topic", description: "Everything else" },
    ];

    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get community statistics
// @route   GET /api/community/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const [totalPosts, totalUsers, activePosts] = await Promise.all([
      ForumMessage.countDocuments({ parentMessage: null, isDeleted: false }),
      User.countDocuments({ isActive: true }),
      ForumMessage.countDocuments({
        parentMessage: null,
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    const stats = {
      totalPosts,
      activePosts,
      onlineUsers: Math.floor(Math.random() * 100) + 10, // Mock online users
      totalUsers,
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

// @desc    Delete post
// @route   DELETE /api/community/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await ForumMessage.findById(id);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this post",
      });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    post.deletedBy = req.user.id;
    await post.save();

    res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reply
// @route   DELETE /api/community/replies/:id
// @access  Private
export const deleteReply = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reply = await ForumMessage.findById(id);
    if (!reply) {
      return res.status(404).json({
        status: "error",
        message: "Reply not found",
      });
    }

    // Check if user owns the reply or is admin
    if (reply.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this reply",
      });
    }

    reply.isDeleted = true;
    reply.deletedAt = new Date();
    reply.deletedBy = req.user.id;
    await reply.save();

    res.status(200).json({
      status: "success",
      message: "Reply deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
