// import apiService from "./api";

// class UserService {
//   // Get user profile by ID
//   async getUserById(userId) {
//     const response = await apiService.get(`/users/${userId}`);
//     if (response.status === "success") {
//       return response.data;
//     }
//     throw new Error(response.message || "Failed to fetch user");
//   }

//   // Get user profile by username
//   async getUserByUsername(username) {
//     const response = await apiService.get(`/users/username/${username}`);
//     if (response.status === "success") {
//       return response.data;
//     }
//     throw new Error(response.message || "Failed to fetch user");
//   }

//   // Get user statistics
//   async getUserStats(userId) {
//     const response = await apiService.get(`/users/${userId}/stats`);
//     if (response.status === "success") {
//       return response.data.stats;
//     }
//     throw new Error(response.message || "Failed to fetch user stats");
//   }

//   // Search users
//   async searchUsers(query, limit = 10) {
//     const response = await apiService.get(
//       `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
//     );
//     if (response.status === "success") {
//       return response.data.users;
//     }
//     throw new Error(response.message || "Failed to search users");
//   }

//   // Get top authors
//   async getTopAuthors(limit = 10) {
//     const response = await apiService.get(`/users/top-authors?limit=${limit}`);
//     if (response.status === "success") {
//       return response.data.authors;
//     }
//     throw new Error(response.message || "Failed to fetch top authors");
//   }

//   // Update user role (admin only)
//   async updateUserRole(userId, role) {
//     const response = await apiService.put(`/users/${userId}/role`, { role });
//     if (response.status === "success") {
//       return response.data.user;
//     }
//     throw new Error(response.message || "Failed to update user role");
//   }

//   // Toggle user status (admin only)
//   async toggleUserStatus(userId) {
//     const response = await apiService.put(`/users/${userId}/status`);
//     if (response.status === "success") {
//       return response.data.user;
//     }
//     throw new Error(response.message || "Failed to toggle user status");
//   }

//   // Delete user (admin only)
//   async deleteUser(userId) {
//     const response = await apiService.delete(`/users/${userId}`);
//     if (response.status === "success") {
//       return true;
//     }
//     throw new Error(response.message || "Failed to delete user");
//   }

//   // Get current user profile (using auth endpoint)
//   async getCurrentUserProfile() {
//     const response = await apiService.get("/auth/profile");
//     if (response.status === "success") {
//       return response.data.user;
//     }
//     throw new Error(response.message || "Failed to fetch current user profile");
//   }

//   // Update current user profile (using auth endpoint)
//   async updateProfile(userData) {
//     const response = await apiService.put("/auth/profile", userData);
//     if (response.status === "success") {
//       return response.data.user;
//     }
//     throw new Error(response.message || "Failed to update profile");
//   }

//   // Change password (using auth endpoint)
//   async changePassword(currentPassword, newPassword) {
//     const response = await apiService.put("/auth/change-password", {
//       currentPassword,
//       newPassword,
//     });
//     if (response.status === "success") {
//       return true;
//     }
//     throw new Error(response.message || "Failed to change password");
//   }
// }

// export const userService = new UserService();
// export default userService;

import apiService from "./api";

class UserService {
  // Get user profile by ID
  async getUserById(userId) {
    const response = await apiService.get(`/users/${userId}`);
    if (response.status === "success") {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch user");
  }

  // Get user profile by username
  async getUserByUsername(username) {
    const response = await apiService.get(`/users/username/${username}`);
    if (response.status === "success") {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch user");
  }

  // Get user statistics
  async getUserStats(userId) {
    const response = await apiService.get(`/users/${userId}/stats`);
    if (response.status === "success") {
      return response.data.stats;
    }
    throw new Error(response.message || "Failed to fetch user stats");
  }

  // Get activity on current user's blogs (likes, comments from other users)
  async getUserActivity(userId, limit = 10) {
    try {
      const response = await apiService.get(
        `/users/${userId}/activity?limit=${limit}`,
      );
      if (response.status === "success") {
        return response.data.activities;
      }
      throw new Error(response.message || "Failed to fetch user activity");
    } catch (error) {
      // If endpoint doesn't exist yet, return mock data based on stats
      console.warn("Activity endpoint not available, generating mock data");
      return this.generateMockActivity(userId, limit);
    }
  }

  // Generate mock activity until backend endpoint is implemented
  async generateMockActivity(userId, limit = 10) {
    try {
      const stats = await this.getUserStats(userId);
      const activities = [];
      const now = new Date();

      // Generate realistic activity based on user's blog stats
      if (stats?.blogs?.totalLikes > 0) {
        const recentLikes = Math.min(
          3,
          Math.ceil(stats.blogs.totalLikes * 0.1),
        );
        for (let i = 0; i < recentLikes; i++) {
          activities.push({
            id: `like_${i}`,
            type: "like",
            message: `Someone liked your blog post`,
            time: `${2 + i * 2} hours ago`,
            color: "bg-red-500",
            avatar: null,
            username: `User${Math.floor(Math.random() * 1000)}`,
          });
        }
      }

      if (stats?.comments?.totalComments > 0) {
        const recentComments = Math.min(
          2,
          Math.ceil(stats.comments.totalComments * 0.15),
        );
        for (let i = 0; i < recentComments; i++) {
          activities.push({
            id: `comment_${i}`,
            type: "comment",
            message: `Someone commented on your blog post`,
            time: `${4 + i * 3} hours ago`,
            color: "bg-blue-500",
            avatar: null,
            username: `Reader${Math.floor(Math.random() * 1000)}`,
          });
        }
      }

      if (stats?.blogs?.totalViews > 0) {
        const recentViews = Math.min(
          2,
          Math.ceil(stats.blogs.totalViews * 0.05),
        );
        for (let i = 0; i < recentViews; i++) {
          activities.push({
            id: `view_${i}`,
            type: "view",
            message: `Someone viewed your blog post`,
            time: `${1 + i} hours ago`,
            color: "bg-green-500",
            avatar: null,
            username: `Visitor${Math.floor(Math.random() * 1000)}`,
          });
        }
      }

      // Add welcome message if no activity
      if (activities.length === 0) {
        activities.push({
          id: "welcome",
          type: "welcome",
          message:
            "Welcome to your dashboard! Start creating content to see activity.",
          time: "Just now",
          color: "bg-blue-500",
          avatar: null,
          username: "System",
        });
      }

      // Sort by time and limit results
      return activities
        .sort((a, b) => {
          // Simple time sorting - in real app would use proper timestamps
          const getHours = (timeStr) => {
            if (timeStr === "Just now") return 0;
            const match = timeStr.match(/(\d+) hours? ago/);
            return match ? parseInt(match[1]) : 999;
          };
          return getHours(a.time) - getHours(b.time);
        })
        .slice(0, limit);
    } catch (error) {
      console.error("Error generating mock activity:", error);
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
