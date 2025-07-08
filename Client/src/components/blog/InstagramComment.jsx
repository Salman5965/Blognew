import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatBlogDate, getTimeAgo } from "@/utils/formatDate";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ROUTES } from "@/utils/constant";
import { parseMentions } from "@/utils/mentionParser";
import { MoreHorizontal, Edit, Trash2, Flag, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const InstagramComment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
  canModerate = false,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const commentId = comment._id || comment.id;
  const authorId = comment.author._id || comment.author.id;
  const userId = user?._id || user?.id;
  const isOwner = user && authorId === userId;

  const handleReplyClick = () => {
    if (!isAuthenticated) return;

    // Auto-prefill with @username
    const mentionText = `@${comment.author.username} `;
    setReplyContent(mentionText);
    setIsReplying(true);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      await onReply(commentId, replyContent);
      setReplyContent("");
      setIsReplying(false);
      setShowReplies(true); // Show replies after posting
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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await onDelete(commentId);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    }
  };

  const timeAgo = getTimeAgo(comment.createdAt);

  return (
    <div
      className={cn(
        "py-3",
        !isReply && "border-b border-border/30 last:border-b-0",
      )}
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <Link to={`${ROUTES.USER_PROFILE}/${comment.author.username}`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>
              {comment.author.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[60px] text-sm border-0 bg-muted/50 resize-none"
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
                  variant="ghost"
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
            <div className="leading-relaxed">
              <span className="text-sm">
                <Link
                  to={`${ROUTES.USER_PROFILE}/${comment.author.username}`}
                  className="font-semibold text-foreground hover:opacity-70"
                >
                  {comment.author.username}
                </Link>
                <span className="ml-2 text-foreground">
                  {parseMentions(comment.content)}
                </span>
              </span>
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>

            {!isReply && isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Reply
              </Button>
            )}

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
                    className="h-auto w-auto p-0"
                  >
                    <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
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

          {/* Reply Form - Consistent styling with main comment form */}
          {isReplying && (
            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] text-sm border-0 bg-muted/50 resize-none rounded-lg p-3 focus:bg-muted/70 transition-colors"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {replyContent.length}/1000
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent("");
                    }}
                    className="h-7 px-3 text-xs"
                  >
                    Cancel
                  </Button>
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
                </div>
              </div>
            </div>
          )}

          {/* View Replies Button - Only show if replies exist */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
              >
                {showReplies ? (
                  <>Hide replies</>
                ) : (
                  <>
                    View replies (
                    {comment.repliesCount || comment.replies.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Collapsible Replies with Smooth Animation */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div
              className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${
                showReplies ? "max-h-none opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-6 space-y-2 border-l-2 border-border/30 pl-4 pt-2">
                {comment.replies.map((reply) => (
                  <InstagramComment
                    key={reply._id || reply.id}
                    comment={reply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isReply={true}
                    canModerate={canModerate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
