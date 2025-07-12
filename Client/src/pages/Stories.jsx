import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share,
  Play,
  Pause,
  TrendingUp,
  Filter,
  Users,
  BookOpen,
  Globe,
  Star,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import storiesService from "@/services/storiesService";
import exploreService from "@/services/exploreService";
import { getDisplayName, getInitials } from "@/utils/userUtils";

const Stories = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stories, setStories] = useState([]);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [communityImpact, setCommunityImpact] = useState({
    storiesShared: 0,
    livesTouched: 0,
    countries: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBy, setFilterBy] = useState("latest");

  useEffect(() => {
    loadStories();
    loadCommunityImpact();
  }, [filterBy, currentPage]);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const storiesData = await storiesService.getStories({
        page: currentPage,
        limit: 10,
        filter: filterBy,
      });
      setStories(storiesData.stories || []);

      if (currentPage === 1) {
        const featuredData = await storiesService.getFeaturedStories();
        setFeaturedStories(featuredData.stories || []);
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommunityImpact = async () => {
    try {
      const impact = await exploreService.getCommunityStats();
      setCommunityImpact(
        impact || {
          storiesShared: 0,
          livesTouched: 0,
          countries: 0,
        },
      );
    } catch (error) {
      console.error("Error loading community impact:", error);
    }
  };

  const handleLike = async (storyId) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like stories.",
        variant: "destructive",
      });
      return;
    }

    try {
      await storiesService.likeStory(storyId);

      // Update both stories and featured stories
      setStories((prev) =>
        prev.map((story) =>
          story._id === storyId || story.id === storyId
            ? {
                ...story,
                isLiked: !story.isLiked,
                likeCount: story.isLiked
                  ? (story.likeCount || 0) - 1
                  : (story.likeCount || 0) + 1,
              }
            : story,
        ),
      );

      setFeaturedStories((prev) =>
        prev.map((story) =>
          story._id === storyId || story.id === storyId
            ? {
                ...story,
                isLiked: !story.isLiked,
                likeCount: story.isLiked
                  ? (story.likeCount || 0) - 1
                  : (story.likeCount || 0) + 1,
              }
            : story,
        ),
      );

      toast({
        title: "Success",
        description: story.isLiked ? "Story unliked" : "Story liked",
      });
    } catch (error) {
      console.error("Error liking story:", error);
      toast({
        title: "Error",
        description: "Failed to like story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (story) => {
    const shareData = {
      title: story.title,
      text: story.content?.substring(0, 100) + "...",
      url: window.location.origin + `/stories/${story._id || story.id}`,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Story link copied to clipboard",
        });
        return;
      }

      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareData.url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        toast({
          title: "Link Copied",
          description: "Story link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Share",
          description: `Copy this link: ${shareData.url}`,
        });
      } finally {
        textArea.remove();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Share",
        description: `Copy this link: ${shareData.url}`,
      });
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await storiesService.searchStories(query, searchFilter);
      setSearchResults(results.stories || []);
    } catch (error) {
      console.error("Error searching stories:", error);
      toast({
        title: "Error",
        description: "Failed to search stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const StoryCard = ({ story, featured = false }) => {
    const storyId = story._id || story.id;
    const authorName = getDisplayName(story.author) || "Anonymous";
    const authorInitials = getInitials(authorName);

    return (
      <Card
        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${featured ? "border-primary/20" : ""}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {authorInitials}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {story.createdAt
                    ? new Date(story.createdAt).toLocaleDateString()
                    : "Recent"}
                </p>
              </div>
            </div>
            {featured && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {story.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {story.content || story.description || "No description available"}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(storyId);
                }}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  story.isLiked
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${story.isLiked ? "fill-current" : ""}`}
                />
                <span>{story.likeCount || 0}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(story);
                }}
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {story.tags &&
                story.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Stories That Matter</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Share your voice, inspire others, and connect through powerful
            narratives
          </p>

          {isAuthenticated && (
            <Button onClick={() => navigate("/stories/create")} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Share Your Story
            </Button>
          )}
        </div>

        {/* Community Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold">
                {communityImpact.storiesShared.toLocaleString()}
              </p>
              <p className="text-muted-foreground">Stories Shared</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold">
                {communityImpact.livesTouched.toLocaleString()}
              </p>
              <p className="text-muted-foreground">Lives Touched</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold">{communityImpact.countries}</p>
              <p className="text-muted-foreground">Countries Reached</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={searchFilter} onValueChange={setSearchFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stories</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="inspiration">Inspiration</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Stories */}
        {!searchQuery && featuredStories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStories.slice(0, 3).map((story) => (
                <StoryCard key={story._id || story.id} story={story} featured />
              ))}
            </div>
          </div>
        )}

        {/* Stories Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Stories"}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded mb-4" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-4 bg-muted rounded w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery ? searchResults : stories).map((story) => (
                <StoryCard key={story._id || story.id} story={story} />
              ))}
            </div>
          )}

          {!isLoading &&
            (searchQuery ? searchResults : stories).length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No stories found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms or filters."
                    : "Be the first to share your story!"}
                </p>
                {isAuthenticated && (
                  <Button onClick={() => navigate("/stories/create")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Share Your Story
                  </Button>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Stories;
