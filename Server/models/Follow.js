import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for efficient queries
followSchema.index({ follower: 1, createdAt: -1 });
followSchema.index({ following: 1, createdAt: -1 });

// Prevent self-following
followSchema.pre("save", function (next) {
  if (this.follower.equals(this.following)) {
    const error = new Error("Users cannot follow themselves");
    return next(error);
  }
  next();
});

// Static methods for common queries
followSchema.statics.getFollowers = function (userId, options = {}) {
  const { page = 1, limit = 20, populate = true } = options;
  const skip = (page - 1) * limit;

  let query = this.find({ following: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (populate) {
    query = query.populate(
      "follower",
      "username avatar bio firstName lastName",
    );
  }

  return query;
};

followSchema.statics.getFollowing = function (userId, options = {}) {
  const { page = 1, limit = 20, populate = true } = options;
  const skip = (page - 1) * limit;

  let query = this.find({ follower: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (populate) {
    query = query.populate(
      "following",
      "username avatar bio firstName lastName",
    );
  }

  return query;
};

followSchema.statics.getFollowStats = function (userId) {
  return Promise.all([
    this.countDocuments({ following: userId }), // followers count
    this.countDocuments({ follower: userId }), // following count
    this.findMutualFollows(userId),
  ]).then(([followersCount, followingCount, mutualFollowsCount]) => ({
    followersCount,
    followingCount,
    mutualFollowsCount,
  }));
};

followSchema.statics.isFollowing = function (followerId, followingId) {
  return this.exists({ follower: followerId, following: followingId });
};

followSchema.statics.findMutualFollows = function (userId) {
  return this.aggregate([
    // Get users that current user follows
    { $match: { follower: new mongoose.Types.ObjectId(userId) } },
    // Join with follows where these users follow back
    {
      $lookup: {
        from: "follows",
        let: { followingId: "$following" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$follower", "$$followingId"] },
                  { $eq: ["$following", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: "mutualFollow",
      },
    },
    // Filter only mutual follows
    { $match: { mutualFollow: { $size: 1 } } },
    // Count them
    { $count: "mutualFollowsCount" },
  ]).then((result) => result[0]?.mutualFollowsCount || 0);
};

// Instance methods
followSchema.methods.toJSON = function () {
  const follow = this.toObject();
  return follow;
};

export default mongoose.model("Follow", followSchema);
