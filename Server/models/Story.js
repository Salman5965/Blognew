import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Story title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Story content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Story author is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    category: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    readTime: {
      type: Number, // in minutes
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for like count
storySchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

// Indexes for better query performance
storySchema.index({ author: 1 });
storySchema.index({ isPublished: 1 });
storySchema.index({ publishedAt: -1 });
storySchema.index({ tags: 1 });
storySchema.index({ category: 1 });
storySchema.index({ title: "text", content: "text" });

// Pre-save middleware to set published date and calculate read time
storySchema.pre("save", function (next) {
  // Set published date when story is published
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Calculate read time (average reading speed: 200 words per minute)
  if (this.isModified("content")) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200) || 1;
  }

  next();
});

// Instance method to check if user liked the story
storySchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.user.toString() === userId.toString());
};

// Instance method to toggle like
storySchema.methods.toggleLike = function (userId) {
  const existingLikeIndex = this.likes.findIndex(
    (like) => like.user.toString() === userId.toString(),
  );

  if (existingLikeIndex > -1) {
    // Unlike
    this.likes.splice(existingLikeIndex, 1);
    return false;
  } else {
    // Like
    this.likes.push({ user: userId });
    return true;
  }
};

// Static method to get popular stories
storySchema.statics.getPopularStories = function (limit = 10) {
  return this.find({ isPublished: true })
    .populate("author", "username firstName lastName avatar")
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

const Story = mongoose.model("Story", storySchema);

export default Story;
