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

      // Check if API service returned a 404 error object
      if (response._isError && response.status === 404) {
        console.warn("Community posts endpoint not available, using mock data");
        return {
          posts: this.getMockPosts(),
          hasMore: false,
          total: 2, // Number of mock posts
          page: 1,
        };
      }

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

      // Check if it's a 404 (endpoint doesn't exist) and provide graceful fallback
      // Handle different error formats from axios and custom API errors
      const is404Error =
        error.response?.status === 404 ||
        error.status === 404 ||
        error.message?.includes("Not Found") ||
        error.message?.includes("404") ||
        (error.code && error.code.includes("404"));

      if (is404Error) {
        console.warn("Community posts endpoint not available, using mock data");
        return {
          posts: this.getMockPosts(),
          hasMore: false,
          total: 2, // Number of mock posts
          page: 1,
        };
      }

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
      // Handle 404 error gracefully when API endpoint doesn't exist
      if (error.response?.status === 404 || error.status === 404) {
        console.warn(
          "Create post API endpoint not available, using mock response",
        );
        // Return mock created post
        return {
          post: {
            _id: `mock_${Date.now()}`,
            title: postData.title,
            content: postData.content,
            category: postData.category,
            tags: postData.tags || [],
            author: {
              _id: "current_user",
              username: "You",
              avatar: null,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            replies: 0,
            views: 0,
            isLiked: false,
            isBookmarked: false,
            status: "published",
          },
        };
      }

      console.error("Error creating post:", error);
      throw new Error("Post creation temporarily unavailable");
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
      // Handle 404 error gracefully when API endpoint doesn't exist
      if (error.response?.status === 404 || error.status === 404) {
        console.warn(
          "Create reply API endpoint not available, using mock response",
        );
        // Return mock created reply
        return {
          reply: {
            _id: `mock_reply_${Date.now()}`,
            content: replyData.content,
            parentId: replyData.parentId || null,
            author: {
              _id: "current_user",
              username: "You",
              avatar: null,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            replies: [],
            isLiked: false,
            level: replyData.parentId ? 2 : 1,
          },
        };
      }

      console.error("Error creating reply:", error);
      throw new Error("Reply creation temporarily unavailable");
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
      // Handle 404 error gracefully when API endpoint doesn't exist
      if (error.response?.status === 404 || error.status === 404) {
        console.warn(
          "Reaction API endpoint not available, using mock behavior",
        );
        // Return mock reaction state
        return {
          isLiked: Math.random() > 0.5,
          count: Math.floor(Math.random() * 20),
          reactions: { [emoji]: Math.floor(Math.random() * 10) },
        };
      }

      console.error("Error toggling reaction:", error);
      throw new Error("Reaction feature temporarily unavailable");
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
      // Handle 404 error gracefully when API endpoint doesn't exist
      if (error.response?.status === 404 || error.status === 404) {
        console.warn(
          "Bookmark API endpoint not available, using mock behavior",
        );
        // Return a mock toggle state
        return Math.random() > 0.5; // Simulate toggle
      }

      console.error("Error toggling bookmark:", error);
      throw new Error("Bookmark feature temporarily unavailable");
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
      // Silently handle 404 errors for missing endpoints
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn(
          "Community categories endpoint not available, using defaults",
        );
      } else {
        console.error("Error fetching categories:", error);
      }
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
          stats: response.data.stats || this.getMockStats(),
        };
      }

      return {
        stats: this.getMockStats(),
      };
    } catch (error) {
      // Silently handle 404 errors for missing endpoints
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Community stats endpoint not available, using mock data");
      } else {
        console.error("Error fetching stats:", error);
      }
      return {
        stats: this.getMockStats(),
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

  // Mock data for development/fallback
  getMockPosts() {
    return [
      {
        _id: "mock-1",
        title: "Welcome to the Community!",
        content:
          "This is a sample post to demonstrate the community features. The backend API is not yet available, but you can see how the interface works.",
        author: {
          _id: "user-1",
          username: "developer",
          firstName: "Community",
          lastName: "Admin",
          avatar: null,
          role: "admin",
        },
        category: "general",
        createdAt: new Date().toISOString(),
        reactions: [{ emoji: "👍", count: 5, users: [] }],
        replyCount: 3,
        views: 42,
        tags: ["welcome", "community"],
        isPinned: true,
      },
      {
        _id: "mock-2",
        title: "How to get started with development?",
        content:
          "I'm new to programming and would love some advice on where to start. What programming language should I learn first?",
        author: {
          _id: "user-2",
          username: "newbie",
          firstName: "New",
          lastName: "Developer",
          avatar: null,
          role: "user",
        },
        category: "help",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reactions: [{ emoji: "👍", count: 8, users: [] }],
        replyCount: 12,
        views: 156,
        tags: ["beginner", "advice"],
        isPinned: false,
      },
    ];
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

  getMockStats() {
    return {
      totalPosts: 42,
      activePosts: 8,
      onlineUsers: 12,
      totalUsers: 156,
    };
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
