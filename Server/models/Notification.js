import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "follow",
        "like",
        "comment",
        "blog_published",
        "message",
        "mention",
        "system",
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // Reference to related entities
    entityType: {
      type: String,
      enum: ["Blog", "Comment", "User", "Message", "Conversation"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    // Notification metadata
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
    },
    // Priority level
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    // Action buttons for rich notifications
    actions: [
      {
        type: {
          type: String,
          enum: ["link", "accept", "decline", "view", "reply"],
        },
        label: String,
        url: String,
        data: mongoose.Schema.Types.Mixed,
      },
    ],
    // Delivery tracking
    deliveryChannels: {
      inApp: {
        delivered: { type: Boolean, default: true },
        deliveredAt: { type: Date, default: Date.now },
      },
      email: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
        emailId: String,
      },
      push: {
        delivered: { type: Boolean, default: false },
        deliveredAt: Date,
        pushId: String,
      },
    },
    // Expiration
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isArchived: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });

// Static methods
notificationSchema.statics.getUserNotifications = function (
  userId,
  options = {},
) {
  const {
    page = 1,
    limit = 20,
    type = null,
    unreadOnly = false,
    includeArchived = false,
  } = options;
  const skip = (page - 1) * limit;

  let query = { recipient: userId };

  if (type) {
    query.type = type;
  }
  if (unreadOnly) {
    query.isRead = false;
  }
  if (!includeArchived) {
    query.isArchived = false;
  }

  return this.find(query)
    .populate("sender", "username avatar firstName lastName")
    .populate("entityId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false,
  });
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() },
  );
};

notificationSchema.statics.createNotification = function (data) {
  const notification = new this(data);

  // Set expiration based on type
  if (!notification.expiresAt) {
    const expirationDays = {
      follow: 30,
      like: 7,
      comment: 14,
      blog_published: 30,
      message: 1,
      mention: 14,
      system: 90,
    };

    const days = expirationDays[notification.type] || 30;
    notification.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  return notification.save();
};

// Helper method to create specific notification types
notificationSchema.statics.createFollowNotification = function (
  followerId,
  followingId,
) {
  return this.createNotification({
    recipient: followingId,
    sender: followerId,
    type: "follow",
    title: "New Follower",
    message: "started following you",
    entityType: "User",
    entityId: followerId,
  });
};

notificationSchema.statics.createLikeNotification = function (
  userId,
  blogId,
  blogTitle,
  authorId,
) {
  if (userId.toString() === authorId.toString()) return Promise.resolve(); // Don't notify self

  return this.createNotification({
    recipient: authorId,
    sender: userId,
    type: "like",
    title: "Blog Liked",
    message: `liked your blog "${blogTitle}"`,
    entityType: "Blog",
    entityId: blogId,
  });
};

notificationSchema.statics.createCommentNotification = function (
  userId,
  blogId,
  blogTitle,
  authorId,
) {
  if (userId.toString() === authorId.toString()) return Promise.resolve(); // Don't notify self

  return this.createNotification({
    recipient: authorId,
    sender: userId,
    type: "comment",
    title: "New Comment",
    message: `commented on your blog "${blogTitle}"`,
    entityType: "Blog",
    entityId: blogId,
  });
};

notificationSchema.statics.createMessageNotification = function (
  senderId,
  recipientId,
  conversationId,
) {
  return this.createNotification({
    recipient: recipientId,
    sender: senderId,
    type: "message",
    title: "New Message",
    message: "sent you a message",
    entityType: "Conversation",
    entityId: conversationId,
    priority: "high",
  });
};

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.archive = function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

notificationSchema.methods.markEmailDelivered = function (emailId) {
  this.deliveryChannels.email.delivered = true;
  this.deliveryChannels.email.deliveredAt = new Date();
  this.deliveryChannels.email.emailId = emailId;
  return this.save();
};

notificationSchema.methods.markPushDelivered = function (pushId) {
  this.deliveryChannels.push.delivered = true;
  this.deliveryChannels.push.deliveredAt = new Date();
  this.deliveryChannels.push.pushId = pushId;
  return this.save();
};

notificationSchema.methods.toJSON = function () {
  const notification = this.toObject();
  return notification;
};

export default mongoose.model("Notification", notificationSchema);
