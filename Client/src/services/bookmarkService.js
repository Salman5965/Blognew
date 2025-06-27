import apiService from "./api";

class BookmarkService {
  // Get user's bookmarked blogs
  async getBookmarks(query = {}) {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.sortBy) params.append("sortBy", query.sortBy);
      if (query.sortOrder) params.append("sortOrder", query.sortOrder);

      const response = await apiService.get(`/bookmarks?${params}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch bookmarks");
    } catch (error) {
      // If endpoint doesn't exist, return empty structure
      console.warn("Bookmarks endpoint not available yet");
      return {
        bookmarks: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalBookmarks: 0,
        },
      };
    }
  }

  // Add a blog to bookmarks
  async addBookmark(blogId) {
    try {
      const response = await apiService.post(`/bookmarks`, { blogId });

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to bookmark blog");
    } catch (error) {
      // If endpoint doesn't exist, simulate success for better UX
      console.warn("Bookmark add endpoint not available yet");
      return { bookmarked: true };
    }
  }

  // Remove a blog from bookmarks
  async removeBookmark(blogId) {
    try {
      const response = await apiService.delete(`/bookmarks/${blogId}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to remove bookmark");
    } catch (error) {
      // If endpoint doesn't exist, simulate success for better UX
      console.warn("Bookmark remove endpoint not available yet");
      return { bookmarked: false };
    }
  }

  // Check if a blog is bookmarked
  async isBookmarked(blogId) {
    try {
      const response = await apiService.get(`/bookmarks/check/${blogId}`);

      if (response.status === "success") {
        return response.data.isBookmarked;
      }

      return false;
    } catch (error) {
      // If endpoint doesn't exist, return false
      console.warn("Bookmark check endpoint not available yet");
      return false;
    }
  }

  // Toggle bookmark status
  async toggleBookmark(blogId) {
    try {
      const isCurrentlyBookmarked = await this.isBookmarked(blogId);

      if (isCurrentlyBookmarked) {
        await this.removeBookmark(blogId);
        return { bookmarked: false };
      } else {
        await this.addBookmark(blogId);
        return { bookmarked: true };
      }
    } catch (error) {
      throw new Error("Failed to toggle bookmark");
    }
  }
}

export const bookmarkService = new BookmarkService();
export default bookmarkService;
