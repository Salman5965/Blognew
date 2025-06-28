import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import socketService from "@/services/socketService";

export const useForumConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuthContext();

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      setConnectionStatus("unauthorized");
      return;
    }

    setError(null);
    setConnectionStatus("connecting");

    try {
      const socket = socketService.connect();
      if (socket) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("error");
        setError("Failed to initialize socket connection");
      }
    } catch (err) {
      setConnectionStatus("error");
      setError(err.message);
    }
  }, [isAuthenticated, user]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setConnectionStatus("disconnected");
  }, []);

  const retry = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    // Handle connection status changes
    const handleConnectionStatus = (status) => {
      setConnectionStatus(status);
      if (status === "error") {
        setError("Connection lost");
      } else if (status === "connected") {
        setError(null);
      }
    };

    socketService.on("connectionStatusChanged", handleConnectionStatus);

    return () => {
      socketService.off("connectionStatusChanged", handleConnectionStatus);
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    error,
    connect,
    disconnect,
    retry,
  };
};
