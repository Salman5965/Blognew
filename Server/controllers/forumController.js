import mongoose from "mongoose";
import ForumChannel from "../models/ForumChannel.js";
import ForumMessage from "../models/ForumMessage.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// Get all channels
export const getChannels = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let query = { isArchived: false };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const channels = await ForumChannel.find(query)
      .populate("createdBy", "username firstName lastName avatar")
      .populate("moderators", "username firstName lastName avatar")
      .sort({ isPinned: -1, lastActivity: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalChannels = await ForumChannel.countDocuments(query);

    // Mock additional data for demo
    const enhancedChannels = channels.map((channel) => ({
      ...channel.toObject(),
      onlineCount: Math.floor(Math.random() * 100) + 10,
      unreadCount: Math.floor(Math.random() * 20),
    }));

    res.status(200).json({
      status: "success",
      data: {
        channels: enhancedChannels,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalChannels / parseInt(limit)),
          totalChannels,
          hasNextPage: page * limit < totalChannels,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch channels",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get channel by ID
export const getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Find channel by ObjectId or name
    let channel;
    if (mongoose.Types.ObjectId.isValid(channelId)) {
      channel = await ForumChannel.findById(channelId);
    } else {
      channel = await ForumChannel.findOne({ name: channelId });
    }

    if (channel) {
      channel = await ForumChannel.findById(channel._id)
        .populate("createdBy", "username firstName lastName avatar")
        .populate("moderators", "username firstName lastName avatar");
    }

    if (!channel) {
      return res.status(404).json({
        status: "error",
        message: "Channel not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        ...channel.toObject(),
        onlineCount: Math.floor(Math.random() * 100) + 10,
      },
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch channel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create new channel
export const createChannel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, description, category, icon, isPrivate, allowedRoles } =
      req.body;

    // Check if channel name already exists
    const existingChannel = await ForumChannel.findOne({ name });
    if (existingChannel) {
      return res.status(400).json({
        status: "error",
        message: "Channel name already exists",
      });
    }

    const channel = new ForumChannel({
      name,
      description,
      category,
      icon: icon || "Hash",
      isPrivate: isPrivate || false,
      allowedRoles: allowedRoles || ["member"],
      createdBy: req.user.id,
      moderators: [req.user.id],
    });

    await channel.save();
    await channel.populate("createdBy", "username firstName lastName avatar");

    res.status(201).json({
      status: "success",
      data: channel,
      message: "Channel created successfully",
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create channel",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get messages in a channel
export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50, before } = req.query;

    // Verify channel exists - try to find by ObjectId first, then by name
    let channel;
    if (mongoose.Types.ObjectId.isValid(channelId)) {
      channel = await ForumChannel.findById(channelId);
    } else {
      // If not a valid ObjectId, try to find by name
      channel = await ForumChannel.findOne({ name: channelId });
    }

    if (!channel) {
      return res.status(404).json({
        status: "error",
        message: "Channel not found",
      });
    }

    let query = { channel: channel._id, isDeleted: false };

    // For pagination with "before" cursor
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ForumMessage.find(query)
      .populate("author", "username firstName lastName avatar role")
      .populate("replyTo", "username firstName lastName")
      .populate("parentMessage", "content author")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Reverse to get chronological order
    messages.reverse();

    res.status(200).json({
      status: "success",
      data: {
        messages,
        hasMore: messages.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching channel messages:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Send message to channel
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { channelId } = req.params;
    const { content, parentMessage, replyTo } = req.body;

    // Verify channel exists - try to find by ObjectId first, then by name
    let channel;
    if (mongoose.Types.ObjectId.isValid(channelId)) {
      channel = await ForumChannel.findById(channelId);
    } else {
      channel = await ForumChannel.findOne({ name: channelId });
    }

    if (!channel) {
      return res.status(404).json({
        status: "error",
        message: "Channel not found",
      });
    }

    const message = new ForumMessage({
      content,
      author: req.user.id,
      channel: channel._id,
      parentMessage: parentMessage || null,
      replyTo: replyTo || null,
    });

    await message.save();
    await message.populate("author", "username firstName lastName avatar role");
    if (replyTo) {
      await message.populate("replyTo", "username firstName lastName");
    }

    // Update channel activity and message count
    await channel.incrementMessageCount();

    res.status(201).json({
      status: "success",
      data: message,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    await message.addReaction(emoji, req.user.id);

    res.status(200).json({
      status: "success",
      data: message.reactions,
      message: "Reaction added successfully",
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add reaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Remove reaction from message
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    await message.removeReaction(emoji, req.user.id);

    res.status(200).json({
      status: "success",
      data: message.reactions,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to remove reaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get forum statistics
export const getForumStats = async (req, res) => {
  try {
    const totalChannels = await ForumChannel.countDocuments({
      isArchived: false,
    });
    const totalMessages = await ForumMessage.countDocuments({
      isDeleted: false,
    });
    const totalMembers = await User.countDocuments({ isActive: true });

    // Mock online members for demo
    const onlineMembers = Math.floor(Math.random() * 500) + 100;

    res.status(200).json({
      status: "success",
      data: {
        totalChannels,
        totalMessages,
        totalMembers,
        onlineMembers,
      },
    });
  } catch (error) {
    console.error("Error fetching forum stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch forum statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete message (moderator/admin only)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    // Check if user can delete (author, moderator, or admin)
    const canDelete =
      message.author.equals(req.user.id) ||
      req.user.role === "moderator" ||
      req.user.role === "admin";

    if (!canDelete) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient permissions to delete this message",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user.id;
    await message.save();

    res.status(200).json({
      status: "success",
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
