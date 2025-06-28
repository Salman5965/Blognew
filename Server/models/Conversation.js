import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // For group conversations
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Message settings
    settings: {
      muteNotifications: {
        type: Boolean,
        default: false,
      },
      deleteAfter: {
        type: Number, // hours
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ type: 1, isActive: 1 });

// Ensure participants array has valid length
conversationSchema.pre("save", function (next) {
  if (this.type === "direct" && this.participants.length !== 2) {
    return next(
      new Error("Direct conversations must have exactly 2 participants"),
    );
  }
  if (this.type === "group" && this.participants.length < 2) {
    return next(
      new Error("Group conversations must have at least 2 participants"),
    );
  }

  // Remove duplicates
  this.participants = [...new Set(this.participants.map((p) => p.toString()))];
  next();
});

// Static methods
conversationSchema.statics.findByParticipants = function (participantIds) {
  const sortedIds = participantIds.sort();
  return this.findOne({
    participants: { $all: sortedIds, $size: sortedIds.length },
    type: "direct",
    isActive: true,
  })
    .populate(
      "participants",
      "username avatar firstName lastName isOnline lastSeen",
    )
    .populate("lastMessage");
};

conversationSchema.statics.getUserConversations = function (
  userId,
  options = {},
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return this.find({
    participants: userId,
    isActive: true,
  })
    .populate(
      "participants",
      "username avatar firstName lastName isOnline lastSeen",
    )
    .populate("lastMessage")
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(limit);
};

conversationSchema.statics.createOrGetDirect = async function (
  participant1,
  participant2,
) {
  // Try to find existing conversation
  let conversation = await this.findByParticipants([
    participant1,
    participant2,
  ]);

  if (!conversation) {
    // Create new conversation
    conversation = new this({
      participants: [participant1, participant2],
      type: "direct",
    });
    await conversation.save();
    await conversation.populate(
      "participants",
      "username avatar firstName lastName isOnline lastSeen",
    );
  }

  return conversation;
};

// Instance methods
conversationSchema.methods.addParticipant = async function (userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    await this.save();
  }
  return this;
};

conversationSchema.methods.removeParticipant = async function (userId) {
  this.participants = this.participants.filter((p) => !p.equals(userId));
  if (this.participants.length === 0) {
    this.isActive = false;
  }
  await this.save();
  return this;
};

conversationSchema.methods.updateLastActivity = async function (
  messageId = null,
) {
  this.lastActivity = new Date();
  if (messageId) {
    this.lastMessage = messageId;
  }
  await this.save();
  return this;
};

conversationSchema.methods.getOtherParticipant = function (currentUserId) {
  if (this.type === "direct") {
    return this.participants.find((p) => !p._id.equals(currentUserId));
  }
  return null;
};

conversationSchema.methods.toJSON = function () {
  const conversation = this.toObject();
  return conversation;
};

export default mongoose.model("Conversation", conversationSchema);
