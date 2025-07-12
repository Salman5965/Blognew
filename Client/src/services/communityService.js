import apiService from "./api";

class CommunityService {
  constructor() {
    this.baseUrl = "/community";
  }

  // Get community posts with filters and pagination
  async getPosts(options = {}) {
    try {
      const {
        category,
        sortBy = "recent",
        page = 1,
        limit = 20,
        search,
        tags,
      } = options;

      const params = new URLSearchParams();
      if (category && category !== "all") params.append("category", category);
      if (sortBy) params.append("sortBy", sortBy);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (search) params.append("search", search);
      if (tags && tags.length > 0) params.append("tags", tags.join(","));

      const response = await apiService.get(`${this.baseUrl}/posts?${params}`);

      if (response.status === "success") {
        return {
          posts: response.data.posts || [],
          hasMore: response.data.pagination?.hasMore || false,
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
        };
      }

      throw new Error(response.message || "Failed to fetch posts");
    } catch (error) {
      console.error("Error fetching community posts:", error);
      throw new Error("Failed to load community posts");
    }
  }

  // Search community posts
  async searchPosts(query, options = {}) {
    // Prevent searching with empty queries to avoid 400 errors
    if (!query || query.trim().length < 2) {
      return {
        posts: [],
        total: 0,
        hasMore: false,
      };
    }

    try {
      const { category, sortBy = "relevance", page = 1, limit = 20 } = options;

      const params = new URLSearchParams();
      params.append("q", query.trim());
      if (category && category !== "all") params.append("category", category);
      if (sortBy) params.append("sortBy", sortBy);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await apiService.get(`${this.baseUrl}/search?${params}`);

      if (response.status === "success") {
        return {
          posts: response.data.posts || [],
          total: response.data.total || 0,
          hasMore: response.data.hasMore || false,
        };
      }

      throw new Error(response.message || "Search failed");
    } catch (error) {
      console.error("Error searching posts:", error);
      throw new Error("Failed to search posts");
    }
  }

