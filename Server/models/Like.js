import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "laugh", "angry", "sad"],
      default: "like",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique likes per user per blog
likeSchema.index({ user: 1, blog: 1 }, { unique: true });

// Index for efficient queries
likeSchema.index({ blog: 1, createdAt: -1 });
likeSchema.index({ user: 1, createdAt: -1 });

// Static methods
likeSchema.statics.getLikeCount = function (blogId) {
  return this.countDocuments({ blog: blogId });
};

likeSchema.statics.getBlogLikes = function (blogId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return this.find({ blog: blogId })
    .populate("user", "username avatar firstName lastName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

likeSchema.statics.getUserLikes = function (userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return this.find({ user: userId })
    .populate("blog", "title slug coverImage excerpt author tags createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

likeSchema.statics.isLikedBy = function (blogId, userId) {
  return this.exists({ blog: blogId, user: userId });
};

likeSchema.statics.toggleLike = async function (blogId, userId, type = "like") {
  const existingLike = await this.findOne({ blog: blogId, user: userId });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
    return { liked: false, type: null };
  } else {
    // Like
    const newLike = new this({ blog: blogId, user: userId, type });
    await newLike.save();
    return { liked: true, type };
  }
};

// Instance methods
likeSchema.methods.toJSON = function () {
  const like = this.toObject();
  return like;
};

export default mongoose.model("Like", likeSchema);
