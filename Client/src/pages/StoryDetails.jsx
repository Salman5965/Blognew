import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InstagramComments } from "@/components/shared/InstagramComments";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/utils/constant";
import { getTimeAgo } from "@/utils/formatDate";
import apiService from "@/services/api";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Loader2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch story details
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get(`/stories/${id}`);

        if (response.status === "success") {
          setStory(response.data.story);
          setIsLiked(response.data.story.isLiked || false);
          setLikesCount(response.data.story.likesCount || 0);
          setIsBookmarked(response.data.story.isBookmarked || false);
        } else {
          throw new Error(response.message || "Failed to fetch story");
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError(err.message || "Failed to load story");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) return;

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      const endpoint = newIsLiked ? `/stories/${id}/like` : `/stories/${id}/unlike`;
      await apiService.post(endpoint);
    } catch (err) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      console.error("Failed to like story:", err);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return;

    // Story bookmarks not yet supported by backend
    alert("Story bookmarks coming soon! This feature is under development.");
    return;

    // TODO: Implement when backend supports story bookmarks
    // const newIsBookmarked = !isBookmarked;
    // setIsBookmarked(newIsBookmarked);
    // try {
    //   const endpoint = newIsBookmarked ? `/stories/${id}/bookmark` : `/stories/${id}/unbookmark`;
    //   await apiService.post(endpoint);
    // } catch (err) {
    //   setIsBookmarked(!newIsBookmarked);
    //   console.error("Failed to bookmark story:", err);
    // }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.excerpt || story.content.substring(0, 100) + "...",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !story) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Story Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "The story you're looking for doesn't exist."}</p>
          <Button onClick={() => navigate("/stories")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const isOwner = user && (story.author._id === user._id || story.author._id === user.id);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/stories")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/stories/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Story
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Story
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Story Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Link to={`${ROUTES.USER_PROFILE}/${story.author.username}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={story.author.avatar} />
                    <AvatarFallback>
                      {story.author.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link
                    to={`${ROUTES.USER_PROFILE}/${story.author.username}`}
                    className="font-semibold hover:underline"
                  >
                    {story.author.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {getTimeAgo(story.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
                  Story
                </Badge>
                {story.category && (
                  <Badge variant="secondary">{story.category}</Badge>
                )}
              </div>
            </div>

            {/* Story Title */}
            <h1 className="text-3xl font-bold mb-4">{story.title}</h1>

            {/* Story Media */}
            {story.media && (
              <div className="mb-6">
                {story.media.type === 'video' ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      className="w-full h-full object-cover"
                      poster={story.media.thumbnail}
                      controls={isPlaying}
                      muted={isMuted}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={story.media.url} type="video/mp4" />
                    </video>

                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="lg"
                          variant="secondary"
                          className="rounded-full h-16 w-16"
                          onClick={() => setIsPlaying(true)}
                        >
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                      </div>
                    )}

                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : story.media.type === 'image' ? (
                  <img
                    src={story.media.url}
                    alt={story.title}
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                ) : null}
              </div>
            )}

            {/* Story Content */}
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-lg leading-relaxed">{story.content}</p>
            </div>

            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {story.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Story Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors"
                  disabled={!isAuthenticated}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{likesCount}</span>
                </button>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <span>{story.commentsCount || 0}</span>
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Eye className="h-5 w-5" />
                  <span>{story.viewsCount || 0}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBookmark}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={!isAuthenticated}
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instagram-Style Comments */}
        <Card>
          <InstagramComments
            contentType="story"
            contentId={story._id || story.id}
            allowComments={story.allowComments !== false}
            onCommentCountChange={(count) => {
              setStory(prev => ({
                ...prev,
                commentsCount: count
              }));
            }}
          />
        </Card>
      </div>
    </PageWrapper>
  );
};

export default StoryDetails;
