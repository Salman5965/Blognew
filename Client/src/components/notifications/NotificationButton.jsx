import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import useNotificationStore from "@/features/notifications/notificationStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import NotificationPanel from "./NotificationPanel";

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const { user, isAuthenticated } = useAuthContext();
  const { unreadCount, fetchNotifications, initialize } =
    useNotificationStore();

  // Use the real-time notifications hook
  const { socketConnected, socketStatus } = useRealTimeNotifications();

  // Initialize notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initialize();
    }
  }, [isAuthenticated, user, initialize]);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        buttonRef.current &&
        panelRef.current &&
        !buttonRef.current.contains(event.target) &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Track new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotifications(true);
      // Reset after a delay to remove the pulse animation
      const timer = setTimeout(() => {
        setHasNewNotifications(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh notifications when opening
      fetchNotifications(1, 20);
    }
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={`relative p-2 hover:bg-slate-800 transition-colors ${
          isOpen ? "bg-slate-800" : ""
        }`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell
          className={`h-5 w-5 transition-all duration-200 ${
            hasNewNotifications
              ? "animate-pulse text-blue-400"
              : "text-slate-300"
          }`}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* New notification indicator */}
        {hasNewNotifications && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-400 rounded-full animate-ping" />
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div ref={panelRef} className="absolute right-0 top-full mt-2 z-50">
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
