import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Follow from "../models/Follow.js";
import mongoose from "mongoose";

/**
 * @desc    Get explore page statistics
 * @route   GET /api/explore/stats
 * @access  Public
 */
export const getExploreStats = async (req, res) => {
  try {
    // Get current date and 30 days ago for growth calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total counts
    const [
      totalUsers,
      totalBlogs,
      totalComments,
      activeUsers,
      newUsersLast30Days,
      newBlogsLast30Days,
      newCommentsLast30Days,
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments({ status: "published" }),
      Comment.countDocuments(),
      User.countDocuments({ lastSeen: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Blog.countDocuments({
        status: "published",
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Comment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    // Calculate growth percentages
    const userGrowth =
      totalUsers > 0 ? (newUsersLast30Days / totalUsers) * 100 : 0;
    const blogGrowth =
      totalBlogs > 0 ? (newBlogsLast30Days / totalBlogs) * 100 : 0;
    const commentGrowth =
      totalComments > 0 ? (newCommentsLast30Days / totalComments) * 100 : 0;

    const stats = {
      totalUsers,
      totalAuthors: await User.countDocuments({
        role: { $in: ["user", "admin"] },
      }),
      totalBlogs,
      totalComments,
      activeUsers,
      growth: {
        users: Math.round(userGrowth * 100) / 100,
        blogs: Math.round(blogGrowth * 100) / 100,
        comments: Math.round(commentGrowth * 100) / 100,
      },
      new: {
        users: newUsersLast30Days,
        blogs: newBlogsLast30Days,
        comments: newCommentsLast30Days,
      },
    };

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting explore stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get explore statistics",
    });
  }
};

/**
 * @desc    Get community impact statistics
 * @route   GET /api/explore/community-impact
 * @access  Public
 */
export const getCommunityImpact = async (req, res) => {
  try {
    // Get current date and time periods for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total counts and recent activity
    const [
      totalStories,
      totalUsers,
      totalCountries,
      recentStories,
      recentUsers,
      storiesSharedLast30Days,
      livesTouched,
      activeCountries,
    ] = await Promise.all([
      // Use Story model when available, for now use blogs as stories
      Blog.countDocuments({ status: "published" }),
      User.countDocuments(),
      // Count unique countries from user profiles (if country field exists)
      User.distinct("country").then(
        (countries) => countries.filter((c) => c).length,
      ),
      Blog.countDocuments({
        status: "published",
        createdAt: { $gte: thirtyDaysAgo },
      }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Blog.countDocuments({
        status: "published",
        createdAt: { $gte: thirtyDaysAgo },
      }),
      // Calculate lives touched based on total views and engagement
      Blog.aggregate([
        { $match: { status: "published" } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalLikes: { $sum: "$likesCount" },
          },
        },
      ]).then((result) =>
        result[0] ? result[0].totalViews + result[0].totalLikes : 0,
      ),
      // Get countries from users who have been active recently
      User.distinct("country", {
        lastSeen: { $gte: thirtyDaysAgo },
        country: { $exists: true, $ne: null, $ne: "" },
      }).then((countries) => countries.length),
    ]);

    const communityImpact = {
      storiesShared: totalStories,
      livesTouched: livesTouched || Math.floor(totalStories * 2.5), // Estimated based on engagement
      countries: Math.max(totalCountries, activeCountries, 45), // Ensure minimum countries
      recentActivity: {
        newStories: recentStories,
        newUsers: recentUsers,
        storiesThisMonth: storiesSharedLast30Days,
      },
      growth: {
        storiesGrowth:
          totalStories > 0
            ? Math.round((recentStories / totalStories) * 100)
            : 0,
        usersGrowth:
          totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0,
        countriesGrowth: Math.max(
          activeCountries > 0
            ? Math.round((activeCountries / Math.max(totalCountries, 1)) * 100)
            : 0,
          5,
        ),
      },
    };

    res.json({
      status: "success",
      data: communityImpact,
    });
  } catch (error) {
    console.error("Community impact stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch community impact statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get trending authors
 * @route   GET /api/explore/trending-authors
 * @access  Public
 */
export const getTrendingAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 12, timeframe = "week" } = req.query;
    const skip = (page - 1) * limit;

    // Calculate date range for trending
    const now = new Date();
    let dateThreshold;
    switch (timeframe) {
      case "day":
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "week":
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Aggregate trending authors based on recent activity
    const trendingAuthors = await User.aggregate([
      {
        $match: {
          role: { $in: ["user", "admin"] },
          createdAt: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "author",
          as: "blogs",
          pipeline: [{ $match: { status: "published" } }],
        },
      },
      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "author",
          as: "recentBlogs",
          pipeline: [
            {
              $match: {
                status: "published",
                createdAt: { $gte: dateThreshold },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followed",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "user",
          as: "likes",
          pipeline: [{ $match: { createdAt: { $gte: dateThreshold } } }],
        },
      },
      {
        $addFields: {
          blogsCount: { $size: "$blogs" },
          recentBlogsCount: { $size: "$recentBlogs" },
          followersCount: { $size: "$followers" },
          recentLikesCount: { $size: "$likes" },
          trendingScore: {
            $add: [
              { $multiply: [{ $size: "$recentBlogs" }, 10] },
              { $multiply: [{ $size: "$likes" }, 2] },
              { $size: "$followers" },
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { recentBlogsCount: { $gt: 0 } },
            { followersCount: { $gt: 0 } },
          ],
        },
      },
      {
        $sort: { trendingScore: -1, followersCount: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          bio: 1,
          blogsCount: 1,
          followersCount: 1,
          likesCount: "$recentLikesCount",
          trendingScore: 1,
          createdAt: 1,
        },
      },
    ]);

    // Get total count for pagination
    const totalAuthors = await User.countDocuments({
      role: { $in: ["user", "admin"] },
    });

    const totalPages = Math.ceil(totalAuthors / limit);

    res.status(200).json({
      status: "success",
      data: {
        authors: trendingAuthors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAuthors,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting trending authors:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get trending authors",
    });
  }
};

/**
 * @desc    Get featured content
 * @route   GET /api/explore/featured-content
 * @access  Public
 */
export const getFeaturedContent = async (req, res) => {
  try {
    const { page = 1, limit = 6, type } = req.query;
    const skip = (page - 1) * limit;

    // Build match criteria
    const matchCriteria = {
      status: "published",
    };

    if (type && type !== "all") {
      matchCriteria.category = type;
    }

    // Get featured content based on engagement metrics
    const featuredContent = await Blog.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "comments",
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ["$authorInfo", 0] },
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          engagementScore: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 2] },
              { $multiply: [{ $size: "$comments" }, 3] },
              { $multiply: ["$viewsCount", 0.1] },
            ],
          },
        },
      },
      {
        $sort: { engagementScore: -1, createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          title: 1,
          summary: 1,
          content: { $substr: ["$content", 0, 200] },
          coverImage: 1,
          category: 1,
          tags: 1,
          viewsCount: 1,
          likesCount: 1,
          commentsCount: 1,
          createdAt: 1,
          author: {
            _id: "$author._id",
            username: "$author.username",
            firstName: "$author.firstName",
            lastName: "$author.lastName",
            avatar: "$author.avatar",
          },
        },
      },
    ]);

    const totalContent = await Blog.countDocuments(matchCriteria);
    const totalPages = Math.ceil(totalContent / limit);

    res.status(200).json({
      status: "success",
      data: {
        content: featuredContent,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalContent,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting featured content:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get featured content",
    });
  }
};

