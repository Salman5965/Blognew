import { apiService as api } from "@/services/api";

class NotificationService {
  // Get all notifications for current user
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly && { unreadOnly: "true" }),
      });

      const response = await api.get(`/notifications?${params}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);

      // Return mock data as fallback for any error (including 404)
      const mockNotifications = this.getMockNotifications(
        page,
        limit,
        unreadOnly,
      );
      return {
        success: false,
        data: mockNotifications.data,
        pagination: mockNotifications.pagination,
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
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
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
        data: response.data,
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
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
      await api.delete(`/notifications/${notificationId}`);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete notification",
      };
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get("/notifications/unread-count");
      return {
        success: true,
        count: response.data.count,
      };
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return {
        success: false,
        count: Math.floor(Math.random() * 5), // Mock fallback
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
      const response = await api.patch(
        "/notifications/preferences",
        preferences,
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error updating notification preferences:", error);
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
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      return {
        success: false,
        data: this.getDefaultPreferences(),
        error: error.response?.data?.message || "Failed to fetch preferences",
      };
    }
  }

  // Mock data for fallback
  getMockNotifications(page = 1, limit = 20, unreadOnly = false) {
    const allNotifications = [
      {
        _id: "1",
        type: "like",
        title: "New Like",
        message: 'John Doe liked your blog post "Introduction to React"',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        relatedUser: {
          _id: "user1",
          username: "johndoe",
          firstName: "John",
          lastName: "Doe",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        },
        relatedBlog: {
          _id: "blog1",
          title: "Introduction to React",
          slug: "introduction-to-react",
        },
      },
      {
        _id: "2",
        type: "follow",
        title: "New Follower",
        message: "Jane Smith started following you",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        relatedUser: {
          _id: "user2",
          username: "janesmith",
          firstName: "Jane",
          lastName: "Smith",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        },
      },
      {
        _id: "3",
        type: "comment",
        title: "New Comment",
        message: 'Alex Johnson commented on your blog post "JavaScript Tips"',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        relatedUser: {
          _id: "user3",
          username: "alexjohnson",
          firstName: "Alex",
          lastName: "Johnson",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
        },
        relatedBlog: {
          _id: "blog2",
          title: "JavaScript Tips",
          slug: "javascript-tips",
        },
      },
      {
        _id: "4",
        type: "mention",
        title: "Mentioned in Post",
        message: "Sarah Davis mentioned you in their blog post",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        relatedUser: {
          _id: "user4",
          username: "sarahdavis",
          firstName: "Sarah",
          lastName: "Davis",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        },
      },
      {
        _id: "5",
        type: "bookmark",
        title: "Post Bookmarked",
        message:
          'Mike Wilson bookmarked your blog post "Web Development Best Practices"',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        relatedUser: {
          _id: "user5",
          username: "mikewilson",
          firstName: "Mike",
          lastName: "Wilson",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        },
        relatedBlog: {
          _id: "blog3",
          title: "Web Development Best Practices",
          slug: "web-development-best-practices",
        },
      },
    ];

    let filteredNotifications = unreadOnly
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications;

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedNotifications = filteredNotifications.slice(start, end);

    return {
      data: paginatedNotifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredNotifications.length / limit),
        totalNotifications: filteredNotifications.length,
        hasNext: end < filteredNotifications.length,
        hasPrev: page > 1,
      },
    };
  }

  getDefaultPreferences() {
    return {
      email: {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        blogUpdates: false,
      },
      push: {
        likes: false,
        comments: true,
        follows: true,
        mentions: true,
        blogUpdates: false,
      },
      inApp: {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        blogUpdates: true,
      },
    };
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      return "not-supported";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission === "denied") {
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }
}

export default new NotificationService();
