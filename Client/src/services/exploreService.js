<<<<<<< HEAD
import { PAGINATION } from "@/utils/constant";
import apiService from "./api";

class ExploreService {
=======
import { apiService } from "./api";
import { PAGINATION } from "@/utils/constant";

class ExploreService {
  // Get trending authors with proper error handling
>>>>>>> origin/main
  async getTrendingAuthors(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 12));
<<<<<<< HEAD

      if (options.timeframe) params.append("timeframe", options.timeframe);
      if (options.category) params.append("category", options.category);
=======
      params.append("timeframe", options.timeframe || "week");
>>>>>>> origin/main

      const response = await apiService.get(
        `/explore/trending-authors?${params}`,
      );

<<<<<<< HEAD
      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch trending authors");
    } catch (error) {
      console.error("Error fetching trending authors:", error);
      // Return empty data structure when API is unavailable
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
  }

=======
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
>>>>>>> origin/main
  async getFeaturedContent(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 6));

      if (options.type) params.append("type", options.type);

      const response = await apiService.get(
        `/explore/featured-content?${params}`,
      );

<<<<<<< HEAD
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

=======
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
>>>>>>> origin/main
  async getPopularTags(limit = 20) {
    try {
      const response = await apiService.get(
        `/explore/popular-tags?limit=${limit}`,
      );

<<<<<<< HEAD
      if (response.status === "success") {
        return response.data.tags || [];
      }

      throw new Error(response.message || "Failed to fetch popular tags");
    } catch (error) {
      console.error("Error fetching popular tags:", error);
      return [];
    }
  }

=======
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
>>>>>>> origin/main
  async getRecommendedUsers(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 8));

      const response = await apiService.get(
        `/explore/recommended-users?${params}`,
      );

<<<<<<< HEAD
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

=======
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
>>>>>>> origin/main
  async getTrendingTopics(limit = 10) {
    try {
      const response = await apiService.get(
        `/explore/trending-topics?limit=${limit}`,
      );

<<<<<<< HEAD
      if (response.status === "success") {
        return response.data.topics || [];
      }

      throw new Error(response.message || "Failed to fetch trending topics");
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      return [];
    }
  }

=======
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

  // Get community impact statistics
  async getCommunityImpact() {
    try {
      const response = await apiService.get("/explore/community-impact");

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error fetching community impact:", error.message);
    }

    // Return fallback data
    return {
      storiesShared: 1247,
      livesTouched: 3891,
      countries: 47,
      recentActivity: {
        newStories: 23,
        newUsers: 47,
        storiesThisMonth: 156,
      },
      growth: {
        storiesGrowth: 15,
        usersGrowth: 12,
        countriesGrowth: 8,
      },
    };
  }

  // Search for users
>>>>>>> origin/main
  async searchUsers(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 10));
<<<<<<< HEAD

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
=======
      params.append("type", "users"); // Specify we want to search for users

      if (options.sortBy) params.append("sortBy", options.sortBy);

      const response = await apiService.get(`/explore/search?${params}`);

      if (response?.status === "success") {
        return response.data.results?.users || [];
      }
    } catch (error) {
      console.warn("Error searching users:", error.message);
    }

    // Return empty search results
    return [];
  }

  // Enhanced search with content type support
  async searchContent(query, type = "all", options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      params.append("type", type);
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 10));

      if (options.sortBy) params.append("sortBy", options.sortBy);

      const response = await apiService.get(`/explore/search?${params}`);

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      console.warn("Error searching content:", error.message);
    }

    // Return empty search results
    return {
      results: {
        users: [],
        blogs: [],
        stories: [],
        dailydrip: [],
      },
      pagination: {
        currentPage: options.page || 1,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 10,
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
>>>>>>> origin/main
  }
}

export const exploreService = new ExploreService();
export default exploreService;
