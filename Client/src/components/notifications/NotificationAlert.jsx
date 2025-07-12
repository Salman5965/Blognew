import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useNotificationStore from "@/features/notifications/notificationStore";
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Bookmark,
  Bell,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NotificationAlert = () => {
  const { realtimeAlerts, markAlertShown, clearAlerts } =
    useNotificationStore();
  const { toast } = useToast();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
      case "blog_like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
      case "comment_reply":
      case "comment_like":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case "bookmark":
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, sender, data } = notification;
    const senderName = sender?.username || sender?.name || "Someone";

    switch (type) {
      case "like":
      case "blog_like":
        return `${senderName} liked your blog`;
      case "comment":
        return `${senderName} commented on your blog`;
      case "comment_reply":
        return `${senderName} replied to your comment`;
      case "comment_like":
        return `${senderName} liked your comment`;
      case "follow":
        return `${senderName} started following you`;
      case "mention":
        return `${senderName} mentioned you in a comment`;
      case "bookmark":
        return `${senderName} bookmarked your blog`;
      default:
        return notification.message || "New notification";
    }
  };

  useEffect(() => {
    // Show toast notifications for new alerts
    realtimeAlerts
      .filter((alert) => !alert.shown)
      .forEach((alert) => {
        const notification = alert.notification;

        // Show toast
        toast({
          title: "New Notification",
          description: getNotificationMessage(notification),
          duration: 4000,
        });

        // Mark as shown
        markAlertShown(alert.id);
      });
  }, [realtimeAlerts, toast, markAlertShown]);

  // Only show alerts that are less than 10 seconds old and not yet shown
  const visibleAlerts = realtimeAlerts.filter((alert) => {
    const ageInSeconds = (new Date() - alert.timestamp) / 1000;
    return ageInSeconds < 10 && !alert.shown;
  });

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleAlerts.slice(0, 3).map((alert) => {
        const notification = alert.notification;
        const sender = notification.sender || {};

        return (
          <Card
            key={alert.id}
            className="bg-card border shadow-lg animate-in slide-in-from-right-full duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {/* Notification Icon */}
                <div className="flex-shrink-0">
                  {sender.avatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={sender.avatar} />
                      <AvatarFallback>
                        {(sender.username || sender.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {getNotificationMessage(notification)}
                  </p>

                  {notification.data?.blogTitle && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      "{notification.data.blogTitle}"
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </p>
                </div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => markAlertShown(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Clear all button if multiple alerts */}
      {visibleAlerts.length > 1 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAlerts}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationAlert;
