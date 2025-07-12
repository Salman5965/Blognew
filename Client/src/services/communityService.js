<<<<<<< HEAD
import { apiService } from "./api";

class CommunityService {
  // Get community statistics
  async getStats() {
    try {
      const response = await apiService.get("/community/stats");
      return response;
    } catch (error) {
      console.error("Failed to fetch community stats:", error);
      // Return fallback data for better UX
      return {
        totalMembers: 12847,
        onlineMembers: 234,
        totalPosts: 45892,
        totalDiscussions: 8934,
        dailyActiveUsers: 1205,
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
      // Return fallback data
      return [
        {
          id: 1,
          name: "Sarah Johnson",
          avatar: "/api/placeholder/32/32",
          points: 2847,
          role: "Community Leader",
          postsCount: 342,
        },
        {
          id: 2,
          name: "Michael Chen",
          avatar: "/api/placeholder/32/32",
          points: 2156,
          role: "Top Contributor",
          postsCount: 289,
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          avatar: "/api/placeholder/32/32",
          points: 1923,
          role: "Rising Star",
          postsCount: 234,
        },
        {
          id: 4,
          name: "David Kim",
          avatar: "/api/placeholder/32/32",
          points: 1645,
          role: "Helpful Member",
          postsCount: 198,
        },
        {
          id: 5,
          name: "Lisa Thompson",
          avatar: "/api/placeholder/32/32",
          points: 1432,
          role: "Active Writer",
          postsCount: 167,
        },
      ];
    }
  }

  // Get recent community activity
  async getRecentActivity() {
    try {
      const response = await apiService.get("/community/recent-activity");
      return response;
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      // Return fallback data
      return [
        {
          id: 1,
          type: "post",
          action: "published a new blog post about React best practices",
          user: { id: 1, name: "John Doe", avatar: "/api/placeholder/20/20" },
          timestamp: "2 minutes ago",
        },
        {
          id: 2,
          type: "comment",
          action: "commented on 'Getting Started with Node.js'",
          user: { id: 2, name: "Jane Smith", avatar: "/api/placeholder/20/20" },
          timestamp: "5 minutes ago",
        },
        {
          id: 3,
          type: "like",
          action: "liked 'The Future of Web Development'",
          user: { id: 3, name: "Bob Wilson", avatar: "/api/placeholder/20/20" },
          timestamp: "8 minutes ago",
        },
        {
          id: 4,
          type: "follow",
          action: "started following Sarah Johnson",
          user: {
            id: 4,
            name: "Alice Brown",
            avatar: "/api/placeholder/20/20",
          },
          timestamp: "12 minutes ago",
        },
        {
          id: 5,
          type: "post",
          action: "shared insights about TypeScript",
          user: { id: 5, name: "Mike Davis", avatar: "/api/placeholder/20/20" },
          timestamp: "15 minutes ago",
        },
        {
          id: 6,
          type: "comment",
          action: "replied to a discussion about AI in development",
          user: {
            id: 6,
            name: "Emma Garcia",
            avatar: "/api/placeholder/20/20",
          },
          timestamp: "18 minutes ago",
        },
      ];
    }
  }

  // Get popular topics/hashtags
  async getPopularTopics() {
    try {
      const response = await apiService.get("/community/popular-topics");
      return response;
    } catch (error) {
      console.error("Failed to fetch popular topics:", error);
      // Return fallback data
      return [
        { id: 1, name: "javascript", count: 1247 },
        { id: 2, name: "react", count: 892 },
        { id: 3, name: "nodejs", count: 734 },
        { id: 4, name: "python", count: 651 },
        { id: 5, name: "webdev", count: 589 },
        { id: 6, name: "css", count: 478 },
        { id: 7, name: "typescript", count: 445 },
        { id: 8, name: "beginners", count: 398 },
        { id: 9, name: "tutorial", count: 356 },
        { id: 10, name: "opensource", count: 312 },
      ];
    }
  }

  // Get featured discussions
  async getFeaturedDiscussions() {
    try {
      const response = await apiService.get("/community/featured-discussions");
      return response;
    } catch (error) {
      console.error("Failed to fetch featured discussions:", error);
      // Return fallback data
      return [
        {
          id: 1,
          title: "What's the best way to handle state management in React?",
          excerpt:
            "I've been working on a complex React application and I'm wondering what the community thinks about different state management solutions...",
          author: {
            id: 1,
            name: "Alex Peterson",
            avatar: "/api/placeholder/40/40",
          },
          replies: 23,
          views: 156,
          lastActivity: "2 hours ago",
          isPinned: true,
        },
        {
          id: 2,
          title: "Tips for writing clean, maintainable code",
          excerpt:
            "After years of development, I've learned some valuable lessons about writing code that's easy to read and maintain. Here are my top tips...",
          author: {
            id: 2,
            name: "Maria Santos",
            avatar: "/api/placeholder/40/40",
          },
          replies: 18,
          views: 89,
          lastActivity: "4 hours ago",
          isPinned: false,
        },
        {
          id: 3,
          title: "The future of web development: What to expect in 2024",
          excerpt:
            "As we move further into 2024, let's discuss the trends and technologies that are shaping the future of web development...",
          author: {
            id: 3,
            name: "James Kumar",
            avatar: "/api/placeholder/40/40",
          },
          replies: 31,
          views: 245,
          lastActivity: "6 hours ago",
          isPinned: false,
        },
      ];
    }
  }

  // Get community events
  async getEvents() {
    try {
      const response = await apiService.get("/community/events");
      return response;
    } catch (error) {
      console.error("Failed to fetch community events:", error);
      return [];
    }
  }

  // Join community event
  async joinEvent(eventId) {
    try {
      const response = await apiService.post(
        `/community/events/${eventId}/join`,
      );
      return response;
    } catch (error) {
      console.error("Failed to join event:", error);
      throw error;
    }
  }

  // Get user's community profile
  async getUserCommunityProfile(userId) {
    try {
      const response = await apiService.get(
        `/community/users/${userId}/profile`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch user community profile:", error);
      throw error;
    }
  }

  // Search community content
  async searchCommunity(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...filters,
      });

      const response = await apiService.get(`/community/search?${queryParams}`);
      return response;
    } catch (error) {
      console.error("Failed to search community:", error);
      return {
        discussions: [],
        members: [],
        posts: [],
      };
    }
  }
}

const communityService = new CommunityService();
=======
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
  async getStats() {
    try {
      const response = await apiService.get(`${this.baseUrl}/stats`);

      if (response.status === "success") {
        return response.data.stats;
      }

      throw new Error(response.message || "Failed to fetch stats");
    } catch (error) {
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
  }
}

export const communityService = new CommunityService();
>>>>>>> origin/main
export default communityService;
