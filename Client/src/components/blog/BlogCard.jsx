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
import {
  Heart,
  MessageCircle,
  Eye,
  Clock,
  Bookmark,
  Share2,
} from "lucide-react";
import { LikeButton } from "@/components/shared/LikeButton";
import { FollowButton } from "@/components/shared/FollowButton";
import { useToast } from "@/hooks/use-toast";
import { bookmarkService } from "@/services/bookmarkService";
import { useChatStore } from "@/features/chat/chatStore";
import { useAuthContext } from "@/contexts/AuthContext";
import LazyImage, {
  LazyCoverImage,
  LazyAvatar,
} from "@/components/shared/LazyImage";

export const BlogCard = memo(
  ({ blog, showActions = true, variant = "default" }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user: currentUser } = useAuthContext();
    const { startConversation, openChat } = useChatStore();

    // Memoize computed values
    const blogUrl = useMemo(
      () => `${ROUTES.BLOG_DETAILS}/${blog.slug}`,
      [blog.slug],
    );
    const fullBlogUrl = useMemo(
      () => `${window.location.origin}${ROUTES.BLOG_DETAILS}/${blog.slug}`,
      [blog.slug],
    );
    const authorUrl = useMemo(
      () => `/users/${blog.author._id || blog.author.id}`,
      [blog.author._id, blog.author.id],
    );
    const readTime = useMemo(
      () => Math.ceil((blog.content?.length || 0) / 200),
      [blog.content],
    );
    const authorInitial = useMemo(
      () => blog.author.username.charAt(0).toUpperCase(),
      [blog.author.username],
    );

    // Check if current user is the author
    const isAuthor = currentUser?._id === (blog.author._id || blog.author.id);

    const handleMessageAuthor = async (e) => {
      e.stopPropagation();

      if (!currentUser) {
        toast({
          title: "Sign in required",
          description: "Please sign in to send messages",
          variant: "destructive",
        });
        return;
      }

      if (isAuthor) {
        toast({
          title: "Cannot message yourself",
          description: "You cannot send a message to yourself",
          variant: "destructive",
        });
        return;
      }

      try {
        // Create user object for chat service
        const chatUser = {
          id: blog.author._id || blog.author.id,
          name: blog.author.name || blog.author.username,
          username: blog.author.username,
          avatar: blog.author.avatar,
        };

        // Start conversation with this user
        await startConversation(chatUser);

        // Open chat panel
        openChat();

        toast({
          title: "Chat opened",
          description: `You can now send messages to ${blog.author.username}`,
        });
      } catch (error) {
        console.error("Failed to start conversation:", error);
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        });
      }
    };

    const handleCommentClick = (e) => {
      e.stopPropagation();
      navigate(`${ROUTES.BLOG_DETAILS}/${blog.slug}#comments`);
    };

    const handleBookmark = async (e) => {
      e.stopPropagation();

      try {
        const result = await bookmarkService.toggleBookmark(
          blog._id || blog.id,
        );

        toast({
          title: result.bookmarked ? "Bookmarked!" : "Bookmark removed",
          description: result.bookmarked
            ? "Blog saved to your bookmarks"
            : "Blog removed from bookmarks",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to bookmark blog",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    const handleShare = async (e) => {
      e.stopPropagation();

      // Try native sharing first
      if (navigator.share) {
        try {
          await navigator.share({
            title: blog.title,
            text: blog.excerpt,
            url: fullBlogUrl,
          });
          return;
        } catch (error) {
          // User cancelled or share failed, fall back to clipboard
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(fullBlogUrl);
        toast({
          title: "Link copied!",
          description: "Blog link copied to clipboard",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Unable to share the blog",
          variant: "destructive",
          duration: 3000,
        });
      }
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
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
              {currentUser && !isAuthor && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMessageAuthor}
                    className="h-7 px-3 text-xs"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  {(blog.author?._id || blog.author?.id) && (
                    <FollowButton
                      userId={blog.author._id || blog.author.id}
                      size="sm"
                      showIcon={false}
                      className="h-7 px-3 text-xs"
                    />
                  )}
                </div>
              )}
              {currentUser && isAuthor && (
                <Badge variant="secondary" className="text-xs">
                  Your post
                </Badge>
              )}
              {!currentUser && (blog.author?._id || blog.author?.id) && (
                <FollowButton
                  userId={blog.author._id || blog.author.id}
                  size="sm"
                  showIcon={false}
                  className="h-7 px-3 text-xs"
                />
              )}
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
                    <span>{blog.views || blog.viewCount || 0}</span>
                  </div>
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center space-x-1 hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {blog.commentsCount ||
                        blog.commentCount ||
                        blog.comments?.length ||
                        0}
                    </span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{readTime} min read</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className="h-8 w-8 p-0"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <LikeButton
                    blogId={blog._id || blog.id}
                    likeCount={
                      blog.likesCount ||
                      blog.likeCount ||
                      blog.likes?.length ||
                      0
                    }
                    isLiked={blog.isLiked}
                    size="sm"
                  />
                </div>
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
