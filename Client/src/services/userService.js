import apiService from "./api";

class UserService {
  // Get user profile by ID or username
  async getUserById(userIdOrUsername) {
    try {
      let response;

      try {
        // First try as ObjectId
        response = await apiService.get(`/users/${userIdOrUsername}`);
      } catch (firstError) {
        // If that fails, try as username
        try {
          response = await apiService.get(
            `/users/username/${userIdOrUsername}`,
          );
        } catch (secondError) {
          // If both fail, check if it's a 400/500 error on ObjectId or username issue
          if (
            firstError.response?.status === 400 ||
            firstError.response?.data?.message?.includes(
              "Cast to ObjectId failed",
            )
          ) {
            throw new Error("User not found");
          }
          // Re-throw the first error if it's more specific
          throw firstError.response?.status >= 400 ? firstError : secondError;
        }
      }

      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user");
    } catch (error) {
      // Handle specific HTTP status codes
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid user ID or username");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else if (error.message === "Network Error") {
        throw new Error("Network error. Please check your connection.");
      }

      // Re-throw the original error if it's already a custom error
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiService.get("/users/profile");
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch profile");
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put("/users/profile", profileData);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to update profile");
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.message || "Invalid profile data",
        );
      } else if (error.response?.status === 401) {
        throw new Error("Authentication required");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Follow/unfollow user
  async toggleFollow(userId) {
    try {
      const response = await apiService.post(`/users/${userId}/follow`);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to follow/unfollow user");
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error("Cannot follow yourself");
      } else if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status === 401) {
        throw new Error("Authentication required");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Get followers
  async getFollowers(userId, page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/users/${userId}/followers?page=${page}&limit=${limit}`,
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch followers");
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Get following
  async getFollowing(userId, page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/users/${userId}/following?page=${page}&limit=${limit}`,
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch following");
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Search users
  async searchUsers(query, limit = 10) {
    try {
      const response = await apiService.get(
        `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      );
      if (response.status === "success") {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error("Search users failed:", error);
      if (error.response?.status === 401) {
        return []; // Return empty array for unauthenticated users
      }
      return [];
    }
  }

  // Get user stats
  async getUserStats(userId) {
    try {
      const response = await apiService.get(`/users/${userId}/stats`);
      if (response.status === "success") {
        return response.data;
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

  // Upload avatar
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiService.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to upload avatar");
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.message || "Invalid file format",
        );
      } else if (error.response?.status === 401) {
        throw new Error("Authentication required");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }

  // Delete account
  async deleteAccount() {
    try {
      const response = await apiService.delete("/users/profile");
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to delete account");
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
      throw error;
    }
  }
}

export default new UserService();
