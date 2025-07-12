import { useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import useNotificationStore from "@/features/notifications/notificationStore";
import socketService from "@/services/socketService";

export const useRealTimeNotifications = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { fetchUnreadCount, addNotification, createAlert, fetchNotifications } =
    useNotificationStore();

  const pollIntervalRef = useRef(null);
  const lastCheckRef = useRef(new Date());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up when user logs out
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      socketService.disconnect();
      return;
    }

    // Initialize WebSocket connection
    const initializeRealTime = async () => {
      try {
        // Try to connect to WebSocket for real-time updates
        const socket = socketService.connect();

        if (socket) {
          console.log("🔔 Setting up real-time notifications...");

          // Listen for new notifications
          socketService.on("new_notification", (notification) => {
            console.log("📬 Received real-time notification:", notification);

            // Add to store and create alert
            addNotification(notification);
            createAlert(notification);

            // Update unread count
            fetchUnreadCount();
          });

          // Listen for notification updates (e.g., when marked as read)
          socketService.on("notification_updated", (data) => {
            console.log("🔄 Notification updated:", data);
            fetchUnreadCount();
          });

          // Join user's notification room
          socketService.emit("join_notifications", user._id);
        }
      } catch (error) {
        console.error("Failed to setup real-time notifications:", error);
      }
    };

    // Set up polling fallback (more frequent for better UX)
    const setupPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(async () => {
        try {
          // Only poll if WebSocket is not connected or failed
          if (!socketService.connected) {
            await fetchUnreadCount();

            // Every 5th poll (every 25 seconds), also check for new notifications
            const pollCount = Math.floor(Date.now() / 5000) % 5;
            if (pollCount === 0) {
              // Fetch recent notifications to check for new ones
              await fetchNotifications(1, 5);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000); // Poll every 5 seconds
    };

    // Initialize both real-time and polling
    initializeRealTime();
    setupPolling();

    // Cleanup function
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Clean up socket listeners
      socketService.off("new_notification");
      socketService.off("notification_updated");
    };
  }, [
    isAuthenticated,
    user,
    fetchUnreadCount,
    addNotification,
    createAlert,
    fetchNotifications,
  ]);

  // Return connection status for debugging
  return {
    socketConnected: socketService.connected,
    socketStatus: socketService.status,
  };
};

export default useRealTimeNotifications;
