import { apiService } from "./api";
import { PAGINATION } from "@/utils/constant";

class ExploreService {
  // Get trending authors
  async getTrendingAuthors(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 12));
      params.append("timeframe", options.timeframe || "week");

      const response = await apiService.get(
        `/explore/trending-authors?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching trending authors:", error.message);
    }

    return {
      authors: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalAuthors: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // Get featured blogs
  async getFeaturedBlogs(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 6));

      const response = await apiService.get(
        `/explore/featured-blogs?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching featured blogs:", error.message);
    }

    return {
      blogs: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // Get popular tags
  async getPopularTags(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("limit", String(options.limit || 20));
      params.append("timeframe", options.timeframe || "month");

      const response = await apiService.get(`/explore/popular-tags?${params}`);

      if (response?.status === "success") {
        return response.data.tags || [];
      }
    } catch (error) {
      console.warn("Error fetching popular tags:", error.message);
    }

    return [];
  }

  // Get explore statistics
  async getStats() {
    try {
      const response = await apiService.get("/explore/stats");

      if (response?.status === "success") {
        return response.data.stats;
      }
    } catch (error) {
      console.warn("Error fetching explore stats:", error.message);
    }

    return {
      totalBlogs: 0,
      totalAuthors: 0,
      totalViews: 0,
      totalLikes: 0,
    };
  }

  // Get community stats for stories
  async getCommunityStats() {
    try {
      const response = await apiService.get("/explore/community-stats");

      if (response?.status === "success") {
        return response.data.stats;
      }
    } catch (error) {
      console.warn("Error fetching community stats:", error.message);
    }

    return {
      storiesShared: 0,
      livesTouched: 0,
      countries: 0,
    };
  }

  // Get featured content (using blogs endpoint)
  async getFeaturedContent(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || 1));
      params.append("limit", String(options.limit || 12));
      params.append("sortBy", "views");
      params.append("sortOrder", "desc");

      const response = await apiService.get(`/blogs?${params}`);

      if (response?.status === "success") {
        return {
          content: response.data.blogs || [],
          pagination: response.data.pagination || {
            currentPage: options.page || 1,
            totalPages: 0,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
    } catch (error) {
      console.warn("Error fetching featured content:", error.message);
    }

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

  // Get recommended users
  async getRecommendedUsers(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("limit", String(options.limit || 8));

      const response = await apiService.get(
        `/explore/trending-authors?${params}`,
      );

      if (response?.status === "success") {
        return response.data.authors || [];
      }
    } catch (error) {
      console.warn("Error fetching recommended users:", error.message);
    }

    return [];
  }

  // Search content across the platform
  async searchContent(query, options = {}) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          results: {
            blogs: [],
            authors: [],
            tags: [],
          },
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalResults: 0,
          },
        };
      }

      const params = new URLSearchParams();
      params.append("q", query.trim());
      params.append("page", String(options.page || 1));
      params.append("limit", String(options.limit || 20));

      if (options.type) {
        params.append("type", options.type);
      }

      const response = await apiService.get(`/explore/search?${params}`);

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error searching content:", error.message);
    }

    return {
      results: {
        blogs: [],
        authors: [],
        tags: [],
      },
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalResults: 0,
      },
    };
  }

  // Get trending topics
  async getTrendingTopics(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("limit", String(options.limit || 10));
      params.append("timeframe", options.timeframe || "week");

      const response = await apiService.get(
        `/explore/trending-topics?${params}`,
      );

      if (response?.status === "success") {
        return response.data.topics || [];
      }
    } catch (error) {
      console.warn("Error fetching trending topics:", error.message);
    }

    return [];
  }

  // Get explore statistics
  async getStats() {
    try {
      const response = await apiService.get("/explore/stats");

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching explore stats:", error.message);
    }

    return {
      totalAuthors: 0,
      totalBlogs: 0,
      activeUsers: 0,
      totalUsers: 0,
      totalComments: 0,
      growth: {
        users: 0,
        blogs: 0,
        comments: 0,
      },
    };
  }

  // Get recommended content for user
  async getRecommendations(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || 1));
      params.append("limit", String(options.limit || 10));

      if (options.type) {
        params.append("type", options.type);
      }

      const response = await apiService.get(
        `/explore/recommendations?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching recommendations:", error.message);
    }

    return {
      recommendations: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalRecommendations: 0,
      },
    };
  }

  // Get explore stats (alias for getStats for consistency)
  async getExploreStats() {
    return await this.getStats();
  }
}

export const exploreService = new ExploreService();
export default exploreService;
