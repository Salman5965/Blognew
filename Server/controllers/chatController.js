import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { validationResult } from "express-validator";

// Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const conversations = await Conversation.getUserConversations(userId, {
      page,
      limit,
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.getUnreadCount(
          userId,
          conversation._id,
        );
        const otherParticipant = conversation.getOtherParticipant(userId);

        return {
          ...conversation.toJSON(),
          unreadCount,
          participantName:
            otherParticipant?.fullName || otherParticipant?.username,
          participantAvatar: otherParticipant?.avatar,
          participantId: otherParticipant?._id,
          isOnline: otherParticipant?.isOnline,
          lastMessage: conversation.lastMessage
            ? {
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: conversation.lastMessage.sender,
              }
            : null,
        };
      }),
    );

    const totalConversations = await Conversation.countDocuments({
      participants: userId,
      isActive: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        conversations: conversationsWithUnread,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalConversations / limit),
          totalItems: totalConversations,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalConversations,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get conversations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create or get existing conversation
export const createConversation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { participantId } = req.body;
    const currentUserId = req.user.id;

    // Prevent conversation with self
    if (currentUserId === participantId) {
      return res.status(400).json({
        status: "error",
        message: "Cannot create conversation with yourself",
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(participantId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if user can be messaged
    if (!otherUser.canBeMessaged(req.user)) {
      return res.status(403).json({
        status: "error",
        message: "This user does not allow messages",
      });
    }

    // Create or get existing conversation
    const conversation = await Conversation.createOrGetDirect(
      currentUserId,
      participantId,
    );
    const otherParticipant = conversation.getOtherParticipant(currentUserId);

    res.status(200).json({
      status: "success",
      data: {
        conversation: {
          ...conversation.toJSON(),
          participantName:
            otherParticipant?.fullName || otherParticipant?.username,
          participantAvatar: otherParticipant?.avatar,
          participantId: otherParticipant?._id,
          isOnline: otherParticipant?.isOnline,
        },
      },
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create conversation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before ? new Date(req.query.before) : null;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    const messages = await Message.getConversationMessages(conversationId, {
      page,
      limit,
      before,
    });

    // Mark messages as delivered
    await Message.markAsDelivered(conversationId, userId);

    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });

    res.status(200).json({
      status: "success",
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalItems: totalMessages,
          itemsPerPage: limit,
          hasNextPage: page * limit < totalMessages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Send a message
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

    const { conversationId } = req.params;
    const { content, type = "text" } = req.body;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true,
    }).populate(
      "participants",
      "username firstName lastName avatar canBeMessaged",
    );

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      type,
    });

    await message.save();
    await message.populate("sender", "username firstName lastName avatar");

    // Update conversation last activity
    await conversation.updateLastActivity(message._id);

    // Create notifications for other participants
    const otherParticipants = conversation.participants.filter(
      (p) => !p._id.equals(userId),
    );

    await Promise.all(
      otherParticipants.map((participant) =>
        Notification.createMessageNotification(
          userId,
          participant._id,
          conversationId,
        ),
      ),
    );

    // Emit socket event for real-time messaging
    req.io?.to(`conversation:${conversationId}`).emit("newMessage", {
      message: message.toJSON(),
      conversationId,
    });

    res.status(201).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Mark conversation as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({
        status: "error",
        message: "Conversation not found",
      });
    }

    // Mark all messages as read
    await Message.markAsRead(conversationId, userId);

    res.status(200).json({
      status: "success",
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to mark messages as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Message.getUnreadCount(userId);

    res.status(200).json({
      status: "success",
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get unread count",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { deleteForEveryone = false } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    // Verify user can delete this message
    if (!message.sender.equals(userId)) {
      return res.status(403).json({
        status: "error",
        message: "You can only delete your own messages",
      });
    }

    if (deleteForEveryone) {
      await message.softDelete();
    } else {
      await message.softDelete(userId);
    }

    // Emit socket event for real-time update
    req.io?.to(`conversation:${message.conversation}`).emit("messageDeleted", {
      messageId,
      deletedBy: userId,
      deleteForEveryone,
    });

    res.status(200).json({
      status: "success",
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Message not found",
      });
    }

    // Verify user can edit this message
    if (!message.sender.equals(userId)) {
      return res.status(403).json({
        status: "error",
        message: "You can only edit your own messages",
      });
    }

    // Check if message is too old to edit (e.g., 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return res.status(400).json({
        status: "error",
        message: "Message is too old to edit",
      });
    }

    await message.edit(content.trim());
    await message.populate("sender", "username firstName lastName avatar");

    // Emit socket event for real-time update
    req.io?.to(`conversation:${message.conversation}`).emit("messageEdited", {
      message: message.toJSON(),
    });

    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to edit message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
