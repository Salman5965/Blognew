import { apiService } from "./api";
import { PAGINATION } from "@/utils/constant";

class ExploreService {
  // Get trending authors with proper error handling
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

    // Return empty data structure instead of mock data
    return {
      authors: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalAuthors: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 12,
      },
    };
  }

  // Get featured content with proper error handling
  async getFeaturedContent(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 6));

      if (options.type) params.append("type", options.type);

      const response = await apiService.get(
        `/explore/featured-content?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching featured content:", error.message);
    }

    // Return empty data structure instead of mock data
    return {
      content: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalContent: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 6,
      },
    };
  }

  // Get popular tags with proper error handling
  async getPopularTags(limit = 20) {
    try {
      const response = await apiService.get(
        `/explore/popular-tags?limit=${limit}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching popular tags:", error.message);
    }

    // Return empty data structure instead of mock data
    return {
      tags: [],
      total: 0,
    };
  }

  // Get recommended users with proper error handling
  async getRecommendedUsers(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 8));

      const response = await apiService.get(
        `/explore/recommended-users?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching recommended users:", error.message);
    }

    // Return empty data structure instead of mock data
    return {
      users: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalUsers: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 8,
      },
    };
  }

  // Get trending topics with proper error handling
  async getTrendingTopics(limit = 10) {
    try {
      const response = await apiService.get(
        `/explore/trending-topics?limit=${limit}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching trending topics:", error.message);
    }

    // Return empty data structure instead of mock data
    return {
      topics: [],
      total: 0,
    };
  }

  // Get explore page statistics with proper error handling
  async getExploreStats() {
    try {
      const response = await apiService.get("/explore/stats");

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching explore stats:", error.message);
    }

    // Return empty data structure instead of mock data
    return {
      totalUsers: 0,
      totalBlogs: 0,
      totalComments: 0,
      activeUsers: 0,
      growth: {
        users: 0,
        blogs: 0,
        comments: 0,
      },
    };
  }

  // Search across all content types
  async searchAll(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 10));

      if (options.type) params.append("type", options.type);
      if (options.category) params.append("category", options.category);
      if (options.sortBy) params.append("sortBy", options.sortBy);
      if (options.timeframe) params.append("timeframe", options.timeframe);

      const response = await apiService.get(`/explore/search?${params}`);

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error searching content:", error.message);
    }

    // Return empty search results
    return {
      results: [],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 10,
      },
      filters: {
        types: [],
        categories: [],
        tags: [],
      },
    };
  }

  // Get category-specific content
  async getContentByCategory(category, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 10));
      params.append("sortBy", options.sortBy || "popularity");

      const response = await apiService.get(
        `/explore/categories/${encodeURIComponent(category)}?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn(
        `Error fetching content for category ${category}:`,
        error.message,
      );
    }

    // Return empty data structure
    return {
      content: [],
      category,
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalContent: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 10,
      },
    };
  }

  // Get related content for a specific item
  async getRelatedContent(contentId, contentType = "blog", limit = 5) {
    try {
      const response = await apiService.get(
        `/explore/related/${contentType}/${contentId}?limit=${limit}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn(
        `Error fetching related content for ${contentType} ${contentId}:`,
        error.message,
      );
    }

    // Return empty related content
    return {
      relatedContent: [],
      total: 0,
    };
  }

  // Get content analytics/insights
  async getContentInsights(timeframe = "week") {
    try {
      const response = await apiService.get(
        `/explore/insights?timeframe=${timeframe}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching content insights:", error.message);
    }

    // Return empty insights
    return {
      topPerformingContent: [],
      emergingTopics: [],
      userEngagement: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageReadTime: 0,
      },
      categoryDistribution: [],
    };
  }
}

export const exploreService = new ExploreService();
export default exploreService;