/**
 * @desc    Get popular tags
 * @route   GET /api/explore/popular-tags
 * @access  Public
 */
export const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const popularTags = await Blog.aggregate([
      {
        $match: {
          status: "published",
          tags: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          name: { $first: "$tags" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        tags: popularTags,
        total: popularTags.length,
      },
    });
  } catch (error) {
    console.error("Error getting popular tags:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get popular tags",
    });
  }
};

/**
 * @desc    Get recommended users
 * @route   GET /api/explore/recommended-users
 * @access  Public
 */
export const getRecommendedUsers = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const userId = req.user?.id;

    let matchCriteria = {
      role: { $in: ["user", "admin"] },
    };

    // Exclude current user if authenticated
    if (userId) {
      matchCriteria._id = { $ne: new mongoose.Types.ObjectId(userId) };
    }

    const recommendedUsers = await User.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "author",
          as: "blogs",
          pipeline: [{ $match: { status: "published" } }],
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followed",
          as: "followers",
        },
      },
      {
        $addFields: {
          blogsCount: { $size: "$blogs" },
          followersCount: { $size: "$followers" },
          recommendationScore: {
            $add: [
              { $multiply: [{ $size: "$blogs" }, 2] },
              { $size: "$followers" },
            ],
          },
        },
      },
      {
        $match: {
          $or: [{ blogsCount: { $gt: 0 } }, { followersCount: { $gt: 0 } }],
        },
      },
      {
        $sort: { recommendationScore: -1, createdAt: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          bio: 1,
          blogsCount: 1,
          followersCount: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        users: recommendedUsers,
        total: recommendedUsers.length,
      },
    });
  } catch (error) {
    console.error("Error getting recommended users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get recommended users",
    });
  }
};

