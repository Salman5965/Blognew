import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Eye,
  User,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FollowButton } from "@/components/shared/FollowButton";
import { MessageButton } from "@/components/shared/MessageButton";

const StoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();

  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    try {
      setIsLoading(true);

      // Simulate API call - replace with actual API call
      // const response = await storyService.getStoryById(id);

      // For now, create a mock story object
      const mockStory = {
        id: id,
        title: "Sample Story Title",
        content:
          "This is a sample story content. In a real implementation, this would be fetched from the API.",
        author: {
          _id: "507f1f77bcf86cd799439011", // Valid ObjectId format
          username: "storyteller",
          firstName: "John",
          lastName: "Doe",
          avatar: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 42,
        commentsCount: 8,
        viewsCount: 156,
        tags: ["fiction", "drama", "short-story"],
        isPublished: true,
      };

      setStory(mockStory);

      // Check if user has liked/bookmarked this story
      if (user) {
        // In real implementation, check user's like/bookmark status
        setIsLiked(false);
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error("Failed to load story:", error);
      toast({
        title: "Error",
        description: "Failed to load story. Please try again.",
        variant: "destructive",
      });

      // Redirect to stories list if story not found
      navigate("/stories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like stories",
        variant: "destructive",
      });
      return;
    }

    try {
      // In real implementation, call API to like/unlike
      setIsLiked(!isLiked);
      setStory((prev) => ({
        ...prev,
        likesCount: prev.likesCount + (isLiked ? -1 : 1),
      }));

      toast({
        title: isLiked ? "Removed from likes" : "Added to likes",
        description: isLiked
          ? "Story removed from your likes"
          : "Story added to your likes",
      });
    } catch (error) {
      console.error("Failed to like story:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to bookmark stories",
        variant: "destructive",
      });
      return;
    }

    try {
      // In real implementation, call API to bookmark/unbookmark
      setIsBookmarked(!isBookmarked);

      toast({
        title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: isBookmarked
          ? "Story removed from your bookmarks"
          : "Story saved to your bookmarks",
      });
    } catch (error) {
      console.error("Failed to bookmark story:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 100) + "...",
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Story link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!story) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Story not found</h1>
          <p className="text-muted-foreground mb-6">
            The story you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/stories")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const isAuthor = user && user._id === story.author._id;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/stories")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>
        </div>

        {/* Story Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-4">{story.title}</CardTitle>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={story.author.avatar} />
                      <AvatarFallback>
                        {story.author.firstName?.[0]}
                        {story.author.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {story.author.firstName} {story.author.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{story.author.username}
                      </p>
                    </div>
                  </div>

                  {!isAuthor &&
                    story.author._id &&
                    story.author._id.match(/^[0-9a-fA-F]{24}$/) && (
                      <div className="flex items-center gap-2">
                        <FollowButton userId={story.author._id} size="sm" />
                        <MessageButton user={story.author} size="sm" />
                      </div>
                    )}
                </div>

                {/* Story Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(story.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {story.viewsCount} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.ceil(story.content.length / 200)} min read
                  </div>
                </div>

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Story Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
              {story.content.split("\n").map(
                (paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ),
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  {story.likesCount}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {story.commentsCount}
                </Button>

                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center gap-2"
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  Save
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section - Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Comments ({story.commentsCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Comments functionality coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default StoryDetails;
