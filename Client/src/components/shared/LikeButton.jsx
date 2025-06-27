import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useBlogStore } from "@/features/blogs/blogStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constant";
import { useToast } from "@/hooks/use-toast";

export const LikeButton = ({
  blogId,
  likeCount = 0,
  isLiked = false,
  blogLikes = [],
  size = "md",
  variant = "ghost",
  showCount = true,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const { likeBlog, unlikeBlog, blogs } = useBlogStore();
  const { toast } = useToast();

  // Find the current blog from store to get the most up-to-date like status
  const currentBlog = blogs.find((blog) => (blog._id || blog.id) === blogId);

  // Determine if user has liked based on current blog data or props
  const userHasLiked = currentBlog?.isLiked ?? isLiked;
  const currentLikeCount = currentBlog?.likeCount ?? likeCount;

  const [liked, setLiked] = useState(userHasLiked);
  const [count, setCount] = useState(currentLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Rate limiting state
  const lastClickTime = useRef(0);
  const isRequestInProgress = useRef(false);
  const RATE_LIMIT_DELAY = 1000; // 1 second between requests

  // Sync with prop changes and store updates
  useEffect(() => {
    setLiked(userHasLiked);
    setCount(currentLikeCount);
  }, [userHasLiked, currentLikeCount, blogId]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Prevent double-clicking and rapid requests
    if (isLoading || isRequestInProgress.current) {
      return;
    }

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick < RATE_LIMIT_DELAY) {
      toast({
        title: "Please wait",
        description: "You're clicking too fast. Please try again in a moment.",
        variant: "default",
        duration: 2000,
      });
      return;
    }

    lastClickTime.current = now;
    isRequestInProgress.current = true;

    const originalLiked = liked;
    const originalCount = count;

    try {
      setIsLoading(true);

      // Optimistic update
      setLiked(!liked);
      setCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

      // Make API call - the backend toggles the like state
      const result = await likeBlog(blogId);

      // Update with server response
      setLiked(result.isLiked);
      setCount(result.likeCount);
    } catch (error) {
      console.error("Failed to toggle like:", error);

      // Revert optimistic update
      setLiked(originalLiked);
      setCount(originalCount);

      // Handle specific error types
      if (error.response?.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description:
            "You're liking posts too quickly. Please wait a moment and try again.",
          variant: "destructive",
          duration: 3000,
        });
      } else if (error.response?.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to like posts.",
          variant: "destructive",
          duration: 3000,
        });
        navigate(ROUTES.LOGIN);
      } else {
        toast({
          title: "Something went wrong",
          description: "Failed to update like. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  };

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        sizeClasses[size],
        liked && "text-red-500 hover:text-red-600",
        isLoading && "opacity-50 cursor-not-allowed",
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          liked && "fill-current scale-110",
          isLoading && "animate-pulse",
        )}
      />
      {showCount && (
        <span className="ml-1">{count > 0 ? count.toLocaleString() : ""}</span>
      )}
    </Button>
  );
};
