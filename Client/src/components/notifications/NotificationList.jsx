import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import NotificationItem from "./NotificationItem";

const NotificationList = ({
  notifications,
  isLoading,
  hasMore,
  onLoadMore,
  className = "",
}) => {
  if (isLoading && notifications.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Notifications List */}
      <div className="max-h-72 overflow-y-auto">
        <div className="space-y-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
            />
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-2 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full text-xs text-slate-400 hover:text-slate-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
