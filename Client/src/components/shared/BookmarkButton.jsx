import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constant";
import { useToast } from "@/hooks/use-toast";

const BookmarkButton = ({
  blogId,
  initialIsBookmarked = false,
  size = "sm",
  variant = "ghost",
  disabled = false,
  className = "",
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      });
      navigate(ROUTES.LOGIN);
      return;
    }

    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // TODO: Implement actual bookmark API call
      // For now, just toggle the state
      const newBookmarkState = !isBookmarked;
      setIsBookmarked(newBookmarkState);

      toast({
        title: newBookmarkState ? "Post bookmarked" : "Bookmark removed",
        description: newBookmarkState
          ? "Post saved to your bookmarks"
          : "Post removed from bookmarks",
      });
    } catch (error) {
      console.error("Bookmark error:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBookmark}
      disabled={disabled || isLoading}
      className={cn(
        sizeClasses[size],
        "transition-all duration-200",
        isBookmarked
          ? "text-yellow-600 hover:text-yellow-700"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
    >
      {isBookmarked ? (
        <BookmarkCheck className={cn(iconSizes[size], "fill-current")} />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
    </Button>
  );
};

export default BookmarkButton;
