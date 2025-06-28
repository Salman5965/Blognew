import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import notificationService from "../../services/notificationService";

const useNotificationStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalNotifications: 0,
      hasNext: false,
      hasPrev: false,
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
          set((state) => ({
            notifications: append
              ? [...state.notifications, ...result.data]
              : result.data,
            pagination: result.pagination,
            isLoading: false,
          }));
        } else {
          set({
            notifications: append ? get().notifications : result.data,
            pagination: result.pagination,
            error: result.error,
            isLoading: false,
          });
        }
      } catch (error) {
        set({
          error: "Failed to fetch notifications",
          isLoading: false,
        });
      }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
      try {
        const result = await notificationService.getUnreadCount();
        set({ unreadCount: result.count });
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
      const result = await notificationService.markAsRead(notificationId);

      if (result.success) {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }

      return result;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
      const result = await notificationService.markAllAsRead();

      if (result.success) {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      }

      return result;
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
      const result =
        await notificationService.deleteNotification(notificationId);

      if (result.success) {
        set((state) => {
          const notification = state.notifications.find(
            (n) => n._id === notificationId,
          );
          const wasUnread = notification && !notification.isRead;

          return {
            notifications: state.notifications.filter(
              (n) => n._id !== notificationId,
            ),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      }

      return result;
    },

    // Add new notification (for real-time updates)
    addNotification: (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.isRead
          ? state.unreadCount
          : state.unreadCount + 1,
      }));

      // Show browser notification if preferences allow
      const { preferences } = get();
      if (preferences?.push?.[notification.type]) {
        notificationService.showBrowserNotification(notification.title, {
          body: notification.message,
          tag: notification._id,
        });
      }
    },

    // Update notification
    updateNotification: (notificationId, updates) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, ...updates }
            : notification,
        ),
      }));
    },

    // Fetch preferences
    fetchPreferences: async () => {
      set({ isPreferencesLoading: true });

      try {
        const result = await notificationService.getPreferences();
        set({
          preferences: result.data,
          isPreferencesLoading: false,
        });
      } catch (error) {
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

        return result;
      } catch (error) {
        set({ isPreferencesLoading: false });
        return { success: false, error: "Failed to update preferences" };
      }
    },

    // Filter notifications by type
    getNotificationsByType: (type) => {
      return get().notifications.filter(
        (notification) => notification.type === type,
      );
    },

    // Get unread notifications
    getUnreadNotifications: () => {
      return get().notifications.filter((notification) => !notification.isRead);
    },

    // Clear all notifications (local only)
    clearNotifications: () => {
      set({
        notifications: [],
        unreadCount: 0,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalNotifications: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Initialize notifications (call on app start)
    initialize: async () => {
      await Promise.all([
        get().fetchNotifications(1, 20),
        get().fetchUnreadCount(),
        get().fetchPreferences(),
      ]);
    },
  })),
);

// Subscribe to notification changes for browser notifications
useNotificationStore.subscribe(
  (state) => state.notifications,
  (notifications, previousNotifications) => {
    // Check if a new notification was added
    if (notifications.length > previousNotifications.length) {
      const newNotification = notifications[0];
      if (newNotification && !newNotification.isRead) {
        // Request permission if not already granted
        notificationService.requestNotificationPermission();
      }
    }
  },
);

export default useNotificationStore;
