import Story from "../models/Story.js";
import { validationResult } from "express-validator";

// @desc    Get all published stories with pagination and filters
// @route   GET /api/stories
// @access  Public
export const getStories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isPublished: true };

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    // Filter by tag
    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag.toLowerCase()] };
    }

    // Filter by author
    if (req.query.author) {
      filter.author = req.query.author;
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Sort options
    let sortOption = { publishedAt: -1 }; // Default: newest first

    if (req.query.sort) {
      switch (req.query.sort) {
        case "oldest":
          sortOption = { publishedAt: 1 };
          break;
        case "popular":
          sortOption = { views: -1, likes: -1 };
          break;
        case "title":
          sortOption = { title: 1 };
          break;
        default:
          sortOption = { publishedAt: -1 };
      }
    }

    // Execute query
    const stories = await Story.find(filter)
      .populate("author", "username firstName lastName avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Add user-specific like status if user is authenticated
    const storiesWithLikeStatus = stories.map((story) => ({
      ...story,
      id: story._id.toString(), // Add id field for React keys
      author: story.author
        ? {
            ...story.author,
            name:
              `${story.author.firstName || ""} ${story.author.lastName || ""}`.trim() ||
              story.author.username,
            isVerified: false, // Add default verified status
          }
        : null,
      isLiked: req.user
        ? story.likes.some(
            (like) => like.user.toString() === req.user.id.toString(),
          )
        : false,
      likeCount: story.likes ? story.likes.length : 0,
      likes: story.likes ? story.likes.length : 0, // Add likes count as number
      comments: 0, // Add default comments count
    }));

    // Get total count for pagination
    const total = await Story.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      status: "success",
      data: {
        stories: storiesWithLikeStatus,
        pagination: {
          currentPage: page,
          totalPages,
          totalStories: total,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single story by ID
// @route   GET /api/stories/:id
// @access  Public
export const getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "author",
      "username firstName lastName avatar bio",
    );

    if (!story) {
      return res.status(404).json({
        status: "error",
        message: "Story not found",
      });
    }

    // Check if story is published or user owns it
    if (
      !story.isPublished &&
      (!req.user || story.author._id.toString() !== req.user.id)
    ) {
      return res.status(404).json({
        status: "error",
        message: "Story not found",
      });
    }

    // Increment view count if not the author
    if (!req.user || story.author._id.toString() !== req.user.id) {
      story.views += 1;
      await story.save();
    }

    // Add user-specific like status
    const storyWithLikeStatus = {
      ...story.toObject(),
      id: story._id.toString(), // Add id field for React keys
      author: story.author
        ? {
            ...story.author.toObject(),
            name:
              `${story.author.firstName || ""} ${story.author.lastName || ""}`.trim() ||
              story.author.username,
            isVerified: false,
          }
        : null,
      isLiked: req.user
        ? story.likes.some(
            (like) => like.user.toString() === req.user.id.toString(),
          )
        : false,
      likeCount: story.likes ? story.likes.length : 0,
      likes: story.likes ? story.likes.length : 0,
      comments: 0,
    };

    res.status(200).json({
      status: "success",
      data: {
        story: storyWithLikeStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new story
// @route   POST /api/stories
// @access  Private
export const createStory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const storyData = {
      ...req.body,
      author: req.user.id,
    };

    const story = new Story(storyData);
    await story.save();

    // Populate author info
    await story.populate("author", "username firstName lastName avatar");

    res.status(201).json({
      status: "success",
      message: "Story created successfully",
      data: {
        story,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
export const updateStory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        status: "error",
        message: "Story not found",
      });
    }

    // Check if user owns the story
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this story",
      });
    }

    // Update story
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("author", "username firstName lastName avatar");

    res.status(200).json({
      status: "success",
      message: "Story updated successfully",
      data: {
        story: updatedStory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        status: "error",
        message: "Story not found",
      });
    }

    // Check if user owns the story
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this story",
      });
    }

    // Delete story
    await Story.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Story deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike story
// @route   POST /api/stories/:id/like
// @access  Private
export const toggleLikeStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        status: "error",
        message: "Story not found",
      });
    }

    const isLiked = story.toggleLike(req.user.id);
    await story.save();

    res.status(200).json({
      status: "success",
      message: isLiked
        ? "Story liked successfully"
        : "Story unliked successfully",
      data: {
        isLiked,
        likeCount: story.likeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own stories (including drafts)
// @route   GET /api/stories/my-stories
// @access  Private
export const getMyStories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { author: req.user.id };

    // Filter by status if provided
    if (req.query.status) {
      filter.isPublished = req.query.status === "published";
    }

    const stories = await Story.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Story.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        stories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStories: total,
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

// @desc    Get popular stories
// @route   GET /api/stories/popular
// @access  Public
export const getPopularStories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const stories = await Story.getPopularStories(limit);

    res.status(200).json({
      status: "success",
      data: {
        stories,
      },
    });
  } catch (error) {
    next(error);
  }
};
