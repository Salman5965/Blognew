import mongoose from "mongoose";

const forumChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: ["general", "development", "help", "career", "offtopic"],
    },
    icon: {
      type: String,
      default: "Hash",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    allowedRoles: [
      {
        type: String,
        enum: ["member", "moderator", "admin"],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberCount: {
      type: Number,
      default: 0,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    rules: [
      {
        title: String,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for online members count (would be calculated in real-time)
forumChannelSchema.virtual("onlineCount").get(function () {
  return Math.floor(Math.random() * 100) + 10; // Mock data
});

// Index for searching channels
forumChannelSchema.index({ name: "text", description: "text" });
forumChannelSchema.index({ category: 1, isArchived: 1 });
forumChannelSchema.index({ isPinned: -1, lastActivity: -1 });

// Static method to get channels by category
forumChannelSchema.statics.getByCategory = function (category, options = {}) {
  const { includeArchived = false, page = 1, limit = 20 } = options;

  const query = {
    category,
    ...(includeArchived ? {} : { isArchived: false }),
  };

  return this.find(query)
    .populate("createdBy", "username firstName lastName avatar")
    .populate("moderators", "username firstName lastName avatar")
    .sort({ isPinned: -1, lastActivity: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();
};

// Update last activity
forumChannelSchema.methods.updateActivity = function () {
  this.lastActivity = new Date();
  return this.save();
};

// Increment message count
forumChannelSchema.methods.incrementMessageCount = function () {
  this.messageCount += 1;
  this.lastActivity = new Date();
  return this.save();
};

export default mongoose.model("ForumChannel", forumChannelSchema);
