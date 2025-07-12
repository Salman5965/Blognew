import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatBlogDate } from "@/utils/formatDate";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserMention } from "@/components/shared/UserMention";
import notificationService from "@/services/notificationService";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Reply,
  Loader2,
  AtSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CommentNew = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isReply = false,
  canModerate = false,
  blogAuthorId,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);

  const commentId = comment._id || comment.id;
  const authorId = comment.author._id || comment.author.id;
  const userId = user?._id || user?.id;

  const isOwner = user && authorId === userId;
  const isLiked = comment.likes?.some((like) => like.user === userId);
  const likeCount = comment.likes?.length || 0;

  // Parse content for mentions
  const parseContentWithMentions = (content) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a username
        return (
          <span key={index} className="text-blue-500 font-medium">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      await onReply(commentId, replyContent);

      // Create notification for comment author (if not replying to self)
      if (authorId !== userId) {
        try {
          const result = await notificationService.createNotification({
            recipientId: authorId,
            type: "comment_reply",
            title: "New reply to your comment",
            message: `${user.username} replied to your comment`,
            data: { commentId, blogId: comment.blog },
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
        if (mentionedUser._id !== userId) {
          try {
            const result = await notificationService.createNotification({
              recipientId: mentionedUser._id,
              type: "mention",
              title: "You were mentioned in a reply",
              message: `${user.username} mentioned you in a reply`,
              data: { commentId, blogId: comment.blog },
            });
            if (!result.success) {
              console.error(
                "Failed to create mention notification:",
                result.error,
              );
            }
          } catch (notifError) {
            console.error("Failed to create mention notification:", notifError);
          }
        }
      }

      setReplyContent("");
      setIsReplying(false);
      setMentionedUsers([]);
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      await onEdit(commentId, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;

    try {
      await onLike(commentId);

      // Create notification for comment author (if not liking own comment)
      if (authorId !== userId && !isLiked) {
        try {
          const result = await notificationService.createNotification({
            recipientId: authorId,
            type: "comment_like",
            title: "Someone liked your comment",
            message: `${user.username} liked your comment`,
            data: { commentId, blogId: comment.blog },
          });
          if (!result.success) {
            console.error("Failed to create like notification:", result.error);
          }
        } catch (notifError) {
          console.error("Failed to create like notification:", notifError);
        }
      }
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

  const handleMention = (user) => {
    const newMention = `@${user.username} `;
    setReplyContent((prev) => prev + newMention);
    setMentionedUsers((prev) => [
      ...prev.filter((u) => u._id !== user._id),
      user,
    ]);
    setShowMention(false);
  };

  return (
    <div
      className={cn(
        "group",
        isReply ? "ml-6 mt-3" : "py-4",
        !isReply && "border-b border-border/50 last:border-b-0",
      )}
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-foreground">
              {comment.author.fullName || comment.author.username}
            </span>
            <span className="text-muted-foreground">
              {formatBlogDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}

            {/* Actions Dropdown */}
            {(isOwner || canModerate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
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
            <div className="mt-2 space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[60px] text-sm"
              />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                  className="h-7 px-3 text-xs"
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
                  className="h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-foreground leading-relaxed">
                {parseContentWithMentions(comment.content)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={cn(
                "h-6 px-0 text-xs text-muted-foreground hover:text-foreground",
                isLiked && "text-red-500 hover:text-red-600",
              )}
            >
              <Heart
                className={cn("h-3 w-3 mr-1", isLiked && "fill-current")}
              />
              {likeCount > 0 && (
                <span className="font-medium">{likeCount}</span>
              )}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                disabled={!isAuthenticated}
                className="h-6 px-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-3">
              <div className="relative">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px] text-sm pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMention(!showMention)}
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                >
                  <AtSign className="h-3 w-3" />
                </Button>
              </div>

              {showMention && (
                <UserMention
                  onMention={handleMention}
                  className="border rounded-md p-2 bg-muted/50"
                />
              )}

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="h-7 px-3 text-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                    setMentionedUsers([]);
                  }}
                  className="h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentNew
              key={reply._id || reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              isReply={true}
              canModerate={canModerate}
              blogAuthorId={blogAuthorId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
