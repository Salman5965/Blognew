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
  realtimeAlerts: [], // For showing toast notifications
  lastNotificationCheck: null,

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

  // Fetch unread count and create alerts for new notifications
  fetchUnreadCount: async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        const currentState = get();
        const newCount = result.count;

        // If count increased, check for new notifications to create alerts
        if (
          currentState.unreadCount > 0 &&
          newCount > currentState.unreadCount
        ) {
          try {
            // Fetch latest notifications to see what's new
            const notificationsResult =
              await notificationService.getNotifications(1, 5);
            if (notificationsResult.success) {
              const newNotifications =
                notificationsResult.data.notifications.filter((notif) => {
                  return !currentState.notifications.some(
                    (existing) =>
                      (existing._id || existing.id) === (notif._id || notif.id),
                  );
                });

              // Create real-time alerts for new notifications
              newNotifications.forEach((notification) => {
                get().createAlert(notification);
              });
            }
          } catch (alertError) {
            console.error("Error creating notification alerts:", alertError);
          }
        }

        set({ unreadCount: newCount, lastNotificationCheck: new Date() });
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

  // Create real-time alert
  createAlert: (notification) => {
    const alert = {
      id: Date.now() + Math.random(),
      notification,
      timestamp: new Date(),
      shown: false,
    };

    set((state) => ({
      realtimeAlerts: [...state.realtimeAlerts, alert],
    }));

    // Auto-remove alert after 5 seconds
    setTimeout(() => {
      set((state) => ({
        realtimeAlerts: state.realtimeAlerts.filter((a) => a.id !== alert.id),
      }));
    }, 5000);
  },

  // Mark alert as shown
  markAlertShown: (alertId) => {
    set((state) => ({
      realtimeAlerts: state.realtimeAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, shown: true } : alert,
      ),
    }));
  },

  // Clear all alerts
  clearAlerts: () => {
    set({ realtimeAlerts: [] });
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
    console.log("📬 Adding new notification to store:", notification);
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
