import apiService from "./api";

class FollowService {
  constructor() {
    this._cachedFollowStatus = new Map();
    this._cacheTimeout = 60000; // 1 minute cache
  }

  // Follow a user
  async followUser(userId) {
    try {
      const response = await apiService.post(`/follow/${userId}/toggle`);

      if (response.status === "success") {
        // Clear cache after follow action
        this._cachedFollowStatus.delete(userId);
        return response.data;
      }

      throw new Error(response.message || "Failed to follow user");
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  }

  // Unfollow a user
  async unfollowUser(userId) {
    try {
      const response = await apiService.post(`/follow/${userId}/toggle`);

      if (response.status === "success") {
        // Clear cache after unfollow action
        this._cachedFollowStatus.delete(userId);
        return response.data;
      }

      throw new Error(response.message || "Failed to unfollow user");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  }

  // Get user's followers
  async getFollowers(userId, query = {}) {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.search) params.append("search", query.search);

      const response = await apiService.get(
        `/follow/${userId}/followers?${params}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch followers");
    } catch (error) {
      console.error("Error fetching followers:", error);
      return {
        followers: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalFollowers: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  // Get user's following
  async getFollowing(userId, query = {}) {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.search) params.append("search", query.search);

      const response = await apiService.get(
        `/follow/${userId}/following?${params}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch following");
    } catch (error) {
      console.error("Error fetching following:", error);
      return {
        following: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalFollowing: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  // Check if current user is following a specific user
  async isFollowing(userId, useCache = true) {
    // Return cached value if available and recent
    if (useCache && this._cachedFollowStatus.has(userId)) {
      return this._cachedFollowStatus.get(userId);
    }

    try {
      const response = await apiService.get(`/follow/${userId}/status`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.status === "success") {
        const isFollowing = response.data.isFollowing;
        // Cache the result
        this._cachedFollowStatus.set(userId, isFollowing);
        setTimeout(() => {
          this._cachedFollowStatus.delete(userId);
        }, this._cacheTimeout);
        return isFollowing;
      }

      return false;
    } catch (error) {
      console.error("Error checking follow status:", error);

      // Handle rate limit errors gracefully
      if (
        error.status === 429 ||
        error.message?.includes("Too many requests")
      ) {
        console.warn("Rate limited on follow status check, using cached data");
        // Return cached value or false
        return this._cachedFollowStatus.get(userId) ?? false;
      }

      return false; // Default to not following
    }
  }

  // Get follow suggestions
  async getFollowSuggestions(limit = 10) {
    try {
      const response = await apiService.get(
        `/follow/suggestions?limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data.users;
      }

      throw new Error(response.message || "Failed to fetch suggestions");
    } catch (error) {
      console.error("Error fetching follow suggestions:", error);
      return [];
    }
  }

  // Search users for following
  async searchUsers(query, limit = 20) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      params.append("limit", String(limit));

      const response = await apiService.get(`/users/search?${params}`);

      if (response.status === "success") {
        return response.data.users;
      }

      throw new Error(response.message || "Failed to search users");
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  // Get user's follow stats
  async getFollowStats(userId) {
    try {
      const response = await apiService.get(`/follow/${userId}/stats`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch follow stats");
    } catch (error) {
      console.error("Error fetching follow stats:", error);
      return {
        followersCount: 0,
        followingCount: 0,
        mutualFollowsCount: 0,
      };
    }
  }
}

export const followService = new FollowService();
export default followService;
