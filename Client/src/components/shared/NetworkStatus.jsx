import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Globe,
} from "lucide-react";
import { checkNetworkConnectivity, checkApiHealth } from "@/utils/networkUtils";
import { API_BASE_URL } from "@/utils/constant";

export const NetworkStatus = ({ showDetails = false }) => {
  const [isOnline, setIsOnline] = useState(checkNetworkConnectivity());
  const [apiHealth, setApiHealth] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    const online = checkNetworkConnectivity();
    setIsOnline(online);

    if (online) {
      const health = await checkApiHealth();
      setApiHealth(health);
    } else {
      setApiHealth(null);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();

    const handleOnline = () => {
      setIsOnline(true);
      checkStatus();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setApiHealth(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showDetails && isOnline && apiHealth?.isHealthy) {
    return null; // Don't show anything when everything is working
  }

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (apiHealth?.isHealthy)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-orange-500" />;
  };

  const getStatusText = () => {
    if (isChecking) return "Checking connection...";
    if (!isOnline) return "No internet connection";
    if (apiHealth?.isHealthy) return "Connected";
    if (apiHealth?.status === "timeout") return "Server timeout";
    return "Server connection issues";
  };

  const getVariant = () => {
    if (!isOnline || (apiHealth && !apiHealth.isHealthy)) {
      return "destructive";
    }
    return "default";
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
            {showDetails && (
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant={isOnline ? "default" : "destructive"}>
                  <Wifi className="h-3 w-3 mr-1" />
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                {isOnline && (
                  <Badge
                    variant={apiHealth?.isHealthy ? "default" : "destructive"}
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    API: {apiHealth?.isHealthy ? "Healthy" : "Unavailable"}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isChecking}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        {showDetails && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div>API Base URL: {API_BASE_URL}</div>
            {apiHealth && <div>Status: {apiHealth.message}</div>}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default NetworkStatus;
