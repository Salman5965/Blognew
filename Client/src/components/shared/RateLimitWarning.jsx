import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";

export const RateLimitWarning = ({
  message,
  retryAfter,
  onRetry,
  className = "",
}) => {
  const [timeLeft, setTimeLeft] = useState(parseInt(retryAfter) || 0);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanRetry(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanRetry(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}s`;
  };

  return (
    <Alert variant="destructive" className={className}>
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium">Rate limit exceeded</div>
          <div className="text-sm">
            {message || "Too many requests. Please wait before trying again."}
            {timeLeft > 0 && (
              <span className="ml-2 font-mono">
                Retry in: {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={!canRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {canRetry ? "Retry" : "Wait..."}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default RateLimitWarning;