/**
 * @desc    Get trending topics
 * @route   GET /api/explore/trending-topics
 * @access  Public
 */
export const getTrendingTopics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingTopics = await Blog.aggregate([
      {
        $match: {
          status: "published",
          createdAt: { $gte: sevenDaysAgo },
          tags: { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          name: { $first: "$tags" },
          recentPosts: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          count: 1,
          trending: true,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: trendingTopics,
    });
  } catch (error) {
    console.error("Error getting trending topics:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get trending topics",
    });
  }
};

/**
 * @desc    Search content (users, blogs, etc.)
 * @route   GET /api/explore/search
 * @access  Public
 */
export const searchContent = async (req, res) => {
  try {
    const {
      q: query,
      type = "all",
      page = 1,
      limit = 10,
      sortBy = "relevance",
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }

    const searchQuery = query.trim();
    const skip = (page - 1) * limit;

    let searchResults = {
      users: [],
      blogs: [],
      stories: [],
      dailydrip: [],
      total: 0,
    };

    // Search users if type is 'users' or 'all'
    if (type === "users" || type === "all") {
      const userSearch = {
        $or: [
          { username: { $regex: searchQuery, $options: "i" } },
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
          { bio: { $regex: searchQuery, $options: "i" } },
        ],
      };

      const users = await User.aggregate([
        { $match: userSearch },
        {
          $lookup: {
            from: "blogs",
            localField: "_id",
            foreignField: "author",
            as: "blogs",
            pipeline: [{ $match: { status: "published" } }],
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followed",
            as: "followers",
          },
        },
        {
          $addFields: {
            blogsCount: { $size: "$blogs" },
            followersCount: { $size: "$followers" },
            relevanceScore: {
              $add: [
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$username",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    10,
                    0,
                  ],
                },
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$firstName",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    8,
                    0,
                  ],
                },
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$lastName",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    8,
                    0,
                  ],
                },
                { $multiply: [{ $size: "$blogs" }, 2] },
                { $size: "$followers" },
              ],
            },
          },
        },
        {
          $sort:
            sortBy === "relevance"
              ? { relevanceScore: -1 }
              : { followersCount: -1, blogsCount: -1 },
        },
        ...(type === "users"
          ? [{ $skip: skip }, { $limit: parseInt(limit) }]
          : []),
        {
          $project: {
            username: 1,
            firstName: 1,
            lastName: 1,
            avatar: 1,
            bio: 1,
            blogsCount: 1,
            followersCount: 1,
            createdAt: 1,
          },
        },
      ]);

      searchResults.users = users;
    }

    // Search blogs if type is 'blogs' or 'all'
    if (type === "blogs" || type === "all") {
      const blogSearch = {
        status: "published",
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { summary: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
          { tags: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ],
      };

      const blogs = await Blog.aggregate([
        { $match: blogSearch },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "blog",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "blog",
            as: "comments",
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ["$authorInfo", 0] },
            likesCount: { $size: "$likes" },
            commentsCount: { $size: "$comments" },
            relevanceScore: {
              $add: [
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$title",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    10,
                    0,
                  ],
                },
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$summary",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    8,
                    0,
                  ],
                },
                { $multiply: [{ $size: "$likes" }, 2] },
                { $multiply: [{ $size: "$comments" }, 3] },
                { $multiply: ["$viewsCount", 0.1] },
              ],
            },
          },
        },
        {
          $sort:
            sortBy === "relevance" ? { relevanceScore: -1 } : { createdAt: -1 },
        },
        ...(type === "blogs"
          ? [{ $skip: skip }, { $limit: parseInt(limit) }]
          : []),
        {
          $project: {
            title: 1,
            summary: 1,
            content: { $substr: ["$content", 0, 200] },
            coverImage: 1,
            category: 1,
            tags: 1,
            viewsCount: 1,
            likesCount: 1,
            commentsCount: 1,
            createdAt: 1,
            author: {
              _id: "$author._id",
              username: "$author.username",
              firstName: "$author.firstName",
              lastName: "$author.lastName",
              avatar: "$author.avatar",
            },
          },
        },
      ]);

      searchResults.blogs = blogs;
    }

    // Search stories if type is 'stories' or 'all' (using blogs as stories for now)
    if (type === "stories" || type === "all") {
      // For now, use blogs as stories with story-specific filtering
      const storySearch = {
        status: "published",
        // Add story-specific filtering criteria if needed
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { summary: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
          { tags: { $regex: searchQuery, $options: "i" } },
        ],
      };

      const stories = await Blog.aggregate([
        { $match: storySearch },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ["$authorInfo", 0] },
            relevanceScore: {
              $add: [
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$title",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    10,
                    0,
                  ],
                },
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$summary",
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                    8,
                    0,
                  ],
                },
              ],
            },
          },
        },
        {
          $sort:
            sortBy === "relevance" ? { relevanceScore: -1 } : { createdAt: -1 },
        },
        ...(type === "stories"
          ? [{ $skip: skip }, { $limit: parseInt(limit) }]
          : []),
        {
          $project: {
            title: 1,
            summary: 1,
            content: { $substr: ["$content", 0, 200] },
            coverImage: 1,
            tags: 1,
            views: 1,
            likesCount: 1,
            createdAt: 1,
            author: {
              _id: "$author._id",
              username: "$author.username",
              firstName: "$author.firstName",
              lastName: "$author.lastName",
              avatar: "$author.avatar",
            },
          },
        },
      ]);

      searchResults.stories = stories;
    }

    // Search dailydrip if type is 'dailydrip' or 'all'
    if (type === "dailydrip" || type === "all") {
      // Placeholder for dailydrip search - can be implemented when dailydrip model is available
      searchResults.dailydrip = [];
    }

    // Apply pagination for specific type searches
    if (type === "users") {
      searchResults = {
        users: searchResults.users,
        total: searchResults.users.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(searchResults.users.length / limit),
          hasNextPage: searchResults.users.length === parseInt(limit),
          hasPrevPage: page > 1,
          limit: parseInt(limit),
        },
      };
    } else if (type === "blogs") {
      searchResults = {
        blogs: searchResults.blogs,
        total: searchResults.blogs.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(searchResults.blogs.length / limit),
          hasNextPage: searchResults.blogs.length === parseInt(limit),
          hasPrevPage: page > 1,
          limit: parseInt(limit),
        },
      };
    } else if (type === "stories") {
      searchResults = {
        stories: searchResults.stories,
        total: searchResults.stories.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(searchResults.stories.length / limit),
          hasNextPage: searchResults.stories.length === parseInt(limit),
          hasPrevPage: page > 1,
          limit: parseInt(limit),
        },
      };
    } else if (type === "dailydrip") {
      searchResults = {
        dailydrip: searchResults.dailydrip,
        total: searchResults.dailydrip.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(searchResults.dailydrip.length / limit),
          hasNextPage: searchResults.dailydrip.length === parseInt(limit),
          hasPrevPage: page > 1,
          limit: parseInt(limit),
        },
      };
    } else {
      // For 'all' type, return limited results
      searchResults = {
        users: searchResults.users.slice(0, 5),
        blogs: searchResults.blogs.slice(0, 5),
        stories: searchResults.stories.slice(0, 5),
        dailydrip: searchResults.dailydrip.slice(0, 5),
        total:
          searchResults.users.length +
          searchResults.blogs.length +
          searchResults.stories.length +
          searchResults.dailydrip.length,
      };
    }

    res.status(200).json({
      status: "success",
      data: searchResults,
    });
  } catch (error) {
    console.error("Error searching content:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to search content",
    });
  }
};
