import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import notificationService from "../../services/notificationService";

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    totalCount: 0,
  },
  preferences: null,
  isPreferencesLoading: false,

  // Actions

  // Fetch notifications
  fetchNotifications: async (
    page = 1,
    limit = 20,
    unreadOnly = false,
    append = false,
  ) => {
    set({ isLoading: true, error: null });

    try {
      const result = await notificationService.getNotifications(
        page,
        limit,
        unreadOnly,
      );

      if (result.success) {
        const newNotifications = result.data.notifications || [];
        set((state) => ({
          notifications: append
            ? [...(state.notifications || []), ...newNotifications]
            : newNotifications,
          pagination: result.data,
          isLoading: false,
          error: null,
        }));
      } else {
        set({
          notifications: [],
          isLoading: false,
          error: result.error || "Failed to fetch notifications",
        });
      }
    } catch (error) {
      set({
        notifications: [],
        error: "Failed to fetch notifications",
        isLoading: false,
      });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        set({ unreadCount: result.count });
      } else {
        set({ unreadCount: 0 });
      }
    } catch (error) {
      // Silently handle 404s
      if (error.response?.status !== 404) {
        console.error("Error fetching unread count:", error);
      }
      set({ unreadCount: 0 });
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);

      if (result.success) {
        set((state) => ({
          notifications: (state.notifications || []).map((notification) =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const result = await notificationService.markAllAsRead();

      if (result.success) {
        set((state) => ({
          notifications: (state.notifications || []).map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const result =
        await notificationService.deleteNotification(notificationId);

      if (result.success) {
        set((state) => ({
          notifications: (state.notifications || []).filter(
            (notification) => notification._id !== notificationId,
          ),
        }));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  // Clear all notifications
  clearNotifications: async () => {
    try {
      const result = await notificationService.clearAllNotifications();

      if (result.success) {
        set({
          notifications: [],
          unreadCount: 0,
        });
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },

  // Fetch preferences
  fetchPreferences: async () => {
    set({ isPreferencesLoading: true });

    try {
      const result = await notificationService.getPreferences();
      // Always use the result data since the service handles errors internally
      set({
        preferences: result.data,
        isPreferencesLoading: false,
      });
    } catch (error) {
      // This should rarely happen since the service handles errors
      set({
        preferences: notificationService.getDefaultPreferences(),
        isPreferencesLoading: false,
      });
    }
  },

  // Update preferences
  updatePreferences: async (newPreferences) => {
    set({ isPreferencesLoading: true });

    try {
      const result =
        await notificationService.updatePreferences(newPreferences);

      if (result.success) {
        set({
          preferences: result.data,
          isPreferencesLoading: false,
        });
      } else {
        set({ isPreferencesLoading: false });
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      set({ isPreferencesLoading: false });
    }
  },

  // Real-time notification handling
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...(state.notifications || [])],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Initialize store
  initialize: async () => {
    const { fetchNotifications, fetchUnreadCount, fetchPreferences } = get();

    try {
      await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
        fetchPreferences(),
      ]);
    } catch (error) {
      console.error("Error initializing notification store:", error);
    }
  },
}));

export default useNotificationStore;
