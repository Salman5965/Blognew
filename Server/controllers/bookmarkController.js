import Bookmark from "../models/Bookmark.js";
import Blog from "../models/Blog.js";
import { validationResult } from "express-validator";

// Toggle bookmark/unbookmark a blog
export const toggleBookmark = async (req, res) => {
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
    const { collection = "default" } = req.body;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    const result = await Bookmark.toggleBookmark(blogId, userId, collection);

    res.status(200).json({
      status: "success",
      message: result.bookmarked
        ? "Blog bookmarked successfully"
        : "Bookmark removed successfully",
      data: {
        bookmarked: result.bookmarked,
        collection: result.collection,
      },
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update bookmark status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user's bookmarks
export const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const collection = req.query.collection;

    const bookmarks = await Bookmark.getUserBookmarks(userId, {
      page,
      limit,
      collection,
    });

    const totalBookmarks = await Bookmark.countDocuments({
      user: userId,
      ...(collection && collection !== "all" && { collection }),
    });

    res.status(200).json({
      status: "success",
      data: {
        bookmarks: bookmarks.map((bookmark) => ({
          _id: bookmark._id,
          blog: bookmark.blog,
          collection: bookmark.collection,
          notes: bookmark.notes,
          createdAt: bookmark.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBookmarks / limit),
          totalItems: totalBookmarks,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalBookmarks,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user bookmarks error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get bookmarks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user's bookmark collections
export const getBookmarkCollections = async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = await Bookmark.getUserCollections(userId);

    res.status(200).json({
      status: "success",
      data: {
        collections: collections.map((collection) => ({
          name: collection._id,
          count: collection.count,
          lastUpdated: collection.lastUpdated,
        })),
      },
    });
  } catch (error) {
    console.error("Get bookmark collections error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get bookmark collections",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check if user bookmarked a blog
export const getBookmarkStatus = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({ blog: blogId, user: userId });

    res.status(200).json({
      status: "success",
      data: {
        isBookmarked: !!bookmark,
        collection: bookmark?.collection || null,
      },
    });
  } catch (error) {
    console.error("Get bookmark status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get bookmark status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update bookmark collection
export const updateBookmarkCollection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { bookmarkId } = req.params;
    const { collection } = req.body;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({
      _id: bookmarkId,
      user: userId,
    });

    if (!bookmark) {
      return res.status(404).json({
        status: "error",
        message: "Bookmark not found",
      });
    }

    await bookmark.updateCollection(collection);

    res.status(200).json({
      status: "success",
      message: "Bookmark collection updated successfully",
      data: {
        bookmark,
      },
    });
  } catch (error) {
    console.error("Update bookmark collection error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update bookmark collection",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add notes to bookmark
export const updateBookmarkNotes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { bookmarkId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({
      _id: bookmarkId,
      user: userId,
    });

    if (!bookmark) {
      return res.status(404).json({
        status: "error",
        message: "Bookmark not found",
      });
    }

    await bookmark.addNotes(notes);

    res.status(200).json({
      status: "success",
      message: "Bookmark notes updated successfully",
      data: {
        bookmark,
      },
    });
  } catch (error) {
    console.error("Update bookmark notes error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update bookmark notes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete a bookmark
export const deleteBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({
      _id: bookmarkId,
      user: userId,
    });

    if (!bookmark) {
      return res.status(404).json({
        status: "error",
        message: "Bookmark not found",
      });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Bookmark deleted successfully",
    });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete bookmark",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get bookmark statistics for multiple blogs
export const getBlogsBookmarkStatus = async (req, res) => {
  try {
    const { blogIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Blog IDs array is required",
      });
    }

    const bookmarks = await Bookmark.find({
      blog: { $in: blogIds },
      user: userId,
    }).select("blog collection");

    const bookmarkMap = {};
    bookmarks.forEach((bookmark) => {
      bookmarkMap[bookmark.blog.toString()] = {
        isBookmarked: true,
        collection: bookmark.collection,
      };
    });

    // Fill in missing blogs with false
    blogIds.forEach((blogId) => {
      if (!bookmarkMap[blogId]) {
        bookmarkMap[blogId] = {
          isBookmarked: false,
          collection: null,
        };
      }
    });

    res.status(200).json({
      status: "success",
      data: bookmarkMap,
    });
  } catch (error) {
    console.error("Get blogs bookmark status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get bookmark status for blogs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
