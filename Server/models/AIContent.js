import mongoose from "mongoose";

const aiContentSchema = new mongoose.Schema(
  {
    sourceUrl: {
      type: String,
      required: [true, "Source URL is required"],
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ["news", "rss", "api", "manual"],
      required: [true, "Source type is required"],
    },
    originalTitle: {
      type: String,
      required: [true, "Original title is required"],
      trim: true,
    },
    originalContent: {
      type: String,
      required: [true, "Original content is required"],
    },
    category: {
      type: String,
      enum: ["news", "technology", "space", "ocean", "nature", "travel"],
      required: [true, "Category is required"],
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    generatedTitle: {
      type: String,
      trim: true,
    },
    generatedContent: {
      type: String,
    },
    generatedExcerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    generatedTags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    aiModel: {
      type: String,
      default: "gpt-3.5-turbo",
    },
    status: {
      type: String,
      enum: ["pending", "generated", "published", "failed", "rejected"],
      default: "pending",
    },
    publishedBlogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
    scheduledPublishAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    metadata: {
      wordCount: Number,
      readTime: Number,
      sourcePublishDate: Date,
      authorName: String,
      sourceWebsite: String,
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    humanReviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
aiContentSchema.index({ status: 1 });
aiContentSchema.index({ category: 1 });
aiContentSchema.index({ scheduledPublishAt: 1 });
aiContentSchema.index({ publishedAt: -1 });
aiContentSchema.index({ qualityScore: -1 });
aiContentSchema.index({ sourceType: 1 });

// Virtual for days since creation
aiContentSchema.virtual("daysSinceCreation").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get content ready for publishing
aiContentSchema.statics.getReadyForPublishing = function () {
  return this.find({
    status: "generated",
    scheduledPublishAt: { $lte: new Date() },
    qualityScore: { $gte: 70 },
  }).sort({ qualityScore: -1, createdAt: 1 });
};

// Static method to get pending content by category
aiContentSchema.statics.getPendingByCategory = function (category) {
  return this.find({
    status: "pending",
    category: category,
  }).sort({ createdAt: 1 });
};

// Instance method to calculate quality score
aiContentSchema.methods.calculateQualityScore = function () {
  let score = 0;

  // Content length score (20 points)
  const contentLength = this.generatedContent?.length || 0;
  if (contentLength >= 500) score += 20;
  else if (contentLength >= 300) score += 15;
  else if (contentLength >= 200) score += 10;
  else if (contentLength >= 100) score += 5;

  // Title quality score (15 points)
  const titleLength = this.generatedTitle?.length || 0;
  if (titleLength >= 30 && titleLength <= 60) score += 15;
  else if (titleLength >= 20 && titleLength <= 80) score += 10;
  else if (titleLength >= 10) score += 5;

  // Excerpt quality score (15 points)
  const excerptLength = this.generatedExcerpt?.length || 0;
  if (excerptLength >= 100 && excerptLength <= 200) score += 15;
  else if (excerptLength >= 50 && excerptLength <= 250) score += 10;
  else if (excerptLength >= 20) score += 5;

  // Tags score (10 points)
  const tagsCount = this.generatedTags?.length || 0;
  if (tagsCount >= 3 && tagsCount <= 7) score += 10;
  else if (tagsCount >= 2) score += 7;
  else if (tagsCount >= 1) score += 3;

  // Keywords score (10 points)
  const keywordsCount = this.keywords?.length || 0;
  if (keywordsCount >= 5) score += 10;
  else if (keywordsCount >= 3) score += 7;
  else if (keywordsCount >= 1) score += 3;

  // Freshness score (15 points)
  const daysSinceSource = this.metadata?.sourcePublishDate
    ? Math.floor(
        (Date.now() - this.metadata.sourcePublishDate) / (1000 * 60 * 60 * 24),
      )
    : 30;
  if (daysSinceSource <= 1) score += 15;
  else if (daysSinceSource <= 3) score += 12;
  else if (daysSinceSource <= 7) score += 8;
  else if (daysSinceSource <= 14) score += 5;

  // Source credibility score (15 points)
  const credibleSources = [
    "nasa.gov",
    "nature.com",
    "science.org",
    "bbc.com",
    "reuters.com",
    "ap.org",
    "nationalgeographic.com",
    "smithsonianmag.com",
    "spacex.com",
    "esa.int",
  ];
  const sourceWebsite = this.metadata?.sourceWebsite?.toLowerCase() || "";
  if (credibleSources.some((source) => sourceWebsite.includes(source))) {
    score += 15;
  } else if (sourceWebsite.includes(".edu") || sourceWebsite.includes(".gov")) {
    score += 12;
  } else if (sourceWebsite.includes(".org")) {
    score += 8;
  } else {
    score += 3;
  }

  this.qualityScore = Math.min(score, 100);
  return this.qualityScore;
};

// Pre-save middleware to calculate quality score
aiContentSchema.pre("save", function (next) {
  if (
    this.isModified("generatedContent") ||
    this.isModified("generatedTitle")
  ) {
    this.calculateQualityScore();
  }
  next();
});

const AIContent = mongoose.model("AIContent", aiContentSchema);

export default AIContent;
