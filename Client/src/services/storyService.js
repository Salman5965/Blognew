import { apiService } from "./api";

class StoryService {
  /**
   * Get all stories with optional filters
   */
  async getStories(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.tags) queryParams.append("tags", filters.tags);
      if (filters.author) queryParams.append("author", filters.author);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const response = await apiService.get(
        `/stories?${queryParams.toString()}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch stories");
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      // Return empty data structure for graceful degradation
      return {
        stories: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  /**
   * Get a specific story by ID
   */
  async getStoryById(storyId) {
    try {
      const response = await apiService.get(`/stories/${storyId}`);

      if (response.status === "success") {
        return response.data.story;
      }

      throw new Error(response.message || "Story not found");
    } catch (error) {
      console.error("Failed to fetch story:", error);
      throw error;
    }
  }

  /**
   * Create a new story
   */
  async createStory(storyData) {
    try {
      const response = await apiService.post("/stories", storyData);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to create story");
    } catch (error) {
      console.error("Failed to create story:", error);
      throw error;
    }
  }

  /**
   * Update an existing story
   */
  async updateStory(storyId, storyData) {
    try {
      const response = await apiService.put(`/stories/${storyId}`, storyData);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to update story");
    } catch (error) {
      console.error("Failed to update story:", error);
      throw error;
    }
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId) {
    try {
      const response = await apiService.delete(`/stories/${storyId}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to delete story");
    } catch (error) {
      console.error("Failed to delete story:", error);
      throw error;
    }
  }

  /**
   * Like or unlike a story
   */
  async toggleLike(storyId) {
    try {
      const response = await apiService.post(`/stories/${storyId}/like`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to toggle like");
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  }

  /**
   * Bookmark or unbookmark a story
   */
  async toggleBookmark(storyId) {
    try {
      const response = await apiService.post(`/stories/${storyId}/bookmark`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to toggle bookmark");
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      throw error;
    }
  }

  /**
   * Get user's liked stories
   */
  async getLikedStories(page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/stories/liked?page=${page}&limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch liked stories");
    } catch (error) {
      console.error("Failed to fetch liked stories:", error);
      return { stories: [], pagination: {} };
    }
  }

  /**
   * Get user's bookmarked stories
   */
  async getBookmarkedStories(page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/stories/bookmarked?page=${page}&limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch bookmarked stories");
    } catch (error) {
      console.error("Failed to fetch bookmarked stories:", error);
      return { stories: [], pagination: {} };
    }
  }

  /**
   * Get stories by a specific author
   */
  async getStoriesByAuthor(authorId, page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/stories/author/${authorId}?page=${page}&limit=${limit}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch author's stories");
    } catch (error) {
      console.error("Failed to fetch author's stories:", error);
      return { stories: [], pagination: {} };
    }
  }

  /**
   * Search stories
   */
  async searchStories(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", query);

      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.tags) queryParams.append("tags", filters.tags);

      const response = await apiService.get(
        `/stories/search?${queryParams.toString()}`,
      );

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Search failed");
    } catch (error) {
      console.error("Failed to search stories:", error);
      return { stories: [], pagination: {} };
    }
  }

  /**
   * Get story statistics
   */
  async getStoryStats(storyId) {
    try {
      const response = await apiService.get(`/stories/${storyId}/stats`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch story stats");
    } catch (error) {
      console.error("Failed to fetch story stats:", error);
      return {
        views: 0,
        likes: 0,
        comments: 0,
        bookmarks: 0,
      };
    }
  }
}

export const storyService = new StoryService();
export default storyService;