  // Get single post with replies
  async getPost(postId) {
    try {
      const response = await apiService.get(`${this.baseUrl}/posts/${postId}`);

      if (response.status === "success") {
        return response.data.post;
      }

      throw new Error(response.message || "Failed to fetch post");
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  // Create new post
  async createPost(postData) {
    try {
      const response = await apiService.post(`${this.baseUrl}/posts`, postData);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to create post");
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response?.data?.errors) {
        throw new Error(
          error.response.data.errors.map((e) => e.msg).join(", "),
        );
      }
      throw new Error("Failed to create post");
    }
  }

  // Update post
  async updatePost(postId, updates) {
    try {
      const response = await apiService.put(
        `${this.baseUrl}/posts/${postId}`,
        updates,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to update post");
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error("Failed to update post");
    }
  }

  // Delete post
  async deletePost(postId) {
    try {
      const response = await apiService.delete(
        `${this.baseUrl}/posts/${postId}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to delete post");
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("Failed to delete post");
    }
  }

  // Get replies for a post
  async getReplies(postId, parentId = null) {
    try {
      const params = new URLSearchParams();
      if (parentId) params.append("parent", parentId);

      const response = await apiService.get(
        `${this.baseUrl}/posts/${postId}/replies?${params}`,
      );

      if (response.status === "success") {
        return {
          replies: response.data.replies || [],
          total: response.data.total || 0,
        };
      }

      throw new Error(response.message || "Failed to fetch replies");
    } catch (error) {
      console.error("Error fetching replies:", error);
      throw new Error("Failed to load replies");
    }
  }

  // Create reply
  async createReply(postId, replyData) {
    try {
      const response = await apiService.post(
        `${this.baseUrl}/posts/${postId}/replies`,
        replyData,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to create reply");
    } catch (error) {
      console.error("Error creating reply:", error);
      if (error.response?.data?.errors) {
        throw new Error(
          error.response.data.errors.map((e) => e.msg).join(", "),
        );
      }
      throw new Error("Failed to create reply");
    }
  }

  // Update reply
  async updateReply(replyId, updates) {
    try {
      const response = await apiService.put(
        `${this.baseUrl}/replies/${replyId}`,
        updates,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to update reply");
    } catch (error) {
      console.error("Error updating reply:", error);
      throw new Error("Failed to update reply");
    }
  }

  // Delete reply
  async deleteReply(replyId) {
    try {
      const response = await apiService.delete(
        `${this.baseUrl}/replies/${replyId}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to delete reply");
    } catch (error) {
      console.error("Error deleting reply:", error);
      throw new Error("Failed to delete reply");
    }
  }

  // Toggle reaction (like/emoji) on post or reply
  async toggleReaction(targetId, emoji, type = "post") {
    try {
      const endpoint =
        type === "post"
          ? `${this.baseUrl}/posts/${targetId}/reactions`
          : `${this.baseUrl}/replies/${targetId}/reactions`;

      const response = await apiService.post(endpoint, { emoji });

      if (response.status === "success") {
        return {
          isLiked: response.data.isLiked,
          count: response.data.count,
          reactions: response.data.reactions,
        };
      }

      throw new Error(response.message || "Failed to toggle reaction");
    } catch (error) {
      console.error("Error toggling reaction:", error);
      throw new Error("Failed to toggle reaction");
    }
  }

  // Toggle bookmark using the existing bookmark service
  async toggleBookmark(postId) {
    try {
      // Use the existing bookmark service endpoint
      const response = await apiService.post(`/bookmarks`, {
        itemId: postId,
        itemType: "post",
      });

      if (response.status === "success") {
        return response.data.isBookmarked;
      }

      throw new Error(response.message || "Failed to toggle bookmark");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      throw new Error("Failed to toggle bookmark");
    }
  }

  // Get categories
  async getCategories() {
    try {
      const response = await apiService.get(`${this.baseUrl}/categories`);

      if (response.status === "success") {
        return {
          categories: response.data.categories || this.getDefaultCategories(),
        };
      }

      throw new Error(response.message || "Failed to fetch categories");
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories
      return {
        categories: this.getDefaultCategories(),
      };
    }
  }

  // Get community statistics
  async getCommunityStats() {
    try {
      const response = await apiService.get(`${this.baseUrl}/stats`);

      if (response.status === "success") {
        return response.data.stats;
      }

      throw new Error(response.message || "Failed to fetch stats");
    } catch (error) {
<<<<<<< HEAD
      console.error("Failed to fetch community stats:", error);
      // Return empty data structure
      return {
        totalMembers: 0,
        totalPosts: 0,
        totalComments: 0,
        activeToday: 0,
      };
    }
  }

  // Get top community members/contributors
  async getTopMembers() {
    try {
      const response = await apiService.get("/community/top-members");
      return response;
    } catch (error) {
      console.error("Failed to fetch top members:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get recent community activity
  async getRecentActivity() {
    try {
      const response = await apiService.get("/community/recent-activity");
      return response;
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get community forums/channels
  async getForums() {
    try {
      const response = await apiService.get("/community/forums");
      return response;
    } catch (error) {
      console.error("Failed to fetch forums:", error);
      // Return empty data structure
      return {
        channels: [],
        totalChannels: 0,
        popularChannels: [],
      };
    }
  }

  // Get featured discussions
  async getFeaturedDiscussions() {
    try {
      const response = await apiService.get("/community/featured-discussions");
      return response;
    } catch (error) {
      console.error("Failed to fetch featured discussions:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get community leaderboard
  async getLeaderboard(timeframe = "month", limit = 10) {
    try {
      const response = await apiService.get(
        `/community/leaderboard?timeframe=${timeframe}&limit=${limit}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get user community stats
  async getUserCommunityStats(userId) {
    try {
      const response = await apiService.get(`/community/users/${userId}/stats`);
      return response;
    } catch (error) {
      console.error("Failed to fetch user community stats:", error);
      // Return empty data structure
      return {
        points: 0,
        rank: 0,
        postsCount: 0,
        commentsCount: 0,
        likesReceived: 0,
        level: "Member",
      };
    }
  }

  // Join a community channel
  async joinChannel(channelId) {
    try {
      const response = await apiService.post(
        `/community/channels/${channelId}/join`,
      );
      return response;
    } catch (error) {
      console.error("Failed to join channel:", error);
      throw error;
    }
  }

  // Leave a community channel
  async leaveChannel(channelId) {
    try {
      const response = await apiService.post(
        `/community/channels/${channelId}/leave`,
      );
      return response;
    } catch (error) {
      console.error("Failed to leave channel:", error);
      throw error;
    }
  }

  // Report inappropriate content
  async reportContent(contentId, contentType, reason) {
    try {
      const response = await apiService.post("/community/report", {
        contentId,
        contentType,
        reason,
      });
      return response;
    } catch (error) {
      console.error("Failed to report content:", error);
      throw error;
    }
  }

  // Search community content
  async searchCommunity(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);

      if (filters.type) params.append("type", filters.type);
      if (filters.channel) params.append("channel", filters.channel);
      if (filters.timeframe) params.append("timeframe", filters.timeframe);

      const response = await apiService.get(`/community/search?${params}`);
      return response;
    } catch (error) {
      console.error("Failed to search community:", error);
      // Return empty results
      return {
        results: [],
        total: 0,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
=======
      console.error("Error fetching stats:", error);
      throw new Error("Failed to load community statistics");
    }
  }

  // Helper method to get default categories
  getDefaultCategories() {
    return [
      {
        id: "all",
        name: "All Categories",
        description: "View all community posts",
      },
      {
        id: "general",
        name: "General Discussion",
        description: "General topics and discussions",
      },
      {
        id: "development",
        name: "Development",
        description: "Programming and development topics",
      },
      {
        id: "help",
        name: "Help & Support",
        description: "Get help with your questions",
      },
      {
        id: "career",
        name: "Career",
        description: "Career advice and opportunities",
      },
      {
        id: "offtopic",
        name: "Off Topic",
        description: "Everything else",
      },
    ];
>>>>>>> origin/main
  }
}

export const communityService = new CommunityService();
export default communityService;
