import { apiService as api } from "@/services/api";

class NotificationService {
  // Get all notifications
  async getNotifications(page = 1, limit = 20, filter = "all") {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter,
      });

      const response = await api.get(`/notifications?${params}`);
      return {
        success: true,
        data: {
          notifications: response?.notifications || [],
          totalCount: response?.totalCount || 0,
          currentPage: response?.currentPage || page,
          totalPages: response?.totalPages || 1,
          hasNext: response?.hasNext || false,
          hasPrev: response?.hasPrev || false,
        },
      };
    } catch (error) {
      // Silently handle 404s since the endpoint might not exist
      if (error.response?.status !== 404) {
        console.error("Error fetching notifications:", error);
      }
      return {
        success: false,
        data: {
          notifications: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        error:
          error.response?.status === 404
            ? null
            : error.response?.data?.message || "Failed to fetch notifications",
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response?.data || {},
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error marking notification as read:", error);
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to mark notification as read",
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.patch("/notifications/mark-all-read");
      return {
        success: true,
        data: response || {},
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error marking all notifications as read:", error);
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to mark all notifications as read",
      };
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return {
        success: true,
        data: response || {},
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error deleting notification:", error);
      }
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete notification",
      };
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      const response = await api.delete("/notifications/clear-all");
      return {
        success: true,
        data: response || {},
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error clearing notifications:", error);
      }
      return {
        success: false,
        error: error.response?.data?.message || "Failed to clear notifications",
      };
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get("/notifications/unread-count");
      return {
        success: true,
        count: response?.data?.count || response?.count || 0,
      };
    } catch (error) {
      // Silently handle 404s since the endpoint might not exist
      if (error.response?.status !== 404) {
        console.error("Error fetching unread count:", error);
      }
      return {
        success: false,
        count: 0,
        error:
          error.response?.status === 404
            ? null
            : error.response?.data?.message || "Failed to fetch unread count",
      };
    }
  }

  // Update notification preferences
  async updatePreferences(preferences) {
    try {
      const response = await api.put("/notifications/preferences", {
        preferences,
      });
      return {
        success: true,
        data: response?.data || preferences,
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error updating preferences:", error);
      }
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update preferences",
      };
    }
  }

  // Get notification preferences
  async getPreferences() {
    try {
      const response = await api.get("/notifications/preferences");

      // Check if this is a 404 response from our API service
      if (response?._isError && response.status === 404) {
        return {
          success: true,
          data: this.getDefaultPreferences(),
          error: null,
        };
      }

      return {
        success: true,
        data:
          response?.data?.data ||
          response?.data ||
          this.getDefaultPreferences(),
      };
    } catch (error) {
      // Always return a successful response with defaults - never throw
      return {
        success: true,
        data: this.getDefaultPreferences(),
        error:
          error.response?.status === 404
            ? null
            : error.response?.data?.message || "Failed to fetch preferences",
      };
    }
  }

  getDefaultPreferences() {
    return {
      email: {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        newsletters: false,
        promotions: false,
      },
      push: {
        likes: false,
        comments: true,
        follows: true,
        mentions: true,
        announcements: false,
      },
      inApp: {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        system: true,
      },
    };
  }
}

const notificationService = new NotificationService();
export default notificationService;
