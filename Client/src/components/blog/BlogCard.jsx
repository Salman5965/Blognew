// import React from "react";
// import { Link } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { formatBlogDate } from "@/utils/formatDate";
// import { ROUTES, DEFAULT_COVER_IMAGE } from "@/utils/constant";
// import { Heart, MessageCircle, Eye, Clock } from "lucide-react";
// import { LikeButton } from "@/components/shared/LikeButton";

// export const BlogCard = ({ blog, showActions = true, variant = "default" }) => {
//   const blogUrl = `${ROUTES.BLOG_DETAILS}/${blog.slug}`;
//   const authorUrl = `${ROUTES.HOME}?author=${blog.author.id}`;

//   const renderContent = () => {
//     if (variant === "compact") {
//       return (
//         <div className="flex items-start space-x-4 p-4">
//           <div className="flex-1">
//             <Link to={blogUrl}>
//               <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
//                 {blog.title}
//               </h3>
//             </Link>
//             <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
//               {blog.excerpt}
//             </p>
//             <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
//               <Link
//                 to={authorUrl}
//                 className="flex items-center space-x-2 hover:text-foreground"
//               >
//                 <Avatar className="h-6 w-6">
//                   <AvatarImage src={blog.author.avatar} />
//                   <AvatarFallback className="text-xs">
//                     {blog.author.username.charAt(0).toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <span>{blog.author.username}</span>
//               </Link>
//               <span>•</span>
//               <span>{formatBlogDate(blog.createdAt)}</span>
//             </div>
//           </div>
//           {blog.coverImage && (
//             <div className="flex-shrink-0">
//               <img
//                 src={blog.coverImage}
//                 alt={blog.title}
//                 className="w-20 h-20 object-cover rounded-md"
//               />
//             </div>
//           )}
//         </div>
//       );
//     }

//     return (
//       <>
//         <CardHeader className="p-0">
//           {blog.coverImage && (
//             <div className="aspect-video overflow-hidden rounded-t-lg">
//               <Link to={blogUrl}>
//                 <img
//                   src={blog.coverImage || DEFAULT_COVER_IMAGE}
//                   alt={blog.title}
//                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                 />
//               </Link>
//             </div>
//           )}
//         </CardHeader>

//         <CardContent className="p-6">
//           <div className="flex items-center space-x-2 mb-3">
//             <Link
//               to={authorUrl}
//               className="flex items-center space-x-2 hover:opacity-80"
//             >
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src={blog.author.avatar} />
//                 <AvatarFallback>
//                   {blog.author.username.charAt(0).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>
//               <span className="text-sm font-medium">
//                 {blog.author.username}
//               </span>
//             </Link>
//             <span className="text-muted-foreground">•</span>
//             <span className="text-sm text-muted-foreground">
//               {formatBlogDate(blog.createdAt)}
//             </span>
//           </div>

//           <Link to={blogUrl}>
//             <h3
//               className={`font-semibold hover:text-primary transition-colors line-clamp-2 ${
//                 variant === "featured" ? "text-2xl" : "text-xl"
//               }`}
//             >
//               {blog.title}
//             </h3>
//           </Link>

//           <p className="text-muted-foreground mt-2 line-clamp-3">
//             {blog.excerpt}
//           </p>

//           {blog.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-4">
//               {blog.tags.slice(0, 3).map((tag) => (
//                 <Badge key={tag} variant="secondary" className="text-xs">
//                   {tag}
//                 </Badge>
//               ))}
//               {blog.tags.length > 3 && (
//                 <Badge variant="outline" className="text-xs">
//                   +{blog.tags.length - 3} more
//                 </Badge>
//               )}
//             </div>
//           )}
//         </CardContent>

//         {showActions && (
//           <CardFooter className="px-6 py-4 border-t">
//             <div className="flex items-center justify-between w-full">
//               <div className="flex items-center space-x-4 text-sm text-muted-foreground">
//                 <div className="flex items-center space-x-1">
//                   <Eye className="h-4 w-4" />
//                   <span>{blog.viewCount}</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <MessageCircle className="h-4 w-4" />
//                   <span>{blog.commentCount}</span>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <Clock className="h-4 w-4" />
//                   <span>{Math.ceil(blog.content.length / 200)} min read</span>
//                 </div>
//               </div>

