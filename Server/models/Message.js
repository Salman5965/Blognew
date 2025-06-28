import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    // For non-text messages
    fileUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    fileMimeType: {
      type: String,
      trim: true,
    },
    // Message status
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deliveredTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Message metadata
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Reply functionality
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // Reactions
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ "readBy.user": 1 });

// Static methods
messageSchema.statics.getConversationMessages = function (
  conversationId,
  options = {},
) {
  const { page = 1, limit = 50, before = null, after = null } = options;
  const skip = (page - 1) * limit;

  let query = { conversation: conversationId, isDeleted: false };

  if (before) {
    query.createdAt = { $lt: before };
  }
  if (after) {
    query.createdAt = { $gt: after };
  }

  return this.find(query)
    .populate("sender", "username avatar firstName lastName")
    .populate("replyTo", "content sender")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

messageSchema.statics.getUnreadCount = function (
  userId,
  conversationId = null,
) {
  let query = {
    "readBy.user": { $ne: userId },
    sender: { $ne: userId },
    isDeleted: false,
  };

  if (conversationId) {
    query.conversation = conversationId;
  }

  return this.countDocuments(query);
};

messageSchema.statics.markAsRead = function (conversationId, userId) {
  return this.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      "readBy.user": { $ne: userId },
      isDeleted: false,
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: new Date(),
        },
      },
    },
  );
};

messageSchema.statics.markAsDelivered = function (conversationId, userId) {
  return this.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      "deliveredTo.user": { $ne: userId },
      isDeleted: false,
    },
    {
      $push: {
        deliveredTo: {
          user: userId,
          deliveredAt: new Date(),
        },
      },
    },
  );
};

// Instance methods
messageSchema.methods.markAsReadBy = function (userId) {
  if (!this.readBy.some((read) => read.user.equals(userId))) {
    this.readBy.push({
      user: userId,
      readAt: new Date(),
    });
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.addReaction = function (userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter((r) => !r.user.equals(userId));

  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji,
    createdAt: new Date(),
  });

  return this.save();
};

messageSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter((r) => !r.user.equals(userId));
  return this.save();
};

messageSchema.methods.edit = function (newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

messageSchema.methods.softDelete = function (userId = null) {
  if (userId) {
    // Delete for specific user
    if (!this.deletedFor.includes(userId)) {
      this.deletedFor.push(userId);
    }
  } else {
    // Delete for everyone
    this.isDeleted = true;
    this.deletedAt = new Date();
  }
  return this.save();
};

messageSchema.methods.isReadBy = function (userId) {
  return this.readBy.some((read) => read.user.equals(userId));
};

messageSchema.methods.isDeliveredTo = function (userId) {
  return this.deliveredTo.some((delivered) => delivered.user.equals(userId));
};

messageSchema.methods.toJSON = function () {
  const message = this.toObject();
  return message;
};

export default mongoose.model("Message", messageSchema);
