import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { communityService } from "@/services/communityService";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Reply,
  Send,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CommunityReply = ({
  reply,
  currentUser,
  postId,
  onUpdate,
  onDelete,
  depth = 0,
  maxDepth = 3,
}) => {
  const { toast } = useToast();

  const [showNestedReplies, setShowNestedReplies] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [loadingNested, setLoadingNested] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);

  useEffect(() => {
    // Initialize like state
    setIsLiked(
      reply.reactions?.some(
        (r) => r.emoji === "👍" && r.users.includes(currentUser?._id),
      ) || false,
    );

    setLikeCount(reply.reactions?.find((r) => r.emoji === "👍")?.count || 0);
  }, [reply, currentUser]);

  const loadNestedReplies = async () => {
    if (loadingNested) return;

    try {
      setLoadingNested(true);
      const response = await communityService.getReplies(postId, reply._id);
      setNestedReplies(response.replies || []);
    } catch (error) {
      console.error("Error loading nested replies:", error);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive",
      });
    } finally {
      setLoadingNested(false);
    }
  };

  const handleShowNested = () => {
    if (!showNestedReplies && nestedReplies.length === 0) {
      loadNestedReplies();
    }
    setShowNestedReplies(!showNestedReplies);
  };

  const handleLike = async () => {
    try {
      const response = await communityService.toggleReaction(
        reply._id,
        "👍",
        "reply",
      );
      setIsLiked(response.isLiked);
      setLikeCount(response.count);

      // Update parent component
      if (onUpdate) {
        onUpdate({ ...reply, reactions: response.reactions });
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

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);

      const response = await communityService.createReply(postId, {
        content: replyText,
        parentMessage: reply._id,
        replyTo: reply.author._id,
      });

      setNestedReplies((prev) => [...prev, response.reply]);
      setReplyText("");
      setShowReplyForm(false);

      // Show nested replies if they were hidden
      if (!showNestedReplies) {
        setShowNestedReplies(true);
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

  const handleEdit = async () => {
    if (!editText.trim() || editText === reply.content) {
      setIsEditing(false);
      setEditText(reply.content);
      return;
    }

    try {
      const response = await communityService.updateReply(reply._id, {
        content: editText,
      });

      if (onUpdate) {
        onUpdate(response.reply);
      }

      setIsEditing(false);

      toast({
        title: "Success",
        description: "Reply updated successfully!",
      });
    } catch (error) {
      console.error("Error updating reply:", error);
      toast({
        title: "Error",
        description: "Failed to update reply",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      await communityService.deleteReply(reply._id);
      if (onDelete) {
        onDelete(reply._id);
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast({
        title: "Error",
        description: "Failed to delete reply",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const replyDate = new Date(date);
    const diffInSeconds = Math.floor((now - replyDate) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return replyDate.toLocaleDateString();
  };

  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  // Calculate indentation based on depth
  const indentLevel = Math.min(depth, maxDepth);
  const marginLeft = indentLevel * 24; // 24px per level

  return (
    <div className="relative" style={{ marginLeft: `${marginLeft}px` }}>
      {/* Threading Line */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-border"
          style={{ left: `-${marginLeft - 12}px` }}
        />
      )}

      <div className="bg-muted/30 rounded-lg p-4 border-l-2 border-transparent hover:border-l-blue-500 transition-colors">
        {/* Reply Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={reply.author?.avatar}
                alt={reply.author?.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                {getInitials(reply.author)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h5 className="font-medium text-sm truncate">
                  {reply.author?.firstName && reply.author?.lastName
                    ? `${reply.author.firstName} ${reply.author.lastName}`
                    : reply.author?.username}
                </h5>

                {reply.author?.role === "admin" && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}

                {reply.replyTo && reply.replyTo._id !== reply.author._id && (
                  <span className="text-xs text-muted-foreground">
                    replying to @{reply.replyTo.username}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>@{reply.author?.username}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeAgo(reply.createdAt)}
                </span>

                {reply.isEdited && (
                  <>
                    <span>•</span>
                    <span className="italic">edited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reply Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>

              {(currentUser?._id === reply.author?._id ||
                currentUser?.role === "admin") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
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

        {/* Reply Content */}
        {isEditing ? (
          <div className="space-y-3 mb-3">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-20 resize-none"
              maxLength={1000}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {editText.length}/1000 characters
              </span>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(reply.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
          </div>
        )}

        {/* Reply Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? "text-red-600 dark:text-red-400" : "text-muted-foreground"} h-7 px-2`}
            >
              <Heart
                className={`h-3 w-3 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              <span className="text-xs">{likeCount}</span>
            </Button>

            {/* Reply Button (only show if not at max depth) */}
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-muted-foreground h-7 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            )}

            {/* Show nested replies */}
            {reply.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowNested}
                className="text-muted-foreground h-7 px-2"
              >
                {showNestedReplies ? (
                  <ChevronUp className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs">
                  {reply.replyCount}{" "}
                  {reply.replyCount === 1 ? "reply" : "replies"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && depth < maxDepth && (
          <div className="mt-4 p-3 bg-background/50 rounded-lg border">
            <div className="flex space-x-3">
              <Avatar className="w-6 h-6">
                <AvatarImage
                  src={currentUser?.avatar}
                  alt={currentUser?.username}
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs">
                  {getInitials(currentUser)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={`Reply to ${reply.author?.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-16 resize-none text-sm"
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
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
                      )}
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {showNestedReplies && (
          <div className="mt-4 space-y-3">
            {loadingNested ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : nestedReplies.length === 0 ? (
              <div className="text-center py-3 text-muted-foreground text-sm">
                <MessageCircle className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <p>No replies yet.</p>
              </div>
            ) : (
              nestedReplies.map((nestedReply) => (
                <CommunityReply
                  key={nestedReply._id}
                  reply={nestedReply}
                  currentUser={currentUser}
                  postId={postId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onUpdate={(updatedReply) => {
                    setNestedReplies((prev) =>
                      prev.map((r) =>
                        r._id === updatedReply._id ? updatedReply : r,
                      ),
                    );
                  }}
                  onDelete={(replyId) => {
                    setNestedReplies((prev) =>
                      prev.filter((r) => r._id !== replyId),
                    );
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityReply;
