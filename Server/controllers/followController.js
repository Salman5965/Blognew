import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { validationResult } from "express-validator";

// Toggle follow/unfollow
export const toggleFollow = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    // Prevent self-following
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        status: "error",
        message: "You cannot follow yourself",
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.deleteOne();

      // Update user stats
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $inc: { "stats.followingCount": -1 },
        }),
        User.findByIdAndUpdate(targetUserId, {
          $inc: { "stats.followersCount": -1 },
        }),
      ]);

      res.status(200).json({
        status: "success",
        message: "User unfollowed successfully",
        data: {
          isFollowing: false,
          followersCount: Math.max(0, targetUser.stats.followersCount - 1),
        },
      });
    } else {
      // Follow
      const newFollow = new Follow({
        follower: currentUserId,
        following: targetUserId,
      });
      await newFollow.save();

      // Update user stats
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
          $inc: { "stats.followingCount": 1 },
        }),
        User.findByIdAndUpdate(targetUserId, {
          $inc: { "stats.followersCount": 1 },
        }),
      ]);

      // Create notification
      try {
        await Notification.createFollowNotification(
          currentUserId,
          targetUserId,
        );
      } catch (notifError) {
        console.warn(
          "Failed to create follow notification:",
          notifError.message,
        );
      }

      res.status(201).json({
        status: "success",
        message: "User followed successfully",
        data: {
          isFollowing: true,
          followersCount: targetUser.stats.followersCount + 1,
        },
      });
    }
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update follow status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check if current user is following target user
export const getFollowStatus = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    res.status(200).json({
      status: "success",
      data: {
        isFollowing: !!existingFollow,
      },
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get follow status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user's followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const skip = (page - 1) * limit;
    const followers = await Follow.find({ following: userId })
      .populate(
        "follower",
        "username firstName lastName avatar bio stats.followersCount",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFollowers = await Follow.countDocuments({ following: userId });

    res.status(200).json({
      status: "success",
      data: {
        followers: followers.map((follow) => follow.follower),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFollowers / limit),
          totalItems: totalFollowers,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalFollowers,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get followers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user's following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const skip = (page - 1) * limit;
    const following = await Follow.find({ follower: userId })
      .populate(
        "following",
        "username firstName lastName avatar bio stats.followersCount",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFollowing = await Follow.countDocuments({ follower: userId });

    res.status(200).json({
      status: "success",
      data: {
        following: following.map((follow) => follow.following),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFollowing / limit),
          totalItems: totalFollowing,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalFollowing,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get following",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get follow statistics for a user
export const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        followersCount,
        followingCount,
        mutualFollowsCount: 0, // Simplified for now
      },
    });
  } catch (error) {
    console.error("Get follow stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get follow statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get follow suggestions for current user
export const getFollowSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get users that current user is not following and exclude self
    const currentlyFollowing = await Follow.find({
      follower: currentUserId,
    }).select("following");
    const followingIds = currentlyFollowing.map((f) => f.following);
    followingIds.push(currentUserId); // Exclude self

    // Find suggested users - simplified logic
    const suggestions = await User.find({
      _id: { $nin: followingIds },
      isActive: true,
    })
      .select(
        "username firstName lastName avatar bio stats.followersCount stats.blogsCount",
      )
      .sort({ "stats.followersCount": -1 })
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        suggestions,
      },
    });
  } catch (error) {
    console.error("Get follow suggestions error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get follow suggestions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get mutual follows between current user and target user
export const getMutualFollows = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    // Get users that both current user and target user follow
    const [currentUserFollowing, targetUserFollowing] = await Promise.all([
      Follow.find({ follower: currentUserId }).select("following"),
      Follow.find({ follower: targetUserId }).select("following"),
    ]);

    const currentFollowingIds = currentUserFollowing.map((f) =>
      f.following.toString(),
    );
    const targetFollowingIds = targetUserFollowing.map((f) =>
      f.following.toString(),
    );

    const mutualFollowingIds = currentFollowingIds.filter((id) =>
      targetFollowingIds.includes(id),
    );

    const mutualUsers = await User.find({
      _id: { $in: mutualFollowingIds },
    })
      .select("username firstName lastName avatar bio stats.followersCount")
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        mutualFollows: mutualUsers,
        count: mutualFollowingIds.length,
      },
    });
  } catch (error) {
    console.error("Get mutual follows error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get mutual follows",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
