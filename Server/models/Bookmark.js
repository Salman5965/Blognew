import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    // Optional categorization
    collection: {
      type: String,
      default: "default",
      trim: true,
      maxlength: 50,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique bookmarks per user per blog
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

// Index for efficient queries
bookmarkSchema.index({ user: 1, collection: 1, createdAt: -1 });
bookmarkSchema.index({ blog: 1, createdAt: -1 });

// Static methods
bookmarkSchema.statics.getUserBookmarks = function (userId, options = {}) {
  const { page = 1, limit = 20, collection = null } = options;
  const skip = (page - 1) * limit;

  let query = { user: userId };
  if (collection && collection !== "all") {
    query.collection = collection;
  }

  return this.find(query)
    .populate(
      "blog",
      "title slug coverImage excerpt author tags createdAt views likeCount",
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

bookmarkSchema.statics.getUserCollections = function (userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$collection",
        count: { $sum: 1 },
        lastUpdated: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

bookmarkSchema.statics.isBookmarkedBy = function (blogId, userId) {
  return this.exists({ blog: blogId, user: userId });
};

bookmarkSchema.statics.toggleBookmark = async function (
  blogId,
  userId,
  collection = "default",
) {
  const existingBookmark = await this.findOne({ blog: blogId, user: userId });

  if (existingBookmark) {
    // Remove bookmark
    await existingBookmark.deleteOne();
    return { bookmarked: false };
  } else {
    // Add bookmark
    const newBookmark = new this({
      blog: blogId,
      user: userId,
      collection,
    });
    await newBookmark.save();
    return { bookmarked: true, collection };
  }
};

bookmarkSchema.statics.getBookmarkCount = function (blogId) {
  return this.countDocuments({ blog: blogId });
};

// Instance methods
bookmarkSchema.methods.updateCollection = function (newCollection) {
  this.collection = newCollection;
  return this.save();
};

bookmarkSchema.methods.addNotes = function (notes) {
  this.notes = notes;
  return this.save();
};

bookmarkSchema.methods.toJSON = function () {
  const bookmark = this.toObject();
  return bookmark;
};

export default mongoose.model("Bookmark", bookmarkSchema);
