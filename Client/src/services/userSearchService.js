import apiService from "./api";

class UserSearchService {
  // Search users by username or name
  async searchUsers(query, limit = 10) {
    try {
      const response = await apiService.get(
        `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      );

      if (response.status === "success") {
        return {
          success: true,
          users: response.data.users || [],
        };
      } else {
        throw new Error(response.message || "Failed to search users");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        success: false,
        users: [],
        error: error.response?.data?.message || "Failed to search users",
      };
    }
  }

  // Get user suggestions for mentions
  async getUserSuggestions(currentUserId, limit = 8) {
    try {
      const response = await apiService.get(
        `/users/suggestions?limit=${limit}`,
      );

      if (response.status === "success") {
        const users = (response.data.users || []).filter(
          (user) => (user._id || user.id) !== currentUserId,
        );

        return {
          success: true,
          users,
        };
      } else {
        throw new Error(response.message || "Failed to get user suggestions");
      }
    } catch (error) {
      console.error("Error getting user suggestions:", error);
      return {
        success: false,
        users: [],
        error:
          error.response?.data?.message || "Failed to get user suggestions",
      };
    }
  }

  // Get recent interactions for mention suggestions
  async getRecentInteractions(limit = 5) {
    try {
      const response = await apiService.get(
        `/users/recent-interactions?limit=${limit}`,
      );

      if (response.status === "success") {
        return {
          success: true,
          users: response.data.users || [],
        };
      } else {
        throw new Error(
          response.message || "Failed to get recent interactions",
        );
      }
    } catch (error) {
      console.error("Error getting recent interactions:", error);
      return {
        success: false,
        users: [],
        error:
          error.response?.data?.message || "Failed to get recent interactions",
      };
    }
  }
}

const userSearchService = new UserSearchService();
export default userSearchService;
