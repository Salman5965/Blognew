import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import useNotificationStore from "@/features/notifications/notificationStore";
import notificationService from "@/services/notificationService";
import socketService from "@/services/socketService";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import {
  Bell,
  RefreshCw,
  TestTube,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export const NotificationDebug = () => {
  const { user } = useAuthContext();
  const { unreadCount, notifications, fetchUnreadCount, fetchNotifications } =
    useNotificationStore();
  const { socketConnected, socketStatus } = useRealTimeNotifications();

  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestNotification = async () => {
    if (!user) return;

    setIsTestingNotification(true);
    setTestResult(null);

    try {
      // Create a test notification to ourselves
      const result = await notificationService.createNotification({
        recipientId: user._id,
        type: "test",
        title: "Test Notification",
        message: `Test notification created at ${new Date().toLocaleTimeString()}`,
        data: {
          testId: Date.now(),
          source: "debug-component",
        },
      });

      if (result.success) {
        setTestResult({
          type: "success",
          message: "Test notification created successfully!",
        });

        // Refresh notifications after a short delay
        setTimeout(() => {
          fetchUnreadCount();
          fetchNotifications(1, 20);
        }, 1000);
      } else {
        setTestResult({
          type: "error",
          message: `Failed to create notification: ${result.error}`,
        });
      }
    } catch (error) {
      setTestResult({ type: "error", message: `Error: ${error.message}` });
    } finally {
      setIsTestingNotification(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disconnected":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "disabled":
      case "no-auth":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "disconnected":
      case "error":
        return "bg-red-100 text-red-800";
      case "disabled":
      case "no-auth":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">
            Please log in to test notifications
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">WebSocket Status</h4>
            <div className="flex items-center gap-2">
              {socketConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <Badge className={getStatusColor(socketStatus)}>
                {getStatusIcon(socketStatus)}
                <span className="ml-1">{socketStatus}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {socketConnected
                ? "Real-time updates enabled"
                : "Using polling fallback"}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Notification Stats</h4>
            <div className="space-y-1">
              <p className="text-sm">
                Unread Count: <strong>{unreadCount}</strong>
              </p>
              <p className="text-sm">
                Total Notifications: <strong>{notifications.length}</strong>
              </p>
              <p className="text-sm">
                User ID: <strong>{user._id}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchUnreadCount();
              fetchNotifications(1, 20);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Notifications
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTestNotification}
            disabled={isTestingNotification}
          >
            <TestTube className="h-4 w-4 mr-1" />
            {isTestingNotification ? "Creating..." : "Create Test Notification"}
          </Button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-md text-sm ${
              testResult.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Notifications</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {notifications.slice(0, 5).map((notif, index) => (
                <div
                  key={notif._id || index}
                  className="p-2 bg-muted/50 rounded-md text-xs"
                >
                  <div className="font-medium">{notif.title}</div>
                  <div className="text-muted-foreground">{notif.message}</div>
                  <div className="text-muted-foreground mt-1">
                    Type: {notif.type} | Read: {notif.isRead ? "Yes" : "No"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-700">
          <h5 className="font-medium mb-1">How to test notifications:</h5>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>
              Click "Create Test Notification" to send yourself a test
              notification
            </li>
            <li>
              Like someone else's blog or comment to trigger notifications
            </li>
            <li>Follow/unfollow users to test follow notifications</li>
            <li>Comment on someone's blog to test comment notifications</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDebug;
