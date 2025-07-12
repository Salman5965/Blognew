/**
 * CommentSection Component - Handles threaded comments and replies
 *
 * Expected Backend Data Structure:
 * - Comment Model should include:
 *   - _id/id: Unique identifier
 *   - content: Comment text content
 *   - author: User object with _id, username, avatar
 *   - blog: Blog post ID
 *   - parentId: Parent comment ID (null for top-level comments)
 *   - createdAt: Timestamp
 *   - updatedAt: Timestamp
 *   - isEdited: Boolean flag
 *
 * - API should support:
 *   - GET /comments/blog/:blogId?includeReplies=true&sort=newest
 *   - POST /comments with { content, blog, parentId? }
 *   - PUT /comments/:id with { content }
 *   - DELETE /comments/:id
 *
 * - Response Structure:
 *   - Top-level comments: parentId === null
 *   - Replies: parentId !== null
 *   - Frontend groups replies under parent comments
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InstagramComment } from "./InstagramComment";
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
        `/comments/blog/${blogId}?sort=${sortOrder}&includeReplies=true`,
      );

      if (response.status === "success") {
        const commentsData = response.data.comments || [];

        // Structure comments with threaded replies
        const structuredComments = commentsData
          .filter((comment) => !comment.parentId) // Get top-level comments only
          .map((comment) => ({
            ...comment,
            replies: commentsData
              .filter((reply) => reply.parentId === (comment._id || comment.id))
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
            repliesCount: commentsData.filter(
              (reply) => reply.parentId === (comment._id || comment.id),
            ).length,
          }))
          .sort((a, b) => {
            if (sortOrder === "newest") {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          });

        setComments(structuredComments);
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
              data: {
                commentId: response.data.comment._id,
                blogId,
                blogTitle: response.data.comment.blog?.title || "your blog",
                commenterUsername: user.username,
              },
            });
            if (!result.success) {
              console.error("Failed to create notification:", result.error);
            }
          } catch (notifError) {
            console.error("Failed to create notification:", notifError);
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

    try {
      const response = await apiService.post("/comments", {
        content: content.trim(),
        blog: blogId,
        parentId: parentCommentId, // Use parentId for threaded structure
      });

      if (response.status === "success") {
        // Update comments state to include the new reply
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if ((comment._id || comment.id) === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data.comment],
                repliesCount: (comment.repliesCount || 0) + 1,
              };
            }
            return comment;
          }),
        );

        // Create notification for parent comment author
        const parentComment = comments.find(
          (c) => (c._id || c.id) === parentCommentId,
        );
        if (
          parentComment &&
          parentComment.author._id !== (user._id || user.id)
        ) {
          try {
            const result = await notificationService.createNotification({
              recipientId: parentComment.author._id,
              type: "comment_reply",
              title: "New reply to your comment",
              message: `${user.username} replied to your comment`,
              data: {
                commentId: parentCommentId,
                blogId,
                blogTitle: parentComment.blog?.title || "a blog post",
                replierUsername: user.username,
              },
            });
            if (!result.success) {
              console.error(
                "Failed to create reply notification:",
                result.error,
              );
            }
          } catch (notifError) {
            console.error("Failed to create reply notification:", notifError);
          }
        }
      } else {
        throw new Error(response.message || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      throw error;
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
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

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

      {/* Comment Form - Clean and consistent styling */}
      {isAuthenticated ? (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none border-0 bg-background/50 text-sm rounded-lg p-3 focus:bg-background/70 transition-colors"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/1000 characters
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
              className="px-6"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
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
        <div className="space-y-4 divide-y divide-border/30">
          {comments.map((comment) => (
            <InstagramComment
              key={comment._id || comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              canModerate={user?.role === "admin"}
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
