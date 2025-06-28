import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { followService } from "@/services/followService";
import { UserPlus, UserMinus, Loader2, UserCheck } from "lucide-react";

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
  const [isFollowing, setIsFollowing] = useState(initialFollowingStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();

  // Don't show follow button for current user
  if (!user || user._id === userId) {
    return null;
  }

  // Check initial following status
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const following = await followService.isFollowing(userId);
        setIsFollowing(following);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (isLoading) return;

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
