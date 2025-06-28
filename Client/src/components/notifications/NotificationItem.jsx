import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useNotificationStore from "@/features/notifications/notificationStore";

const NotificationItem = ({ notification }) => {
  const [showActions, setShowActions] = useState(false);
  const { markAsRead, deleteNotification } = useNotificationStore();

  const getNotificationIcon = (type) => {
    const iconProps = { className: "h-4 w-4" };

    switch (type) {
      case "like":
        return <Heart {...iconProps} className="h-4 w-4 text-red-500" />;
      case "comment":
        return (
          <MessageCircle {...iconProps} className="h-4 w-4 text-blue-500" />
        );
      case "follow":
        return <UserPlus {...iconProps} className="h-4 w-4 text-green-500" />;
      case "mention":
        return <AtSign {...iconProps} className="h-4 w-4 text-purple-500" />;
      case "bookmark":
        return <Bookmark {...iconProps} className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 bg-slate-500 rounded-full" />;
    }
  };

  const getNotificationLink = () => {
    if (notification.relatedBlog) {
      return `/blog/${notification.relatedBlog.slug}`;
    }
    if (notification.relatedUser) {
      return `/users/${notification.relatedUser.username}`;
    }
    return null;
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleMarkAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsRead(notification._id);
    setShowActions(false);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteNotification(notification._id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });
  const link = getNotificationLink();

  const NotificationContent = () => (
    <div
      className={`p-3 hover:bg-slate-800 transition-colors cursor-pointer relative group ${
        !notification.isRead ? "bg-slate-800/50" : ""
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {notification.relatedUser?.avatar ? (
            <img
              src={notification.relatedUser.avatar}
              alt={notification.relatedUser.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-white">
                <span className="font-medium">
                  {notification.relatedUser?.firstName}{" "}
                  {notification.relatedUser?.lastName}
                  {!notification.relatedUser && "Someone"}
                </span>
                <span className="text-slate-300 ml-1">
                  {notification.type === "like" && "liked your post"}
                  {notification.type === "comment" && "commented on your post"}
                  {notification.type === "follow" && "started following you"}
                  {notification.type === "mention" && "mentioned you in a post"}
                  {notification.type === "bookmark" && "bookmarked your post"}
                </span>
              </p>

              {notification.relatedBlog && (
                <p className="text-xs text-slate-400 mt-1 truncate">
                  "{notification.relatedBlog.title}"
                </p>
              )}

              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-slate-500">{timeAgo}</span>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>

            {/* Notification Type Icon */}
            <div className="flex-shrink-0 ml-2">
              {getNotificationIcon(notification.type)}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-slate-900 rounded-md p-1 shadow-lg">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                title="Mark as read"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
              title="Delete notification"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Wrap with Link if there's a destination
  if (link) {
    return (
      <Link to={link} className="block">
        <NotificationContent />
      </Link>
    );
  }

  return <NotificationContent />;
};

export default NotificationItem;
