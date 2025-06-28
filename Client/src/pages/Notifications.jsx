import React, { useState, useEffect } from "react";
import {
  Bell,
  Settings,
  CheckCheck,
  Filter,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useNotificationStore from "@/features/notifications/notificationStore";
import { useAuthContext } from "@/contexts/AuthContext";
import NotificationList from "@/components/notifications/NotificationList";
import { Navigate } from "react-router-dom";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  const { isAuthenticated } = useAuthContext();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    preferences,
    isPreferencesLoading,
    fetchNotifications,
    markAllAsRead,
    clearNotifications,
    fetchPreferences,
    updatePreferences,
  } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [isAuthenticated, fetchNotifications, fetchPreferences]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Filter notifications
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

  const handleRefresh = () => {
    fetchNotifications(1, 20);
  };

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      fetchNotifications(pagination.currentPage + 1, 20, false, true);
    }
  };

  const handlePreferenceChange = async (category, type, value) => {
    if (!preferences) return;

    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [type]: value,
      },
    };

    await updatePreferences(newPreferences);
  };

  const notificationTypes = [
    { value: "all", label: "All Types" },
    { value: "like", label: "Likes" },
    { value: "comment", label: "Comments" },
    { value: "follow", label: "Follows" },
    { value: "mention", label: "Mentions" },
    { value: "bookmark", label: "Bookmarks" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-slate-300 border-slate-600"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-400 border-blue-600 hover:bg-blue-600/10"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-300 border-slate-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && preferences && (
          <Card className="mb-6 p-6 bg-slate-900 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Notification Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["email", "push", "inApp"].map((category) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-white capitalize">
                    {category} Notifications
                  </h4>

                  {Object.entries(preferences[category] || {}).map(
                    ([type, enabled]) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            handlePreferenceChange(
                              category,
                              type,
                              e.target.checked,
                            )
                          }
                          disabled={isPreferencesLoading}
                          className="rounded border-slate-600 bg-slate-800 text-blue-600"
                        />
                        <span className="text-sm text-slate-300 capitalize">
                          {type.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6 p-4 bg-slate-900 border-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Filter:</span>
            </div>

            <div className="flex gap-2">
              {["all", "unread", "read"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filter === filterType
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === "unread" && unreadCount > 0 && (
                    <span className="ml-1 text-xs">({unreadCount})</span>
                  )}
                </button>
              ))}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm text-white"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications List */}
        <Card className="bg-slate-900 border-slate-700">
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-400 mb-4">Failed to load notifications</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="text-slate-300 border-slate-600"
              >
                Try again
              </Button>
            </div>
          )}

          {!error && filteredNotifications.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {filter === "unread"
                  ? "No unread notifications"
                  : typeFilter !== "all"
                    ? `No ${typeFilter} notifications`
                    : "No notifications yet"}
              </h3>
              <p className="text-slate-400">
                {filter === "all"
                  ? "When you get notifications, they'll show up here."
                  : "Try changing your filter settings."}
              </p>
            </div>
          )}

          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            hasMore={pagination.hasNext}
            onLoadMore={handleLoadMore}
            className="divide-y divide-slate-700"
          />
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
