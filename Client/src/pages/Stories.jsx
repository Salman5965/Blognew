import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  User,
  MapPin,
  Calendar,
  Filter,
  TrendingUp,
  Plus,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import storiesService from "@/services/storiesService";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [featuredStories, setFeaturedStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(null);
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadStories();
  }, [searchQuery]);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const [storiesData, featuredData] = await Promise.all([
        storiesService.getStories({ search: searchQuery }),
        storiesService.getFeaturedStories(),
      ]);

      setStories(storiesData.stories || []);
      setFeaturedStories(featuredData.stories || []);
    } catch (error) {
      console.error("Failed to load stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (storyId) => {
    try {
      await storiesService.likeStory(storyId);
      // Update both stories and featured stories
      const updateStoryLikes = (story) =>
        (story.id || story._id) === storyId
          ? {
              ...story,
              likes: Array.isArray(story.likes)
                ? story.isLiked
                  ? story.likes.length - 1
                  : story.likes.length + 1
                : story.isLiked
                  ? (story.likes || 0) - 1
                  : (story.likes || 0) + 1,
              likeCount: Array.isArray(story.likes)
                ? story.isLiked
                  ? story.likes.length - 1
                  : story.likes.length + 1
                : story.isLiked
                  ? (story.likeCount || 0) - 1
                  : (story.likeCount || 0) + 1,
              isLiked: !story.isLiked,
            }
          : story;

      setStories((prev) => prev.map(updateStoryLikes));
      setFeaturedStories((prev) => prev.map(updateStoryLikes));
    } catch (error) {
      console.error("Failed to like story:", error);
    }
  };

  const handleShare = async (story) => {
    const shareUrl =
      window.location.origin + `/stories/${story.id || story._id}`;

    try {
      // Check if Web Share API is available and can be used
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          title: story.title,
          text: story.excerpt || story.title,
          url: shareUrl,
        })
      ) {
        await navigator.share({
          title: story.title,
          text: story.excerpt || story.title,
          url: shareUrl,
        });
        toast({
          title: "Story shared!",
          description: "Thanks for sharing this story.",
        });
        return;
      }
    } catch (shareError) {
      console.warn(
        "Web Share API failed, falling back to clipboard:",
        shareError,
      );
    }

    // Fallback: copy to clipboard
    let copySuccess = false;

    // Try modern Clipboard API first
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copySuccess = true;
        toast({
          title: "Link copied!",
          description: "Story link has been copied to your clipboard.",
        });
      }
    } catch (clipboardError) {
      console.warn("Modern clipboard API failed:", clipboardError.message);
      // Continue to fallback methods
    }

    // If modern API failed, try legacy method
    if (!copySuccess) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          copySuccess = true;
          toast({
            title: "Link copied!",
            description: "Story link has been copied to your clipboard.",
          });
        }
      } catch (legacyError) {
        console.warn("Legacy copy method failed:", legacyError.message);
      }
    }

    // If all copy methods failed, show manual copy option
    if (!copySuccess) {
      // Create a temporary modal-like element for manual copying
      const copyModal = document.createElement("div");
      copyModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #007bff;
        border-radius: 8px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        word-break: break-all;
      `;

      copyModal.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">Copy this link to share:</div>
        <input type="text" value="${shareUrl}" readonly style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;" onclick="this.select()">
        <button onclick="this.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
      `;

      document.body.appendChild(copyModal);

      // Auto-remove after 15 seconds
      setTimeout(() => {
        if (document.body.contains(copyModal)) {
          document.body.removeChild(copyModal);
        }
      }, 15000);

      // Also show a toast
      toast({
        title: "Copy link manually",
        description:
          "Clipboard access is restricted. Use the popup to copy the link.",
        duration: 5000,
      });
    }
  };

  const toggleAudio = (storyId) => {
    if (playingAudio === storyId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(storyId);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Discover Life Stories</h2>
            <p className="text-muted-foreground">
              Read inspiring stories from people around the world
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">Sign In to Read Stories</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "Pacifico, cursive" }}
            >
              Life Stories
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Every voice matters. Every story deserves to be heard.
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/stories/create")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Share Your Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Stories Feed */}
          <div className="lg:col-span-3">
            {/* Featured Stories */}
            {featuredStories.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Featured Stories</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredStories.slice(0, 2).map((story) => (
                    <Card
                      key={story.id || story._id}
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      <div className="relative">
                        {story.coverImage && (
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        {story.audioUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2"
                            onClick={() => toggleAudio(story.id)}
                          >
                            {playingAudio === story.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3
                          className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => navigate(`/stories/${story.id}`)}
                        >
                          {story.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {story.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={story.author.avatar} />
                              <AvatarFallback>
                                {story.author?.name?.charAt(0) ||
                                  story.author?.username?.charAt(0) ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {story.author?.name ||
                                story.author?.username ||
                                "Unknown Author"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {story.likeCount ||
                                (Array.isArray(story.likes)
                                  ? story.likes.length
                                  : story.likes) ||
                                0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {story.readTime}m
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Stories */}
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : stories.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      No stories found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Be the first to share a story in this category"}
                    </p>
                    <Button onClick={() => navigate("/stories/create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Share Your Story
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                stories.map((story) => (
                  <Card
                    key={story.id || story._id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {story.coverImage && (
                          <div className="relative">
                            <img
                              src={story.coverImage}
                              alt={story.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            {story.audioUrl && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-1 right-1 h-6 w-6 p-0"
                                onClick={() => toggleAudio(story.id)}
                              >
                                {playingAudio === story.id ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {story.location && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {story.location}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(story.createdAt)}
                            </span>
                          </div>

                          <h3
                            className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer"
                            onClick={() => navigate(`/stories/${story.id}`)}
                          >
                            {story.title}
                          </h3>

                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {story.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={story.author.avatar} />
                                <AvatarFallback>
                                  {story.author?.name?.charAt(0) ||
                                    story.author?.username?.charAt(0) ||
                                    "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {story.author?.name ||
                                  story.author?.username ||
                                  "Unknown Author"}
                              </span>
                              {story.author.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleLike(story.id || story._id)
                                }
                                className={`h-8 px-2 ${story.isLiked ? "text-red-500" : ""}`}
                              >
                                <Heart
                                  className={`h-4 w-4 mr-1 ${story.isLiked ? "fill-current" : ""}`}
                                />
                                {story.likeCount ||
                                  (Array.isArray(story.likes)
                                    ? story.likes.length
                                    : story.likes) ||
                                  0}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {story.comments}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(story)}
                                className="h-8 px-2"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Community Impact</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2,847</div>
                  <div className="text-sm text-muted-foreground">
                    Stories Shared
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">892</div>
                  <div className="text-sm text-muted-foreground">
                    Lives Touched
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Popular Topics</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "Personal Growth", count: 342 },
                    { name: "Life Lessons", count: 289 },
                    { name: "Inspirational", count: 234 },
                    { name: "Real Experiences", count: 198 },
                    { name: "Life Stories", count: 167 },
                  ].map((topic, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{topic.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {topic.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Share Your Story</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your story could inspire someone today
                </p>
                <Button
                  onClick={() => navigate("/stories/create")}
                  className="w-full"
                >
                  Start Writing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;
