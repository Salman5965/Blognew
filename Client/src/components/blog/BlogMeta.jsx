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
import { useToast } from "@/hooks/use-toast";
import { bookmarkService } from "@/services/bookmarkService";
import { useChatStore } from "@/features/chat/chatStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { FollowButton } from "@/components/shared/FollowButton";

export const BlogMeta = ({ blog, variant = "full", showActions = true }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuthContext();
  const { startConversation, openChat } = useChatStore();
  // Safety checks for blog data
  if (!blog || !blog.author) {
    return <div>Loading...</div>;
  }

  const authorUrl = `${ROUTES.HOME}?author=${blog.author.id || blog.author._id}`;
  const readingTime = Math.ceil((blog.content?.length || 0) / 200);

  // Check if current user is the author
  const isAuthor = currentUser?._id === (blog.author._id || blog.author.id);

  const handleMessageAuthor = async () => {
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

  const handleShare = async () => {
    // Try native sharing first
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
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

  const handleBookmark = async () => {
    try {
      const result = await bookmarkService.toggleBookmark(blog._id || blog.id);

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

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center justify-between flex-1">
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

          {/* Author action buttons for compact variant */}
          {currentUser && !isAuthor && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleMessageAuthor}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              {(blog.author?._id || blog.author?.id) && (
                <FollowButton
                  userId={blog.author._id || blog.author.id}
                  size="sm"
                  showIcon={false}
                />
              )}
            </div>
          )}
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
        <div className="flex items-center justify-between flex-1">
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

          {/* Author action buttons */}
          {currentUser && !isAuthor && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleMessageAuthor}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              {(blog.author?._id || blog.author?.id) && (
                <FollowButton
                  userId={blog.author._id || blog.author.id}
                  size="sm"
                  showIcon={false}
                />
              )}
            </div>
          )}
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
            isLiked={blog.isLiked}
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
