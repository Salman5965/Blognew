import api from "./api";

export const notificationService = {
  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      // Return default count if API fails
      return { count: 0 };
    }
  },

  // Get user's notifications
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get("/notifications", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { notifications: [], pagination: {} };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.patch("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};
