import mongoose from "mongoose";

const forumMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumChannel",
      required: true,
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumMessage",
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file", "link"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        filename: String,
        size: Number,
        mimetype: String,
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for reply count
forumMessageSchema.virtual("replyCount", {
  ref: "ForumMessage",
  localField: "_id",
  foreignField: "parentMessage",
  count: true,
});

// Index for efficient queries
forumMessageSchema.index({ channel: 1, createdAt: -1 });
forumMessageSchema.index({ author: 1, createdAt: -1 });
forumMessageSchema.index({ parentMessage: 1, createdAt: 1 });
forumMessageSchema.index({ isPinned: -1, createdAt: -1 });

// Text search index
forumMessageSchema.index({ content: "text" });

// Static method to get messages by channel
forumMessageSchema.statics.getByChannel = function (channelId, options = {}) {
  const {
    page = 1,
    limit = 50,
    includeDeleted = false,
    parentOnly = false,
  } = options;

  const query = {
    channel: channelId,
    ...(includeDeleted ? {} : { isDeleted: false }),
    ...(parentOnly ? { parentMessage: null } : {}),
  };

  return this.find(query)
    .populate("author", "username firstName lastName avatar role isOnline")
    .populate("replyTo", "username firstName lastName")
    .populate("reactions.users", "username")
    .populate("parentMessage", "content author")
    .sort({ isPinned: -1, createdAt: 1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();
};

// Method to add reaction
forumMessageSchema.methods.addReaction = function (emoji, userId) {
  const existingReaction = this.reactions.find((r) => r.emoji === emoji);

  if (existingReaction) {
    if (!existingReaction.users.includes(userId)) {
      existingReaction.users.push(userId);
      existingReaction.count += 1;
    }
  } else {
    this.reactions.push({
      emoji,
      users: [userId],
      count: 1,
    });
  }

  return this.save();
};

// Method to remove reaction
forumMessageSchema.methods.removeReaction = function (emoji, userId) {
  const reactionIndex = this.reactions.findIndex((r) => r.emoji === emoji);

  if (reactionIndex !== -1) {
    const reaction = this.reactions[reactionIndex];
    reaction.users = reaction.users.filter((id) => !id.equals(userId));
    reaction.count = reaction.users.length;

    if (reaction.count === 0) {
      this.reactions.splice(reactionIndex, 1);
    }
  }

  return this.save();
};

// Pre-save middleware to extract mentions
forumMessageSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    // Extract @mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push(match[1]);
    }

    // This would need to be enhanced to convert usernames to user IDs
    // For now, we'll leave mentions as an array to be populated by the controller
  }
  next();
});

export default mongoose.model("ForumMessage", forumMessageSchema);
