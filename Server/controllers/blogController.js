import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import { validationResult } from "express-validator";

// @desc    Get all blogs with pagination and filters
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: "published" };

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
    const blogs = await Blog.find(filter)
      .populate("author", "username firstName lastName avatar")
      .populate("commentCount")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Add user-specific like status if user is authenticated
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: req.user
        ? blog.likes.some(
            (like) => like.user.toString() === req.user.id.toString(),
          )
        : false,
      likeCount: blog.likes ? blog.likes.length : 0,
    }));

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      status: "success",
      data: {
        blogs: blogsWithLikeStatus,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs: total,
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

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res, next) => {
  try {
    const identifier = req.params.slug;

    // Try to find by slug first, then by ID if slug fails
    let blog = await Blog.findOne({
      slug: identifier,
      status: "published",
    })
      .populate("author", "username firstName lastName avatar bio")
      .populate("commentCount");

    // If not found by slug and identifier looks like a MongoDB ObjectId, try by ID
    if (!blog && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findOne({
        _id: identifier,
        status: "published",
      })
        .populate("author", "username firstName lastName avatar bio")
        .populate("commentCount");
    }

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    // Add user-specific like status
    const blogWithLikeStatus = {
      ...blog.toObject(),
      isLiked: req.user
        ? blog.likes.some(
            (like) => like.user.toString() === req.user.id.toString(),
          )
        : false,
      likeCount: blog.likes ? blog.likes.length : 0,
    };

    res.status(200).json({
      status: "success",
      data: {
        blog: blogWithLikeStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res, next) => {
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

    const blogData = {
      ...req.body,
      author: req.user.id,
    };

    const blog = new Blog(blogData);
    await blog.save();

    // Populate author info
    await blog.populate("author", "username firstName lastName avatar");

    res.status(201).json({
      status: "success",
      message: "Blog created successfully",
      data: {
        blog,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res, next) => {
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

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this blog",
      });
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("author", "username firstName lastName avatar");

    res.status(200).json({
      status: "success",
      message: "Blog updated successfully",
      data: {
        blog: updatedBlog,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this blog",
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ blog: req.params.id });

    // Delete blog
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Blog and associated comments deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const toggleLikeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    const isLiked = blog.toggleLike(req.user.id);
    await blog.save();

    res.status(200).json({
      status: "success",
      message: isLiked
        ? "Blog liked successfully"
        : "Blog unliked successfully",
      data: {
        isLiked,
        likeCount: blog.likeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs by specific user
// @route   GET /api/blogs/user/:userId
// @access  Public
export const getBlogsByUser = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      author: req.params.userId,
      status: "published",
    };

    const blogs = await Blog.find(filter)
      .populate("author", "username firstName lastName avatar")
      .populate("commentCount")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add user-specific like status if user is authenticated
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: req.user
        ? blog.likes.some(
            (like) => like.user.toString() === req.user.id.toString(),
          )
        : false,
      likeCount: blog.likes ? blog.likes.length : 0,
    }));

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        blogs: blogsWithLikeStatus,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
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

// @desc    Get user's own blogs (including drafts)
// @route   GET /api/blogs/my-blogs
// @access  Private
export const getMyBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { author: req.user.id };

    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const blogs = await Blog.find(filter)
      .populate("commentCount")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add user-specific like status
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: blog.likes.some(
        (like) => like.user.toString() === req.user.id.toString(),
      ),
      likeCount: blog.likes ? blog.likes.length : 0,
    }));

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        blogs: blogsWithLikeStatus,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
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

// @desc    Get popular blogs
// @route   GET /api/blogs/popular
// @access  Public
export const getPopularBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const blogs = await Blog.getPopularBlogs(limit);

    // Add user-specific like status if user is authenticated
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: req.user
        ? blog.likes.some(
            (like) => like.user.toString() === req.user.id.toString(),
          )
        : false,
      likeCount: blog.likes ? blog.likes.length : 0,
    }));

    res.status(200).json({
      status: "success",
      data: {
        blogs: blogsWithLikeStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
export const getFeaturedBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.find({
      status: "published",
      isFeatured: true,
    })
      .populate("author", "username firstName lastName avatar")
      .populate("commentCount")
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        blogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogsWithoutTags = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object (without tag filtering)
    const filter = { status: "published" };

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
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
    const blogs = await Blog.find(filter)
      .populate("author", "username firstName lastName avatar")
      .populate("commentCount")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      status: "success",
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs: total,
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

/**
 * @desc    Get blogs by category
 * @route   GET /api/blogs/category/:category
 * @access  Public
 */
export const getBlogsByCategory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {
      status: "published",
      category: req.params.category.toLowerCase(),
    };

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
    const blogs = await Blog.find(filter)
      .populate("author", "username firstName lastName avatar")
      .populate("commentCount")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      status: "success",
      data: {
        blogs,
        category: req.params.category,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs: total,
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

/**
 * @desc    Get all unique categories from published blogs
 * @route   GET /api/blogs/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    // Get unique categories from published blogs
    const categories = await Blog.distinct("category", { status: "published" });

    // Get blog count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const blogCount = await Blog.countDocuments({
          category: category,
          status: "published",
        });

        return {
          name: category,
          slug: category,
          blogCount,
        };
      }),
    );

    // Sort categories by name
    categoriesWithCount.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      status: "success",
      data: {
        categories: categoriesWithCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
