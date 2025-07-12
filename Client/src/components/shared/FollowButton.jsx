import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { followService } from "@/services/followService";
import notificationService from "@/services/notificationService";
import { UserPlus, UserMinus, Loader2, UserCheck } from "lucide-react";
import { isValidObjectId } from "@/utils/validation";

export const FollowButton = ({
  userId,
  initialFollowingStatus = false,
  onFollowChange,
  size = "default",
  variant = "default",
  className = "",
  showIcon = true,
  showText = true,
}) => {
  // All hooks must be called before any conditional returns
  const [isFollowing, setIsFollowing] = useState(initialFollowingStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();

  // Check initial following status with debouncing
  useEffect(() => {
    let timeoutId;

    const checkFollowStatus = async () => {
      // Skip check if user is not authenticated or userId is invalid
      if (!user || !userId || userId === "undefined" || user._id === userId)
        return;

      // Skip check if userId is not a valid ObjectId format
      if (!isValidObjectId(userId)) {
        console.warn("Invalid ObjectId format for userId:", userId);
        return;
      }

      try {
        const following = await followService.isFollowing(userId);
        setIsFollowing(following);
      } catch (error) {
        console.error("Error checking follow status:", error);
        // Handle auth errors and rate limits gracefully by not showing error to user
        if (
          error.status !== 401 &&
          error.status !== 429 &&
          !error.message?.includes("Too many requests") &&
          !error.message?.includes("Access denied")
        ) {
          // Only show errors for unexpected issues
          console.warn("Follow status check failed:", error.message);
        }
      }
    };

    // Debounce the follow status check
    timeoutId = setTimeout(checkFollowStatus, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [userId, user]);

  // Don't show follow button for invalid conditions - AFTER all hooks
  if (
    !user ||
    !userId ||
    userId === "undefined" ||
    userId === user._id ||
    !isValidObjectId(userId)
  ) {
    return null;
  }

  const handleFollowToggle = async () => {
    if (
      isLoading ||
      !userId ||
      userId === "undefined" ||
      !isValidObjectId(userId)
    )
      return;

    setIsLoading(true);
    try {
      let result;

      if (isFollowing) {
        result = await followService.unfollowUser(userId);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user",
          duration: 2000,
        });
      } else {
        result = await followService.followUser(userId);
        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this user",
          duration: 2000,
        });

        // Create notification for the followed user
        try {
          const notificationResult =
            await notificationService.createNotification({
              recipientId: userId,
              type: "follow",
              title: "New follower",
              message: `${user.username} started following you`,
              data: {
                followerId: user._id,
                followerUsername: user.username,
              },
            });

          if (!notificationResult.success) {
            console.error(
              "Failed to create follow notification:",
              notificationResult.error,
            );
          }
        } catch (notifError) {
          console.error("Failed to create follow notification:", notifError);
        }
      }

      // Notify parent component of follow status change
      if (onFollowChange) {
        onFollowChange(isFollowing, result);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (!showText) return "";

    if (isLoading) return "";

    if (isFollowing) {
      return isHovered ? "Unfollow" : "Following";
    }

    return "Follow";
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;

    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    if (isFollowing) {
      return isHovered ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserCheck className="h-4 w-4" />
      );
    }

    return <UserPlus className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (variant !== "default") return variant;

    if (isFollowing) {
      return isHovered ? "destructive" : "secondary";
    }

    return "default";
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      size={size}
      variant={getButtonVariant()}
      className={`transition-all duration-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showIcon && showText && (
        <>
          {getButtonIcon()}
          <span className="ml-2">{getButtonText()}</span>
        </>
      )}
      {showIcon && !showText && getButtonIcon()}
      {!showIcon && showText && getButtonText()}
    </Button>
  );
};

export default FollowButton;
