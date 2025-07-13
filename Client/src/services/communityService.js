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
      return response;
    } catch (error) {
      console.error("Failed to fetch community posts:", error);
      return {
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
        },
        hasMore: false,
      };
    }
  }

  // Search community posts
  async searchPosts(options = {}) {
    try {
      const {
        query,
        category,
        sortBy = "recent",
        page = 1,
        limit = 20,
      } = options;

      const params = new URLSearchParams();
      if (query) params.append("search", query);
      if (category && category !== "all") params.append("category", category);
      if (sortBy) params.append("sortBy", sortBy);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await apiService.get(`${this.baseUrl}/search?${params}`);
      return response;
    } catch (error) {
      console.error("Failed to search community posts:", error);
      return {
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
        },
        hasMore: false,
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
      console.error("Failed to fetch community stats:", error);
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
      return [];
    }
  }

  // Get community categories
  async getCategories() {
    try {
      const response = await apiService.get(`${this.baseUrl}/categories`);
      if (response.status === "success" && response.data.categories) {
        return {
          categories: response.data.categories,
        };
      }
      throw new Error(response.message || "Failed to fetch categories");
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Return default categories as fallback
      return {
        categories: this.getDefaultCategories(),
      };
    }
  }

  // Helper method to get default categories
  getDefaultCategories() {
    return [
      {
        id: "general",
        name: "General Discussion",
        description: "General community discussions",
      },
      {
        id: "announcements",
        name: "Announcements",
        description: "Official announcements and updates",
      },
      {
        id: "help",
        name: "Help & Support",
        description: "Get help from the community",
      },
      {
        id: "feedback",
        name: "Feedback",
        description: "Share your feedback and suggestions",
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
export default communityService;
