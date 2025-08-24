<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { storyService } from "@/services/storyService";
import { formatDistanceToNow } from "date-fns";
import {
>>>>>>> refs/remotes/origin/main
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
<<<<<<< HEAD
=======
  Eye,
  Clock,
  MapPin,
  MoreHorizontal,
>>>>>>> refs/remotes/origin/main
  Play,
  Pause,
  Volume2,
  VolumeX,
<<<<<<< HEAD
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Loader2,
  Eye
=======
  Maximize,
  ArrowLeft,
  Edit,
  Trash2,
  Flag,
  Download,
  Calendar,
  User,
  Hash,
  ThumbsUp,
  Send,
  Loader2,
  AlertTriangle,
>>>>>>> refs/remotes/origin/main
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StoryDetails = () => {
<<<<<<< HEAD
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
=======
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  // Refs for media elements
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // State management
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [error, setError] = useState(null);

  // Video/Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (storyId) {
      loadStory();
      loadComments();
    }
  }, [storyId]);

  const loadStory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storyService.getStoryById(storyId);

      if (response && response.story) {
        setStory(response.story);
        setIsLiked(response.story.isLiked || false);
        setLikesCount(response.story.likesCount || 0);
        setIsBookmarked(response.story.isBookmarked || false);

        // Increment view count
        await storyService.incrementViews(storyId);
      } else {
        setError("Story not found");
      }
    } catch (error) {
      console.error("Error loading story:", error);
      setError("Failed to load story");
      toast({
        title: "Error",
        description: "Failed to load story",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await storyService.getComments(storyId);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like stories",
        variant: "destructive",
      });
      return;
    }

    try {
      await storyService.toggleLike(storyId);
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

      toast({
        title: isLiked ? "Story unliked" : "Story liked",
        description: isLiked
          ? "Removed from your liked stories"
          : "Added to your liked stories",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
>>>>>>> refs/remotes/origin/main
    }
  };

  const handleBookmark = async () => {
<<<<<<< HEAD
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
=======
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark stories",
        variant: "destructive",
      });
      return;
    }

    try {
      await storyService.toggleBookmark(storyId);
      setIsBookmarked(!isBookmarked);

      toast({
        title: isBookmarked ? "Bookmark removed" : "Story bookmarked",
        description: isBookmarked
          ? "Removed from your bookmarks"
          : "Added to your bookmarks",
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await storyService.addComment(
        storyId,
        newComment.trim(),
      );

      if (response.comment) {
        setComments((prev) => [response.comment, ...prev]);
        setNewComment("");
        toast({
          title: "Comment Added",
          description: "Your comment has been posted successfully",
        });
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || "Check out this story",
          text: story?.excerpt || "An interesting story on SilentVoice",
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
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

  // Media player functions
  const togglePlayPause = () => {
    const mediaElement =
      story?.mediaType === "video" ? videoRef.current : audioRef.current;

    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    const mediaElement =
      story?.mediaType === "video" ? videoRef.current : audioRef.current;

    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const mediaElement =
      story?.mediaType === "video" ? videoRef.current : audioRef.current;

    if (mediaElement) {
      setDuration(mediaElement.duration);
    }
  };

  const handleSeek = (e) => {
    const mediaElement =
      story?.mediaType === "video" ? videoRef.current : audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    if (mediaElement) {
      mediaElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    const mediaElement =
      story?.mediaType === "video" ? videoRef.current : audioRef.current;

    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const mediaElement =
      story?.mediaType === "video" ? videoRef.current : audioRef.current;

    if (mediaElement) {
      mediaElement.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (story?.mediaType === "video" && videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderMediaContent = () => {
    if (!story?.mediaUrl) return null;

    switch (story.mediaType) {
      case "video":
        return (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-96 object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster={story.videoThumbnail}
            >
              <source src={story.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-2 text-white">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1 mx-2">
                  <div
                    className="h-2 bg-white/30 rounded-full cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="bg-muted/50 rounded-lg p-6">
            <audio
              ref={audioRef}
              className="hidden"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={story.mediaUrl} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>

            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                variant="outline"
                onClick={togglePlayPause}
                className="rounded-full h-16 w-16"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Audio Story</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div
                  className="h-3 bg-muted rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
>>>>>>> refs/remotes/origin/main
                </div>
              </div>

              <div className="flex items-center space-x-2">
<<<<<<< HEAD
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
=======
                <Button size="sm" variant="ghost" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="rounded-lg overflow-hidden">
            <img
              src={story.mediaUrl}
              alt={story.title}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button onClick={() => navigate("/stories")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stories
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/stories")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Stories</span>
          </Button>

          {user && user._id === story.author?._id && (
            <Button
              variant="outline"
              onClick={() => navigate(`/stories/${storyId}/edit`)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Story</span>
            </Button>
          )}
        </div>

        {/* Story Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={story.author?.avatar} />
                  <AvatarFallback>
                    {story.author?.firstName?.[0]}
                    {story.author?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">
                      {story.author?.firstName} {story.author?.lastName}
                    </h4>
                    <Badge variant="secondary">@{story.author?.username}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(story.createdAt))} ago
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{story.readTime || 2} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{story.views || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Story
                  </DropdownMenuItem>
                  {user && user._id !== story.author?._id && (
                    <>
                      <DropdownMenuItem>
                        <Flag className="h-4 w-4 mr-2" />
                        Report Story
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user && user._id === story.author?._id && (
                    <>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Story
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardTitle className="text-2xl md:text-3xl mt-4">
              {story.title}
            </CardTitle>

            {story.excerpt && (
              <p className="text-lg text-muted-foreground">{story.excerpt}</p>
            )}

            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {story.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
>>>>>>> refs/remotes/origin/main
                  </Badge>
                ))}
              </div>
            )}
<<<<<<< HEAD

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
=======
          </CardHeader>

          <CardContent>
            {/* Media Content */}
            {renderMediaContent()}

            {/* Story Content */}
            <div className="prose prose-lg max-w-none mt-6">
              {story.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Story Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center space-x-2"
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span>{likesCount}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length}</span>
                </Button>

                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center space-x-2"
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  <span>Save</span>
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
>>>>>>> refs/remotes/origin/main
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
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
=======
        {/* Comments Section */}
        <Card id="comments">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Comments ({comments.length})</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts about this story..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="flex items-center space-x-2"
                  >
                    {submittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Post Comment</span>
                  </Button>
                </div>
              </form>
            ) : (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to join the conversation and share your thoughts.
                </AlertDescription>
              </Alert>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.author?.avatar} />
                      <AvatarFallback>
                        {comment.author?.firstName?.[0]}
                        {comment.author?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">
                            {comment.author?.firstName}{" "}
                            {comment.author?.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            @{comment.author?.username}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt))}{" "}
                            ago
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>

                      <div className="flex items-center space-x-4 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Like
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet.</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to share your thoughts about this story.
                </p>
              </div>
            )}
          </CardContent>
>>>>>>> refs/remotes/origin/main
        </Card>
      </div>
    </PageWrapper>
  );
};

export default StoryDetails;