//               <LikeButton
//                 blogId={blog.id}
//                 likeCount={blog.likeCount}
//                 size="sm"
//               />
//             </div>
//           </CardFooter>
//         )}
//       </>
//     );
//   };

//   if (variant === "compact") {
//     return (
//       <Card className="hover:shadow-md transition-shadow">
//         {renderContent()}
//       </Card>
//     );
//   }

//   return (
//     <Card
//       className={`overflow-hidden hover:shadow-lg transition-shadow ${
//         variant === "featured" ? "col-span-2 row-span-2" : ""
//       }`}
//     >
//       {renderContent()}
//     </Card>
//   );
// };

import React, { memo, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBlogDate } from "@/utils/formatDate";
import { ROUTES, DEFAULT_COVER_IMAGE } from "@/utils/constant";
import { Heart, MessageCircle, Eye, Clock } from "lucide-react";
import { LikeButton } from "@/components/shared/LikeButton";
import LazyImage, {
  LazyCoverImage,
  LazyAvatar,
} from "@/components/shared/LazyImage";

export const BlogCard = memo(
  ({ blog, showActions = true, variant = "default" }) => {
    const navigate = useNavigate();

    // Memoize computed values
    const blogUrl = useMemo(
      () => `${ROUTES.BLOG_DETAILS}/${blog.slug}`,
      [blog.slug],
    );
    const authorUrl = useMemo(
      () => `${ROUTES.HOME}?author=${blog.author.id}`,
      [blog.author.id],
    );
    const readTime = useMemo(
      () => Math.ceil((blog.content?.length || 0) / 200),
      [blog.content],
    );
    const authorInitial = useMemo(
      () => blog.author.username.charAt(0).toUpperCase(),
      [blog.author.username],
    );

    const handleCommentClick = (e) => {
      e.stopPropagation();
      navigate(`${ROUTES.BLOG_DETAILS}/${blog.slug}#comments`);
    };

    const renderContent = () => {
      if (variant === "compact") {
        return (
          <div className="flex items-start space-x-4 p-4">
            <div className="flex-1">
              <Link to={blogUrl}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>
              </Link>
              <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                {blog.excerpt}
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                <Link
                  to={authorUrl}
                  className="flex items-center space-x-2 hover:text-foreground"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={blog.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {blog.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{blog.author.username}</span>
                </Link>
                <span>•</span>
                <span>{formatBlogDate(blog.createdAt)}</span>
              </div>
            </div>
            {blog.coverImage && (
              <div className="flex-shrink-0">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        );
      }

      return (
        <>
          <CardHeader className="p-0">
            {blog.coverImage && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <Link to={blogUrl}>
                  <img
                    src={blog.coverImage || DEFAULT_COVER_IMAGE}
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Link
                to={authorUrl}
                className="flex items-center space-x-2 hover:opacity-80"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={blog.author.avatar} />
                  <AvatarFallback>
                    {blog.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {blog.author.username}
                </span>
              </Link>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {formatBlogDate(blog.createdAt)}
              </span>
            </div>

            <Link to={blogUrl}>
              <h3
                className={`font-semibold hover:text-primary transition-colors line-clamp-2 ${
                  variant === "featured" ? "text-2xl" : "text-xl"
                }`}
              >
                {blog.title}
              </h3>
            </Link>

            <p className="text-muted-foreground mt-2 line-clamp-3">
              {blog.excerpt}
            </p>

            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {blog.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {blog.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{blog.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          {showActions && (
            <CardFooter className="px-6 py-4 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{blog.viewCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{blog.commentCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.ceil(blog.content.length / 200)} min read</span>
                  </div>
                </div>

                <LikeButton
                  blogId={blog._id || blog.id}
                  likeCount={blog.likeCount}
                  isLiked={blog.isLiked}
                  size="sm"
                />
              </div>
            </CardFooter>
          )}
        </>
      );
    };

    if (variant === "compact") {
      return (
        <Card className="hover:shadow-md transition-shadow">
          {renderContent()}
        </Card>
      );
    }

    return (
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow ${
          variant === "featured" ? "col-span-2 row-span-2" : ""
        }`}
      >
        {renderContent()}
      </Card>
    );
  },
);
