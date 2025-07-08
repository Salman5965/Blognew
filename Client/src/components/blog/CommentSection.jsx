import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommentNew } from "./CommentNew";
import { UserMention } from "@/components/shared/UserMention";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/utils/constant";
import apiService from "@/services/api";
import notificationService from "@/services/notificationService";
import {
  MessageCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  SortAsc,
  SortDesc,
  AtSign,
  Heart,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CommentSection = ({
  blogId,
  allowComments = true,
  blogAuthorId,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showMention, setShowMention] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
  }, [blogId, sortOrder]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.get(
        `/comments/blog/${blogId}?sort=${sortOrder}`,
      );

      if (response.status === "success") {
        const commentsData = response.data.comments || [];
        setComments(commentsData);

        // Calculate total likes across all comments and replies
        const calculateTotalLikes = (comments) => {
          return comments.reduce((total, comment) => {
            const commentLikes = comment.likes?.length || 0;
            const replyLikes =
              comment.replies?.reduce(
                (replyTotal, reply) => replyTotal + (reply.likes?.length || 0),
                0,
              ) || 0;
            return total + commentLikes + replyLikes;
          }, 0);
        };

        setTotalLikes(calculateTotalLikes(commentsData));
      } else {
        throw new Error(response.message || "Failed to fetch comments");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await apiService.post("/comments", {
        content: newComment.trim(),
        blog: blogId,
      });

      if (response.status === "success") {
        setNewComment("");
        setMentionedUsers([]);

        // Add new comment to the beginning of the list
        setComments((prev) => [response.data.comment, ...prev]);

        // Create notification for blog author (if not commenting on own blog)
        if (blogAuthorId && blogAuthorId !== (user._id || user.id)) {
          try {
            const result = await notificationService.createNotification({
              recipientId: blogAuthorId,
              type: "comment",
              title: "New comment on your blog",
              message: `${user.username} commented on your blog`,
              data: { commentId: response.data.comment._id, blogId },
            });
            if (!result.success) {
              console.error("Failed to create notification:", result.error);
            }
          } catch (notifError) {
            console.error("Failed to create notification:", notifError);
          }
        }

        // Create notifications for mentioned users
        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser._id !== (user._id || user.id)) {
            try {
              const result = await notificationService.createNotification({
                recipientId: mentionedUser._id,
                type: "mention",
                title: "You were mentioned in a comment",
                message: `${user.username} mentioned you in a comment`,
                data: { commentId: response.data.comment._id, blogId },
              });
              if (!result.success) {
                console.error(
                  "Failed to create mention notification:",
                  result.error,
                );
              }
            } catch (notifError) {
              console.error(
                "Failed to create mention notification:",
                notifError,
              );
            }
          }
        }
      } else {
        throw new Error(response.message || "Failed to post comment");
      }
    } catch (err) {
      setError(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    if (!content.trim()) return;

    const response = await apiService.post("/comments", {
      content: content.trim(),
      blog: blogId,
      parentComment: parentCommentId,
    });

    if (response.status === "success") {
      // Refresh comments to show the new reply
      fetchComments();
    } else {
      throw new Error(response.message || "Failed to post reply");
    }
  };

  const handleEditComment = async (commentId, content) => {
    if (!content.trim()) return;

    const response = await apiService.put(`/comments/${commentId}`, {
      content: content.trim(),
    });

    if (response.status === "success") {
      // Update the comment in the list
      setComments((prev) =>
        prev.map((comment) =>
          (comment._id || comment.id) === commentId
            ? { ...comment, content: content.trim(), isEdited: true }
            : comment,
        ),
      );
    } else {
      throw new Error(response.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const response = await apiService.delete(`/comments/${commentId}`);

    if (response.status === "success") {
      // Remove the comment from the list
      setComments((prev) =>
        prev.filter((comment) => (comment._id || comment.id) !== commentId),
      );
    } else {
      throw new Error(response.message || "Failed to delete comment");
    }
  };

  const handleMention = (user) => {
    const newMention = `@${user.username} `;
    setNewComment((prev) => prev + newMention);
    setMentionedUsers((prev) => [
      ...prev.filter((u) => u._id !== user._id),
      user,
    ]);
    setShowMention(false);
  };
  const handleLikeComment = async (commentId) => {
    const response = await apiService.post(`/comments/${commentId}/like`);

    if (response.status === "success") {
      // Update the comment like status
      setComments((prev) =>
        prev.map((comment) =>
          (comment._id || comment.id) === commentId
            ? {
                ...comment,
                likes: response.data.isLiked
                  ? [...(comment.likes || []), { user: user._id || user.id }]
                  : (comment.likes || []).filter(
                      (like) => like.user !== (user._id || user.id),
                    ),
              }
            : comment,
        ),
      );
    }
  };
  if (!allowComments) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Comments are disabled for this post</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
          {totalLikes > 0 && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{totalLikes} likes</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Newest
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Oldest
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchComments}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[100px] resize-none pr-12"
              maxLength={1000}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMention(!showMention)}
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </div>

          {showMention && (
            <UserMention
              onMention={handleMention}
              className="border rounded-md p-3 bg-muted/50"
            />
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/1000 characters
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageCircle className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-3">
            Sign in to join the conversation
          </p>
          <Button onClick={() => navigate(ROUTES.LOGIN)}>Sign In</Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentNew
              key={comment._id || comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onLike={handleLikeComment}
              canModerate={user?.role === "admin"}
              blogAuthorId={blogAuthorId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};
