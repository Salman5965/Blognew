import { PAGINATION } from "@/utils/constant";
import apiService from "./api";

class ExploreService {
  async getTrendingAuthors(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 12));

      if (options.timeframe) params.append("timeframe", options.timeframe);
      if (options.category) params.append("category", options.category);

      const response = await apiService.get(
        `/explore/trending-authors?${params}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch trending authors");
    } catch (error) {
      // Silently handle 404s and provide mock data
      if (error.response?.status === 404) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.error("Error fetching trending authors:", error);
      }

      // Return mock trending authors data
      return {
        authors: [
          {
            _id: "author1",
            username: "alice_writes",
            firstName: "Alice",
            lastName: "Johnson",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            bio: "Tech writer and blogger passionate about AI and machine learning",
            stats: {
              followersCount: 2847,
              blogsCount: 94,
              totalViews: 125000,
            },
            isFollowing: false,
            trending: true,
          },
          {
            _id: "author2",
            username: "dev_chronicles",
            firstName: "Bob",
            lastName: "Smith",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            bio: "Full-stack developer sharing coding tips and best practices",
            stats: {
              followersCount: 1923,
              blogsCount: 67,
              totalViews: 89000,
            },
            isFollowing: false,
            trending: true,
          },
          {
            _id: "author3",
            username: "design_guru",
            firstName: "Sarah",
            lastName: "Davis",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            bio: "UX/UI designer creating beautiful and functional experiences",
            stats: {
              followersCount: 3245,
              blogsCount: 52,
              totalViews: 156000,
            },
            isFollowing: true,
            trending: true,
          },
        ],
        pagination: {
          currentPage: options.page || 1,
          totalPages: 1,
          totalAuthors: 3,
          hasNextPage: false,
          hasPrevPage: false,
          limit: options.limit || 12,
        },
      };
    }
  }

  async getFeaturedContent(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 6));

      if (options.type) params.append("type", options.type);

      const response = await apiService.get(
        `/explore/featured-content?${params}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch featured content");
    } catch (error) {
      console.error("Error fetching featured content:", error);
      return {
        content: [],
        pagination: {
          currentPage: options.page || 1,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async getPopularTags(limit = 20) {
    try {
      const response = await apiService.get(
        `/explore/popular-tags?limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data.tags || [];
      }

      throw new Error(response.message || "Failed to fetch popular tags");
    } catch (error) {
      console.error("Error fetching popular tags:", error);
      return [];
    }
  }

  async getRecommendedUsers(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 8));

      const response = await apiService.get(
        `/explore/recommended-users?${params}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch recommended users");
    } catch (error) {
      console.error("Error fetching recommended users:", error);
      return {
        users: [],
        pagination: {
          currentPage: options.page || 1,
          totalPages: 0,
          totalUsers: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async getTrendingTopics(limit = 10) {
    try {
      const response = await apiService.get(
        `/explore/trending-topics?limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data.topics || [];
      }

      throw new Error(response.message || "Failed to fetch trending topics");
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      return [];
    }
  }

  async searchUsers(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 10));

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await apiService.get(`/explore/search-users?${params}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to search users");
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        users: [],
        pagination: {
          currentPage: options.page || 1,
          totalPages: 0,
          totalUsers: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  async getExploreStats() {
    try {
      const response = await apiService.get("/explore/stats");

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch explore stats");
    } catch (error) {
      console.error("Error fetching explore stats:", error);
      return {
        totalAuthors: 0,
        totalBlogs: 0,
        activeUsers: 0,
        popularTopics: 0,
      };
    }
  }
}

export const exploreService = new ExploreService();
export default exploreService;
