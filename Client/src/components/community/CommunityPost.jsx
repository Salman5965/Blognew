import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { communityService } from "@/services/communityService";
import CommunityReply from "./CommunityReply";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Pin,
  Flag,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Bookmark,
  Reply,
  Send,
  Loader2,
  Hash,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CommunityPost = ({
  post,
  currentUser,
  onUpdate,
  onDelete,
  isCompact = false,
}) => {
  const { toast } = useToast();

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Initialize like state
    // Handle both array format and object format for reactions
    if (Array.isArray(post.reactions)) {
      // Array format: [{ emoji: "👍", users: [...], count: 5 }]
      setIsLiked(
        post.reactions.some(
          (r) => r.emoji === "👍" && r.users?.includes(currentUser?._id),
        ) || false,
      );
      setLikeCount(post.reactions.find((r) => r.emoji === "👍")?.count || 0);
    } else if (post.reactions && typeof post.reactions === "object") {
      // Object format: { "👍": 5, "❤️": 2 }
      setIsLiked(post.isLiked || false);
      setLikeCount(post.reactions["👍"] || post.likes || 0);
    } else {
      // Fallback for simple like count
      setIsLiked(post.isLiked || false);
      setLikeCount(post.likes || 0);
    }

    // Check if bookmarked (would come from user's bookmarks)
    setIsBookmarked(post.isBookmarked || false);
  }, [post, currentUser]);

  const loadReplies = async () => {
    if (loadingReplies) return;

    try {
      setLoadingReplies(true);
      const response = await communityService.getReplies(post._id);
      setReplies(response.replies || []);
    } catch (error) {
      console.error("Error loading replies:", error);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive",
      });
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleShowReplies = () => {
    if (!showReplies) {
      loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleLike = async () => {
    try {
      const response = await communityService.toggleReaction(post._id, "👍");
      setIsLiked(response.isLiked);
      setLikeCount(response.count);

      // Update parent component
      if (onUpdate) {
        onUpdate({ ...post, reactions: response.reactions });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    try {
      await communityService.toggleBookmark(post._id);
      setIsBookmarked(!isBookmarked);

      toast({
        title: "Success",
        description: isBookmarked
          ? "Removed from bookmarks"
          : "Added to bookmarks",
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);

      const response = await communityService.createReply(post._id, {
        content: replyText,
      });

      setReplies((prev) => [...prev, response.reply]);
      setReplyText("");
      setShowReplyForm(false);

      // Update parent post reply count
      if (onUpdate) {
        onUpdate({
          ...post,
          replyCount: (post.replyCount || 0) + 1,
        });
      }

      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await communityService.deletePost(post._id);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      development:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      help: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      career:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      offtopic: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    return colors[category] || colors.general;
  };

  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${isCompact ? "p-4" : ""}`}
    >
      <CardHeader className={isCompact ? "pb-2" : "pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={post.author?.avatar}
                alt={post.author?.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(post.author)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm truncate">
                  {post.author?.firstName && post.author?.lastName
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : post.author?.username}
                </h4>

                {post.author?.role === "admin" && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}

                {post.isPinned && (
                  <Pin className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>@{post.author?.username}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeAgo(post.createdAt)}
                </span>

                {post.category && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(post.category)}`}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {post.category}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Post Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBookmark}>
                <Bookmark
                  className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`}
                />
                {isBookmarked ? "Remove Bookmark" : "Bookmark"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>

              {(currentUser?._id === post.author?._id ||
                currentUser?.role === "admin") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className={isCompact ? "pt-0" : ""}>
        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {post.title}
          </h3>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p
              className={`${isCompact ? "line-clamp-3" : ""} whitespace-pre-wrap`}
            >
              {post.content}
            </p>
          </div>

          {/* Post Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                >
                  <span>📎</span>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {attachment.filename}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Stats and Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              <span>{likeCount}</span>
            </Button>

            {/* Reply Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>Reply</span>
            </Button>

            {/* View Replies */}
            {(post.replyCount > 0 || replies.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowReplies}
                className="text-muted-foreground"
              >
                {showReplies ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                <span>
                  {post.replyCount || replies.length}{" "}
                  {(post.replyCount || replies.length) === 1
                    ? "reply"
                    : "replies"}
                </span>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{post.views || 0}</span>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={currentUser?.avatar}
                  alt={currentUser?.username}
                />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                  {getInitials(currentUser)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-20 resize-none"
                  maxLength={1000}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {replyText.length}/1000 characters
                  </span>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim() || submittingReply}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {submittingReply ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-6 space-y-4">
            {loadingReplies ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No replies yet. Be the first to reply!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {replies.map((reply) => (
                  <CommunityReply
                    key={reply._id}
                    reply={reply}
                    currentUser={currentUser}
                    postId={post._id}
                    onUpdate={(updatedReply) => {
                      setReplies((prev) =>
                        prev.map((r) =>
                          r._id === updatedReply._id ? updatedReply : r,
                        ),
                      );
                    }}
                    onDelete={(replyId) => {
                      setReplies((prev) =>
                        prev.filter((r) => r._id !== replyId),
                      );
                      if (onUpdate) {
                        onUpdate({
                          ...post,
                          replyCount: Math.max(0, (post.replyCount || 0) - 1),
                        });
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityPost;
