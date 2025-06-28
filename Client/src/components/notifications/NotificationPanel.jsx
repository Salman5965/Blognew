import React, { useState, useEffect } from "react";
import { Settings, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useNotificationStore from "@/features/notifications/notificationStore";
import NotificationList from "./NotificationList";

const NotificationPanel = ({ onClose }) => {
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all"); // all, like, comment, follow, etc.

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationStore();

  // Filter notifications based on selected filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesReadFilter =
      filter === "all" ||
      (filter === "unread" && !notification.isRead) ||
      (filter === "read" && notification.isRead);

    const matchesTypeFilter =
      typeFilter === "all" || notification.type === typeFilter;

    return matchesReadFilter && matchesTypeFilter;
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      fetchNotifications(pagination.currentPage + 1, 20, false, true);
    }
  };

  const notificationTypes = [
    { value: "all", label: "All" },
    { value: "like", label: "Likes" },
    { value: "comment", label: "Comments" },
    { value: "follow", label: "Follows" },
    { value: "mention", label: "Mentions" },
    { value: "bookmark", label: "Bookmarks" },
  ];

  return (
    <Card className="w-80 max-h-96 bg-slate-900 border-slate-700 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-300 hover:bg-slate-800"
              aria-label="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-slate-400" />
          <div className="flex gap-1">
            {["all", "unread", "read"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filter === filterType
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
        >
          {notificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {error && (
          <div className="p-4 text-center">
            <p className="text-red-400 text-sm mb-2">
              Failed to load notifications
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications()}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        )}

        {!error && filteredNotifications.length === 0 && !isLoading && (
          <div className="p-4 text-center">
            <p className="text-slate-400 text-sm">
              {filter === "unread"
                ? "No unread notifications"
                : typeFilter !== "all"
                  ? `No ${typeFilter} notifications`
                  : "No notifications yet"}
            </p>
          </div>
        )}

        <NotificationList
          notifications={filteredNotifications}
          isLoading={isLoading}
          hasMore={pagination.hasNext}
          onLoadMore={handleLoadMore}
        />
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-700 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-300"
        >
          View all notifications
        </Button>
      </div>
    </Card>
  );
};

export default NotificationPanel;
