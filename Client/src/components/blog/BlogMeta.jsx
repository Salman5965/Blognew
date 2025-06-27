// import React from "react";
// import { Link } from "react-router-dom";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { formatBlogDate, getTimeAgo } from "@/utils/formatDate";
// import { ROUTES } from "@/utils/constant";
// import {
//   Calendar,
//   Clock,
//   Eye,
//   MessageCircle,
//   Share2,
//   Bookmark,
//   MoreHorizontal,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { LikeButton } from "@/components/shared/LikeButton";

// export const BlogMeta = ({
//   blog,
//   variant = "full",
//   showActions = true,
// }) => {
//   const authorUrl = `${ROUTES.HOME}?author=${blog.author.id}`;
//   const readingTime = Math.ceil(blog.content.length / 200);

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: blog.title,
//           text: blog.excerpt,
//           url: window.location.href,
//         });
//       } catch (error) {
//         copyToClipboard();
//       }
//     } else {
//       copyToClipboard();
//     }
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(window.location.href);
//   };

//   const handleBookmark = () => {
//     console.log("Bookmark blog:", blog.id);
//   };

//   if (variant === "compact") {
//     return (
//       <div className="flex items-center justify-between border-b pb-4 mb-6">
//         <div className="flex items-center space-x-4">
//           <Link
//             to={authorUrl}
//             className="flex items-center space-x-3 hover:opacity-80"
//           >
//             <Avatar className="h-10 w-10">
//               <AvatarImage src={blog.author.avatar} />
//               <AvatarFallback>
//                 {blog.author.username.charAt(0).toUpperCase()}
//               </AvatarFallback>
//             </Avatar>
//             <div>
//               <p className="font-medium">{blog.author.username}</p>
//               <p className="text-sm text-muted-foreground">
//                 {formatBlogDate(blog.createdAt)}
//               </p>
//             </div>
//           </Link>
//         </div>

//         {showActions && (
//           <div className="flex items-center space-x-2">
//             <LikeButton blogId={blog.id} likeCount={blog.likeCount} />
//             <Button variant="ghost" size="sm" onClick={handleShare}>
//               <Share2 className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="sm" onClick={handleBookmark}>
//               <Bookmark className="h-4 w-4" />
//             </Button>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Author and Date */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <Link
//             to={authorUrl}
//             className="flex items-center space-x-3 hover:opacity-80"
//           >
//             <Avatar className="h-12 w-12">
//               <AvatarImage src={blog.author.avatar} />
//               <AvatarFallback>
//                 {blog.author.username.charAt(0).toUpperCase()}
//               </AvatarFallback>
//             </Avatar>
//             <div>
//               <p className="font-semibold">{blog.author.username}</p>
//               {blog.author.bio && (
//                 <p className="text-sm text-muted-foreground">
//                   {blog.author.bio}
//                 </p>
//               )}
//             </div>
//           </Link>
//         </div>

//         {showActions && (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm">
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={handleShare}>
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleBookmark}>
//                 <Bookmark className="h-4 w-4 mr-2" />
//                 Bookmark
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         )}
//       </div>

//       {/* Meta Information */}
//       <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
//         <div className="flex items-center space-x-1">
//           <Calendar className="h-4 w-4" />
//           <span>{formatBlogDate(blog.createdAt)}</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <Clock className="h-4 w-4" />
//           <span>{readingTime} min read</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <Eye className="h-4 w-4" />
//           <span>{blog.viewCount.toLocaleString()} views</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <MessageCircle className="h-4 w-4" />
//           <span>{blog.commentCount} comments</span>
//         </div>
//       </div>

//       {/* Tags */}
//       {blog.tags.length > 0 && (
//         <div className="flex flex-wrap gap-2">
//           {blog.tags.map((tag) => (
//             <Badge key={tag} variant="secondary">
//               {tag}
//             </Badge>
//           ))}
//         </div>
//       )}

//       {/* Action Buttons */}
//       {showActions && (
//         <div className="flex items-center space-x-4 pt-4 border-t">
//           <LikeButton blogId={blog.id} likeCount={blog.likeCount} />
//           <Button variant="outline" size="sm" onClick={handleShare}>
//             <Share2 className="h-4 w-4 mr-2" />
//             Share
//           </Button>
//           <Button variant="outline" size="sm" onClick={handleBookmark}>
//             <Bookmark className="h-4 w-4 mr-2" />
//             Bookmark
//           </Button>
//         </div>
//       )}

//       {/* Last Updated */}
//       {blog.updatedAt !== blog.createdAt && (
//         <p className="text-xs text-muted-foreground border-t pt-4">
//           Last updated {getTimeAgo(blog.updatedAt)}
//         </p>
//       )}
//     </div>
//   );
// };

import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBlogDate, getTimeAgo } from "@/utils/formatDate";
import { ROUTES } from "@/utils/constant";
import {
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LikeButton } from "@/components/shared/LikeButton";

export const BlogMeta = ({ blog, variant = "full", showActions = true }) => {
  // Safety checks for blog data
  if (!blog || !blog.author) {
    return <div>Loading...</div>;
  }

  const authorUrl = `${ROUTES.HOME}?author=${blog.author.id || blog.author._id}`;
  const readingTime = Math.ceil((blog.content?.length || 0) / 200);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleBookmark = () => {
    console.log("Bookmark blog:", blog.id);
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to={authorUrl}
            className="flex items-center space-x-3 hover:opacity-80"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={blog.author.avatar} />
              <AvatarFallback>
                {blog.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{blog.author.username}</p>
              <p className="text-sm text-muted-foreground">
                {formatBlogDate(blog.createdAt)}
              </p>
            </div>
          </Link>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            <LikeButton
              blogId={blog.id || blog._id}
              likeCount={blog.likeCount || 0}
              isLiked={blog.isLiked}
              blogLikes={blog.likes || []}
            />
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBookmark}>
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Author and Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={authorUrl}
            className="flex items-center space-x-3 hover:opacity-80"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={blog.author.avatar} />
              <AvatarFallback>
                {blog.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{blog.author.username}</p>
              {blog.author.bio && (
                <p className="text-sm text-muted-foreground">
                  {blog.author.bio}
                </p>
              )}
            </div>
          </Link>
        </div>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBookmark}>
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{formatBlogDate(blog.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{readingTime} min read</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4" />
          <span>{(blog.views || 0).toLocaleString()} views</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{blog.commentCount || 0} comments</span>
        </div>
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center space-x-4 pt-4 border-t">
          <LikeButton
            blogId={blog.id || blog._id}
            likeCount={blog.likeCount || 0}
            blogLikes={blog.likes || []}
          />
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleBookmark}>
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </Button>
        </div>
      )}

      {/* Last Updated */}
      {blog.updatedAt &&
        blog.createdAt &&
        blog.updatedAt !== blog.createdAt && (
          <p className="text-xs text-muted-foreground border-t pt-4">
            Last updated {getTimeAgo(blog.updatedAt)}
          </p>
        )}
    </div>
  );
};
