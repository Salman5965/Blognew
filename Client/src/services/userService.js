import apiService from "./api";

class UserService {
  // Get user profile by ID
  async getUserById(userId) {
    try {
      const response = await apiService.get(`/users/${userId}`);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user");
    } catch (error) {
      // Handle specific error types
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid user ID");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.message === "Network Error") {
        throw new Error("Network error. Please check your connection.");
      }

      // Re-throw the original error if it's already a custom error
      throw error;
    }
  }

  // Get user profile by username
  async getUserByUsername(username) {
    try {
      const response = await apiService.get(`/users/username/${username}`);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user");
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const response = await apiService.get(`/users/${userId}/stats`);
      if (response.status === "success") {
        return response.data.stats;
      }
      throw new Error(response.message || "Failed to fetch user stats");
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Get activity on current user's blogs (likes, comments from other users)
  async getUserActivity(userId, limit = 10) {
    try {
      const response = await apiService.get(
        `/users/${userId}/activity?limit=${limit}`,
      );
      if (response.status === "success") {
        return response.data.activities || response.data;
      }
      throw new Error(response.message || "Failed to fetch user activity");
    } catch (error) {
      console.error("Error fetching user activity:", error);

      // Return empty array for missing endpoints
      if (error.response?.status === 404 || error.status === 404) {
        return [];
      }

      return [];
    }
  }

  // Search users
  async searchUsers(query, limit = 10) {
    const response = await apiService.get(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    if (response.status === "success") {
      return response.data.users;
    }
    throw new Error(response.message || "Failed to search users");
  }

  // Get top authors
  async getTopAuthors(limit = 10) {
    const response = await apiService.get(`/users/top-authors?limit=${limit}`);
    if (response.status === "success") {
      return response.data.authors;
    }
    throw new Error(response.message || "Failed to fetch top authors");
  }

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    const response = await apiService.put(`/users/${userId}/role`, { role });
    if (response.status === "success") {
      return response.data.user;
    }
    throw new Error(response.message || "Failed to update user role");
  }

  // Toggle user status (admin only)
  async toggleUserStatus(userId) {
    const response = await apiService.put(`/users/${userId}/status`);
    if (response.status === "success") {
      return response.data.user;
    }
    throw new Error(response.message || "Failed to toggle user status");
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    const response = await apiService.delete(`/users/${userId}`);
    if (response.status === "success") {
      return true;
    }
    throw new Error(response.message || "Failed to delete user");
  }

  // Get user followers
  async getFollowers(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page);
      if (options.limit) params.append("limit", options.limit);

      const response = await apiService.get(
        `/users/${userId}/followers?${params}`,
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch followers");
    } catch (error) {
      console.error("Error fetching followers:", error);
      return {
        followers: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalFollowers: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: options.limit || 20,
        },
      };
    }
  }

  // Get user following
  async getFollowing(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page);
      if (options.limit) params.append("limit", options.limit);

      const response = await apiService.get(
        `/users/${userId}/following?${params}`,
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch following");
    } catch (error) {
      console.error("Error fetching following:", error);
      return {
        following: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalFollowing: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: options.limit || 20,
        },
      };
    }
  }

  // Get current user profile (using auth endpoint)
  async getCurrentUserProfile() {
    const response = await apiService.get("/auth/profile");
    if (response.status === "success") {
      return response.data.user;
    }
    throw new Error(response.message || "Failed to fetch current user profile");
  }

  // Update current user profile (using auth endpoint)
  async updateProfile(userData) {
    const response = await apiService.put("/auth/profile", userData);
    if (response.status === "success") {
      return response.data.user;
    }
    throw new Error(response.message || "Failed to update profile");
  }

  // Change password (using auth endpoint)
  async changePassword(currentPassword, newPassword) {
    const response = await apiService.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    if (response.status === "success") {
      return true;
    }
    throw new Error(response.message || "Failed to change password");
  }
}

export const userService = new UserService();
export default userService;
