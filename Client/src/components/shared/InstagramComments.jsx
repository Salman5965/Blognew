/**
 * Instagram-Style Comment System
 *
 * A unified comment component that works across Blog, Stories, and Community Posts
 * Features:
 * - Instagram-like UI with avatars, inline usernames, timestamps
 * - Nested replies with smooth expand/collapse animations
 * - Fixed bottom input with auto-expand and @mentions
 * - Optimistic UI updates
 * - Like functionality with instant feedback
 * - Emoji support
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ROUTES } from "@/utils/constant";
import { getTimeAgo } from "@/utils/formatDate";
import { parseMentions } from "@/utils/mentionParser";
import apiService from "@/services/api";
import {
  Heart,
  Send,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Loader2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Smile
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import "./instagram-comments.css";

// Individual Comment Component
const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isReply = false,
  canModerate = false,
  contentType = 'blog',
  contentId
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || comment.likes?.length || 0);

  const commentId = comment._id || comment.id;
  const authorId = comment.author._id || comment.author.id;
  const userId = user?._id || user?.id;
  const isOwner = user && authorId === userId;
  const hasReplies = comment.replies && comment.replies.length > 0;

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

  const handleLike = async () => {
    if (!isAuthenticated) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      await onLike(commentId, newIsLiked);
    } catch (err) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      console.error("Failed to like comment:", err);
    }
  };

  const handleReply = () => {
    if (!isAuthenticated) return;
    onReply(comment);
  };

  const timeAgo = getTimeAgo(comment.createdAt);

  return (
    <div className={cn(
      "flex space-x-3 instagram-comment-item py-2 px-1 rounded-lg",
      isReply && "ml-12 mt-3 reply-line pl-4",
      comment.isOptimistic && "optimistic-comment"
    )}>
      {/* Avatar */}
      <Link to={`${ROUTES.USER_PROFILE}/${comment.author.username}`}>
        <Avatar className="h-8 w-8 flex-shrink-0 comment-avatar">
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
              className="min-h-[60px] text-sm border-0 bg-gray-50 resize-none rounded-lg"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleEdit}
                disabled={isSubmitting || !editContent.trim()}
                size="sm"
                className="h-7 px-3"
              >
                {isSubmitting && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3"
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
          <div className="group">
            {/* Username and Content Inline */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-sm">
                  <Link
                    to={`${ROUTES.USER_PROFILE}/${comment.author.username}`}
                    className="font-semibold text-foreground hover:opacity-70 mr-2"
                  >
                    {comment.author.username}
                  </Link>
                  <span className="text-foreground">
                    {parseMentions(comment.content)}
                  </span>
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-500 ml-2">(edited)</span>
                )}
              </div>

              {/* Like Button */}
              <button
                onClick={handleLike}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:scale-110",
                  isLiked && "opacity-100"
                )}
                disabled={!isAuthenticated}
              >
                <Heart
                  className={cn(
                    "h-3 w-3 transition-all duration-200",
                    isLiked ? "fill-red-500 text-red-500 heart-like-animation" : "text-gray-400 hover:text-gray-600"
                  )}
                />
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500 time-ago cursor-default">{timeAgo}</span>

              {likesCount > 0 && (
                <span className="text-xs text-gray-500 font-medium">
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </span>
              )}

              {isAuthenticated && !isReply && (
                <button
                  onClick={handleReply}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Reply
                </button>
              )}

              {/* More Actions */}
              {(isOwner || canModerate) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {isOwner && (
                      <>
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {!isOwner && (
                      <DropdownMenuItem>
                        <Flag className="h-3 w-3 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {/* View Replies Toggle */}
        {!isReply && hasReplies && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center space-x-1 mt-2 text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span>Hide replies</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>View replies ({comment.repliesCount || comment.replies.length})</span>
              </>
            )}
          </button>
        )}

        {/* Nested Replies */}
        {!isReply && hasReplies && (
          <div className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            showReplies ? "max-h-none opacity-100 replies-expand" : "max-h-0 opacity-0"
          )}>
            <div className="space-y-0 mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id || reply.id}
                  comment={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLike={onLike}
                  onReply={onReply}
                  isReply={true}
                  canModerate={canModerate}
                  contentType={contentType}
                  contentId={contentId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Instagram Comments Component
export const InstagramComments = ({
  contentType = 'blog', // 'blog', 'story', 'community'
  contentId,
  allowComments = true,
  onCommentCountChange
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newComment, adjustTextareaHeight]);

  // Fetch comments
  const fetchComments = async (pageNum = 1, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if contentId is valid
      if (!contentId) {
        throw new Error("Content ID is required");
      }

      // Use the same endpoint as the old comment system for compatibility
      let endpoint;
      let queryParams = `page=${pageNum}&limit=20&includeReplies=true`;

      if (contentType === 'blog') {
        endpoint = `/comments/blog/${contentId}?${queryParams}`;
      } else if (contentType === 'story') {
        // Stories don't have backend support yet, return empty comments
        console.log('Story comments not yet supported by backend');
        setComments([]);
        setHasMore(false);
        setPage(pageNum);
        if (onCommentCountChange) {
          onCommentCountChange(0);
        }
        return;
      } else {
        // For community and other types, use generic endpoint
        endpoint = `/comments?${contentType}=${contentId}&${queryParams}`;
      }

      console.log('Fetching comments from:', endpoint);
      const response = await apiService.get(endpoint);

      if (response.status === "success") {
        const newComments = response.data.comments || response.data || [];

        setComments(prev => reset ? newComments : [...prev, ...newComments]);
        setHasMore(newComments.length === 20);
        setPage(pageNum);

        if (onCommentCountChange) {
          onCommentCountChange(response.data.total || newComments.length);
        }
      } else {
        throw new Error(response.message || "Failed to fetch comments");
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);

      // Handle specific error cases
      if (err.response?.status === 404 && contentType !== 'blog') {
        setError(`Comments for ${contentType} are not supported yet. Coming soon!`);
      } else {
        setError(err.message || "Failed to load comments");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contentId) {
      fetchComments(1, true);
    }
  }, [contentId, contentType]);

  // Submit new comment or reply
  const handleSubmit = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    // Check if backend supports this content type
    if (contentType === 'story') {
      setError("Story comments are not supported yet. Coming soon!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      content: newComment.trim(),
      author: {
        _id: user._id || user.id,
        username: user.username,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      isEdited: false,
      likesCount: 0,
      isLiked: false,
      replies: [],
      repliesCount: 0,
      isOptimistic: true
    };

    try {
      setIsSubmitting(true);

      if (replyingTo) {
        // Handle reply
        optimisticComment.parentId = replyingTo._id || replyingTo.id;

        // Add optimistic reply
        setComments(prev => prev.map(comment => {
          if ((comment._id || comment.id) === optimisticComment.parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), optimisticComment],
              repliesCount: (comment.repliesCount || 0) + 1
            };
          }
          return comment;
        }));

        // API call for reply - format payload based on content type
        const payload = {
          content: newComment.trim(),
          parentId: optimisticComment.parentId
        };

        // Add the appropriate content ID field based on content type
        if (contentType === 'blog') {
          payload.blog = contentId;
        } else if (contentType === 'story') {
          payload.story = contentId;
        } else if (contentType === 'community') {
          payload.community = contentId;
        }

        const response = await apiService.post("/comments", payload);

        if (response.status === "success") {
          // Replace optimistic with real data
          setComments(prev => prev.map(comment => {
            if ((comment._id || comment.id) === optimisticComment.parentId) {
              return {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply._id === optimisticComment._id
                    ? response.data.comment
                    : reply
                )
              };
            }
            return comment;
          }));

          // Note: Notification creation requires admin privileges
          // This should be handled by the backend when creating comments
          // For now, we'll skip the notification to avoid 400 errors
        }
      } else {
        // Handle new comment
        setComments(prev => [optimisticComment, ...prev]);

        // Format payload based on content type
        const payload = {
          content: newComment.trim()
        };

        // Add the appropriate content ID field based on content type
        if (contentType === 'blog') {
          payload.blog = contentId;
        } else if (contentType === 'story') {
          payload.story = contentId;
        } else if (contentType === 'community') {
          payload.community = contentId;
        }

        const response = await apiService.post("/comments", payload);

        if (response.status === "success") {
          // Replace optimistic with real data
          setComments(prev => prev.map(comment =>
            comment._id === optimisticComment._id
              ? response.data.comment
              : comment
          ));

          if (onCommentCountChange) {
            onCommentCountChange(prev => prev + 1);
          }
        }
      }

      setNewComment("");
      setReplyingTo(null);

    } catch (err) {
      console.error("Failed to post comment:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      // Remove optimistic comment on error
      if (replyingTo) {
        setComments(prev => prev.map(comment => {
          if ((comment._id || comment.id) === optimisticComment.parentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== optimisticComment._id),
              repliesCount: Math.max((comment.repliesCount || 1) - 1, 0)
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => prev.filter(comment => comment._id !== optimisticComment._id));
      }

      // Show more specific error message
      let errorMessage = "Failed to post comment";
      if (err.response?.status === 400) {
        errorMessage = "Invalid comment data. Please check your input.";
      } else if (err.response?.status === 401) {
        errorMessage = "You need to be logged in to comment.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to comment.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply click
  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.author.username} `);
    textareaRef.current?.focus();
  };

  // Handle edit comment
  const handleEdit = async (commentId, content) => {
    const response = await apiService.put(`/comments/${commentId}`, {
      content: content.trim()
    });

    if (response.status === "success") {
      setComments(prev => prev.map(comment => {
        if ((comment._id || comment.id) === commentId) {
          return { ...comment, content: content.trim(), isEdited: true };
        }
        // Check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              (reply._id || reply.id) === commentId
                ? { ...reply, content: content.trim(), isEdited: true }
                : reply
            )
          };
        }
        return comment;
      }));
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId) => {
    const response = await apiService.delete(`/comments/${commentId}`);

    if (response.status === "success") {
      setComments(prev => {
        // Check if it's a top-level comment
        const isTopLevel = prev.some(comment => (comment._id || comment.id) === commentId);

        if (isTopLevel) {
          return prev.filter(comment => (comment._id || comment.id) !== commentId);
        } else {
          // It's a reply
          return prev.map(comment => ({
            ...comment,
            replies: comment.replies ? comment.replies.filter(reply => (reply._id || reply.id) !== commentId) : [],
            repliesCount: comment.replies ? Math.max((comment.repliesCount || comment.replies.length) - 1, 0) : 0
          }));
        }
      });

      if (onCommentCountChange) {
        onCommentCountChange(prev => Math.max(prev - 1, 0));
      }
    }
  };

  // Handle like comment
  const handleLike = async (commentId, isLiked) => {
    const endpoint = isLiked ? `/comments/${commentId}/like` : `/comments/${commentId}/unlike`;
    await apiService.post(endpoint);
  };

  // Load more comments
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchComments(page + 1, false);
    }
  };

  // Handle key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!allowComments) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-gray-500">Comments are disabled for this post</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchComments(1, true)}
          disabled={isLoading}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 comments-container"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {error && (
          <div className="text-center py-4 text-red-500">{error}</div>
        )}

        {isLoading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id || comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLike={handleLike}
                canModerate={user?.role === "admin"}
                contentType={contentType}
                contentId={contentId}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load more comments"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Fixed Comment Input */}
      {isAuthenticated && (
        <div className="border-t bg-white p-4 sticky bottom-0">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                Replying to <span className="font-semibold">@{replyingTo.author.username}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment("");
                }}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingTo ? `Reply to ${replyingTo.author.username}...` : "Add a comment..."}
                  className="min-h-[40px] max-h-[120px] resize-none border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  style={{ height: '40px' }}
                />

                {/* Emoji Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    // Add emoji picker logic here
                    setNewComment(prev => prev + "😊");
                  }}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !newComment.trim()}
                size="sm"
                className={cn(
                  "h-10 w-10 rounded-full p-0 transition-all duration-200",
                  newComment.trim()
                    ? "bg-blue-500 hover:bg-blue-600 send-button-active transform hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramComments;
