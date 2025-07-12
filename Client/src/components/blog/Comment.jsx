
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatBlogDate } from "@/utils/formatDate";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Reply,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Comment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isReply = false,
  canModerate = false,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const commentId = comment._id || comment.id;
  const authorId = comment.author._id || comment.author.id;
  const userId = user?._id || user?.id;

  const isOwner = user && authorId === userId;
  const isLiked = comment.likes?.some((like) => like.user === userId);
  const likeCount = comment.likes?.length || 0;

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onReply(commentId, replyContent);
      setReplyContent("");
      setIsReplying(false);
    } catch (err) {
      setError(err.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onEdit(commentId, editContent);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;

    try {
      await onLike(commentId);
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await onDelete(commentId);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    }
  };

  return (
    <div
      className={`${isReply ? "ml-8 border-l-2 border-muted pl-4" : ""} space-y-3`}
    >
      {/* Comment Header */}
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">
                {comment.author.fullName || comment.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBlogDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Comment Actions */}
            {(isOwner || canModerate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          )}

          {/* Comment Actions Bar */}
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`h-6 px-2 text-xs ${isLiked ? "text-red-500" : ""}`}
            >
              <Heart
                className={`h-3 w-3 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              {likeCount > 0 && likeCount}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                disabled={!isAuthenticated}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Post Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id || reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              isReply={true}
              canModerate={canModerate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
