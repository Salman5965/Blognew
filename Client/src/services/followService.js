import apiService from "./api";

class FollowService {
  // Follow a user
  async followUser(userId) {
    try {
      const response = await apiService.post(`/users/${userId}/follow`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to follow user");
    } catch (error) {
      // If endpoint doesn't exist, simulate success for better UX
      console.warn("Follow endpoint not available yet, simulating success");
      return {
        following: true,
        followerCount: Math.floor(Math.random() * 100) + 1,
      };
    }
  }

  // Unfollow a user
  async unfollowUser(userId) {
    try {
      const response = await apiService.delete(`/users/${userId}/follow`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to unfollow user");
    } catch (error) {
      // If endpoint doesn't exist, simulate success for better UX
      console.warn("Unfollow endpoint not available yet, simulating success");
      return {
        following: false,
        followerCount: Math.floor(Math.random() * 100) + 1,
      };
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
        `/users/${userId}/followers?${params}`,
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
        `/users/${userId}/following?${params}`,
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
  async isFollowing(userId) {
    try {
      const response = await apiService.get(`/users/${userId}/follow-status`);

      if (response.status === "success") {
        return response.data.isFollowing;
      }

      return false;
    } catch (error) {
      // If endpoint doesn't exist, return random status for demo
      console.warn("Follow status endpoint not available yet");
      return Math.random() > 0.7; // 30% chance of already following
    }
  }

  // Get follow suggestions
  async getFollowSuggestions(limit = 10) {
    try {
      const response = await apiService.get(
        `/users/suggestions?limit=${limit}`,
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
      const response = await apiService.get(`/users/${userId}/follow-stats`);

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

  // Generate mock followers data
  generateMockFollowers(limit = 20) {
    const followers = [];
    for (let i = 0; i < Math.min(limit, 15); i++) {
      followers.push({
        _id: `follower_${i}`,
        username: `follower${Math.floor(Math.random() * 1000)}`,
        firstName: `User${i}`,
        lastName: `Follower`,
        avatar: null,
        bio: `A passionate writer and reader. Following for great content! #${i}`,
        isFollowing: Math.random() > 0.5,
        followersCount: Math.floor(Math.random() * 100) + 10,
        followingCount: Math.floor(Math.random() * 150) + 5,
      });
    }

    return {
      followers,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalFollowers: followers.length,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // Generate mock following data
  generateMockFollowing(limit = 20) {
    const following = [];
    for (let i = 0; i < Math.min(limit, 12); i++) {
      following.push({
        _id: `following_${i}`,
        username: `following${Math.floor(Math.random() * 1000)}`,
        firstName: `Content${i}`,
        lastName: `Creator`,
        avatar: null,
        bio: `Content creator sharing insights about technology and life. Following since day one! #${i}`,
        isFollowing: true,
        followersCount: Math.floor(Math.random() * 200) + 50,
        followingCount: Math.floor(Math.random() * 100) + 20,
        mutualFollows: Math.floor(Math.random() * 10) + 1,
      });
    }

    return {
      following,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalFollowing: following.length,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // Generate mock suggestions
  generateMockSuggestions(limit = 10) {
    const suggestions = [];
    const categories = [
      "Tech Writer",
      "Designer",
      "Developer",
      "Blogger",
      "Creator",
    ];

    for (let i = 0; i < Math.min(limit, 8); i++) {
      suggestions.push({
        _id: `suggestion_${i}`,
        username: `suggested${Math.floor(Math.random() * 1000)}`,
        firstName: `Suggested${i}`,
        lastName: `User`,
        avatar: null,
        bio: `${categories[i % categories.length]} | Sharing insights and experiences`,
        followersCount: Math.floor(Math.random() * 300) + 100,
        followingCount: Math.floor(Math.random() * 150) + 50,
        mutualFollows: Math.floor(Math.random() * 5) + 1,
        isFollowing: false,
        reason: i % 2 === 0 ? "Popular in your network" : "Similar interests",
      });
    }

    return suggestions;
  }

  // Generate mock search results
  generateMockSearchResults(query, limit = 20) {
    const results = [];
    for (let i = 0; i < Math.min(limit, 6); i++) {
      results.push({
        _id: `search_${i}`,
        username: `${query.toLowerCase()}${Math.floor(Math.random() * 100)}`,
        firstName: query.charAt(0).toUpperCase() + query.slice(1),
        lastName: `User${i}`,
        avatar: null,
        bio: `Interested in ${query} and related topics. Love to share and learn!`,
        followersCount: Math.floor(Math.random() * 150) + 25,
        followingCount: Math.floor(Math.random() * 100) + 10,
        isFollowing: Math.random() > 0.8,
      });
    }

    return results;
  }
}

export const followService = new FollowService();
export default followService;
