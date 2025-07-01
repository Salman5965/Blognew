import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    // Social links
    socialLinks: {
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      website: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    // Privacy settings
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    privacySettings: {
      showEmail: { type: Boolean, default: false },
      showFollowers: { type: Boolean, default: true },
      showFollowing: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
      allowFollow: { type: Boolean, default: true },
    },
    // Online status
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Statistics (denormalized for performance)
    stats: {
      blogsCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
    },
    // Account preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: { type: Boolean, default: true },
      newsletter: {
        type: Boolean,
        default: false,
      },
      marketingEmails: { type: Boolean, default: false },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: { type: String, default: "en" },
    },
    // Moderation
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedUntil: Date,
    suspensionReason: String,
    warningsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim() || this.username;
});

// Virtual for blog count
userSchema.virtual("blogCount", {
  ref: "Blog",
  localField: "_id",
  foreignField: "author",
  count: true,
});

// Indexes for better query performance and search
userSchema.index({ createdAt: -1 });
userSchema.index({ username: "text", firstName: "text", lastName: "text" });
userSchema.index({ "stats.followersCount": -1 });
userSchema.index({ lastSeen: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update lastSeen when user is active
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
  this.isOnline = true;
  return this.save();
};

// Set user offline
userSchema.methods.setOffline = function () {
  this.isOnline = false;
  return this.save();
};

// Update user statistics
userSchema.methods.updateStats = async function (field, increment = 1) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += increment;
    await this.save();
  }
};

// Check if user can be messaged
userSchema.methods.canBeMessaged = function (byUser) {
  if (!this.privacySettings.allowMessages) return false;
  if (this.profileVisibility === "private") {
    // This would need additional logic to check if users follow each other
    return false; // Simplified for now
  }
  return true;
};

// Instance method to get safe user data (without sensitive info)
userSchema.methods.getSafeUserData = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    bio: this.bio,
    avatar: this.avatar,
    coverImage: this.coverImage,
    role: this.role,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    socialLinks: this.socialLinks,
    profileVisibility: this.profileVisibility,
    privacySettings: this.privacySettings,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    stats: this.stats,
    preferences: this.preferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

// Static method to search users - simplified to avoid query planning issues
userSchema.statics.searchUsers = function (query, options = {}) {
  const { page = 1, limit = 20, excludeIds = [] } = options;
  const skip = (page - 1) * limit;

  let searchQuery = {
    _id: { $nin: excludeIds },
  };

  if (query && query.trim()) {
    searchQuery.$or = [
      { username: { $regex: query.trim(), $options: "i" } },
      { firstName: { $regex: query.trim(), $options: "i" } },
      { lastName: { $regex: query.trim(), $options: "i" } },
    ];
  }

  return this.find(searchQuery)
    .select("username firstName lastName avatar bio")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const User = mongoose.model("User", userSchema);

export default User;
