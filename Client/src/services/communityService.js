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
      if (category) params.append("category", category);
      if (sortBy) params.append("sortBy", sortBy);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (search) params.append("search", search);
      if (tags && tags.length > 0) params.append("tags", tags.join(","));

      const response = await apiService.get(`${this.baseUrl}/posts?${params}`);

      if (response.status === "success") {
        return {
          posts: response.data.posts || [],
          hasMore: response.data.hasMore || false,
          total: response.data.total || 0,
          page: response.data.page || 1,
        };
      }

      throw new Error(response.message || "Failed to fetch posts");
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        posts: [],
        hasMore: false,
        total: 0,
        page: 1,
      };
    }
  }

  // Search posts
  async searchPosts(options = {}) {
    try {
      const {
        query,
        category,
        sortBy = "relevance",
        page = 1,
        limit = 20,
      } = options;

      // Validate query
      if (!query || query.trim().length < 2) {
        console.warn("Search query too short, returning empty results");
        return {
          posts: [],
          hasMore: false,
          total: 0,
        };
      }

      const params = new URLSearchParams();
      params.append("q", query.trim());
      if (category) params.append("category", category);
      if (sortBy) params.append("sortBy", sortBy);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await apiService.get(`${this.baseUrl}/search?${params}`);

      if (response.status === "success") {
        return {
          posts: response.data.posts || [],
          hasMore: response.data.hasMore || false,
          total: response.data.total || 0,
        };
      }

      throw new Error(response.message || "Failed to search posts");
    } catch (error) {
      console.error("Error searching posts:", error);

      // Check if it's a 404 (endpoint doesn't exist) and provide graceful fallback
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Community search endpoint not available, using fallback");
        return {
          posts: [],
          hasMore: false,
          total: 0,
        };
      }

      return {
        posts: [],
        hasMore: false,
        total: 0,
      };
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
      throw error;
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
      throw error;
    }
  }

  // Delete post
  async deletePost(postId) {
    try {
      const response = await apiService.delete(
        `${this.baseUrl}/posts/${postId}`,
      );

      if (response.status === "success") {
        return true;
      }

      throw new Error(response.message || "Failed to delete post");
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  // Get replies for a post
  async getReplies(postId, parentReplyId = null) {
    try {
      const params = new URLSearchParams();
      if (parentReplyId) params.append("parent", parentReplyId);

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
      return {
        replies: [],
        total: 0,
      };
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
      throw error;
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
      throw error;
    }
  }

  // Delete reply
  async deleteReply(replyId) {
    try {
      const response = await apiService.delete(
        `${this.baseUrl}/replies/${replyId}`,
      );

      if (response.status === "success") {
        return true;
      }

      throw new Error(response.message || "Failed to delete reply");
    } catch (error) {
      console.error("Error deleting reply:", error);
      throw error;
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
      throw error;
    }
  }

  // Toggle bookmark
  async toggleBookmark(postId) {
    try {
      const response = await apiService.post(
        `${this.baseUrl}/posts/${postId}/bookmark`,
      );

      if (response.status === "success") {
        return response.data.isBookmarked;
      }

      throw new Error(response.message || "Failed to toggle bookmark");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      throw error;
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

      // Return default categories if API fails
      return {
        categories: this.getDefaultCategories(),
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        categories: this.getDefaultCategories(),
      };
    }
  }

  // Get community statistics
  async getStats() {
    try {
      const response = await apiService.get(`${this.baseUrl}/stats`);

      if (response.status === "success") {
        return {
          stats: response.data.stats || this.getDefaultStats(),
        };
      }

      return {
        stats: this.getDefaultStats(),
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        stats: this.getDefaultStats(),
      };
    }
  }

  // Get trending posts
  async getTrendingPosts(limit = 10) {
    try {
      const response = await apiService.get(
        `${this.baseUrl}/trending?limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data.posts || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      return [];
    }
  }

  // Get user's bookmarked posts
  async getBookmarkedPosts(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const response = await apiService.get(
        `${this.baseUrl}/bookmarks?${params}`,
      );

      if (response.status === "success") {
        return {
          posts: response.data.posts || [],
          hasMore: response.data.hasMore || false,
          total: response.data.total || 0,
        };
      }

      return {
        posts: [],
        hasMore: false,
        total: 0,
      };
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
      return {
        posts: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  // Report post or reply
  async reportContent(targetId, type, reason, details = "") {
    try {
      const response = await apiService.post(`${this.baseUrl}/report`, {
        targetId,
        type, // "post" or "reply"
        reason,
        details,
      });

      if (response.status === "success") {
        return true;
      }

      throw new Error(response.message || "Failed to submit report");
    } catch (error) {
      console.error("Error reporting content:", error);
      throw error;
    }
  }

  // Helper methods for default data
  getDefaultCategories() {
    return [
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
      { id: "offtopic", name: "Off Topic", description: "Everything else" },
    ];
  }

  getDefaultStats() {
    return {
      totalPosts: 0,
      activePosts: 0,
      onlineUsers: 0,
      totalUsers: 0,
    };
  }

  // Utility method to format post content for display
  formatPostContent(content, maxLength = 300) {
    if (!content) return "";

    if (content.length <= maxLength) {
      return content;
    }

    return content.substring(0, maxLength) + "...";
  }

  // Utility method to extract mentions from content
  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  // Utility method to extract hashtags from content
  extractHashtags(content) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1]);
    }

    return hashtags;
  }
}

export const communityService = new CommunityService();
export default communityService;
