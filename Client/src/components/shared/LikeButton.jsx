// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Heart } from "lucide-react";
// import { useBlogStore } from "@/features/blogs/blogStore";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { cn } from "@/lib/utils";
// import { useNavigate } from "react-router-dom";
// import { ROUTES } from "@/utils/constant";

// export const LikeButton = ({
//   blogId,
//   likeCount,
//   isLiked = false,
//   size = "md",
//   variant = "ghost",
//   showCount = true,
// }) => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuthContext();
//   const { likeBlog, unlikeBlog } = useBlogStore();
//   const [liked, setLiked] = useState(isLiked);
//   const [count, setCount] = useState(likeCount);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLike = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       navigate(ROUTES.LOGIN);
//       return;
//     }

//     if (isLoading) return;

//     try {
//       setIsLoading(true);

//       if (liked) {
//         await unlikeBlog(blogId);
//         setLiked(false);
//         setCount((prev) => prev - 1);
//       } else {
//         await likeBlog(blogId);
//         setLiked(true);
//         setCount((prev) => prev + 1);
//       }
//     } catch (error) {
//       console.error("Failed to toggle like:", error);
//       // Revert optimistic update
//       setLiked(!liked);
//       setCount(liked ? count + 1 : count - 1);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const sizeClasses = {
//     sm: "h-8 px-2 text-xs",
//     md: "h-9 px-3 text-sm",
//     lg: "h-10 px-4 text-base",
//   };

//   const iconSizes = {
//     sm: "h-3 w-3",
//     md: "h-4 w-4",
//     lg: "h-5 w-5",
//   };

//   return (
//     <Button
//       variant={variant}
//       size="sm"
//       onClick={handleLike}
//       disabled={isLoading}
//       className={cn(
//         "transition-all duration-200",
//         sizeClasses[size],
//         liked && "text-red-500 hover:text-red-600",
//         isLoading && "opacity-50 cursor-not-allowed",
//       )}
//     >
//       <Heart
//         className={cn(
//           iconSizes[size],
//           "transition-all duration-200",
//           liked && "fill-current scale-110",
//           isLoading && "animate-pulse",
//         )}
//       />
//       {showCount && (
//         <span className="ml-1">{count > 0 ? count.toLocaleString() : ""}</span>
//       )}
//     </Button>
//   );
// };

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useBlogStore } from "@/features/blogs/blogStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constant";

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

  // Find the current blog from store to get the most up-to-date like status
  const currentBlog = blogs.find((blog) => (blog._id || blog.id) === blogId);

  // Determine if user has liked based on current blog data or props
  const userHasLiked = currentBlog?.isLiked ?? isLiked;
  const currentLikeCount = currentBlog?.likeCount ?? likeCount;

  const [liked, setLiked] = useState(userHasLiked);
  const [count, setCount] = useState(currentLikeCount);
  const [isLoading, setIsLoading] = useState(false);

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

    if (isLoading) return;

    try {
      setIsLoading(true);

      if (liked) {
        await unlikeBlog(blogId);
        setLiked(false);
        setCount((prev) => prev - 1);
      } else {
        await likeBlog(blogId);
        setLiked(true);
        setCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert optimistic update
      setLiked(!liked);
      setCount(liked ? count + 1 : count - 1);
    } finally {
      setIsLoading(false);
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
