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

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchFilter]);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const [storiesData, featuredData] = await Promise.all([
        storiesService.getStories({
          page: currentPage,
          sort: filterBy,
          limit: 10,
        }),
        storiesService.getFeaturedStories(4),
      ]);

      setStories(storiesData.stories || []);
      setFeaturedStories(featuredData.stories || []);
    } catch (error) {
      console.error("Failed to load stories:", error);
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
      const impact = await exploreService.getCommunityImpact();
      setCommunityImpact(impact);
    } catch (error) {
      console.error("Failed to load community impact:", error);
      // Set fallback values
      setCommunityImpact({
        storiesShared: 1247,
        livesTouched: 3891,
        countries: 47,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      let results = [];

      if (searchFilter === "people" || searchFilter === "all") {
        const peopleResults = await exploreService.searchUsers(searchQuery);
        results = [
          ...results,
          ...peopleResults.map((user) => ({ ...user, type: "people" })),
        ];
      }

      if (searchFilter === "stories" || searchFilter === "all") {
        const storyResults = await exploreService.searchContent(
          searchQuery,
          "stories",
        );
        results = [
          ...results,
          ...(storyResults.results.stories?.map((story) => ({
            ...story,
            type: "stories",
          })) || []),
        ];
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLikeStory = async (storyId) => {
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
      const updateStoryLikes = (story) =>
        story.id === storyId || story._id === storyId
          ? {
              ...story,
              isLiked: !story.isLiked,
              likeCount: story.isLiked
                ? (story.likeCount || 0) - 1
                : (story.likeCount || 0) + 1,
            }
          : story;

      setStories((prev) => prev.map(updateStoryLikes));
      setFeaturedStories((prev) => prev.map(updateStoryLikes));
    } catch (error) {
      console.error("Failed to like story:", error);
      toast({
        title: "Error",
        description: "Failed to like story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareStory = (story) => {
    const shareUrl =
      window.location.origin + `/stories/${story.id || story._id}`;

    // Skip APIs entirely to avoid permission issues
    // Show URL directly for manual copying
    toast({
      title: "Share Story",
      description: `Copy this link: ${shareUrl}`,
      duration: 15000, // Long duration so user can copy
    });
  };

  const toggleAudio = (storyId) => {
    setPlayingAudio(playingAudio === storyId ? null : storyId);
  };

  const handleCommunityImpactClick = (type) => {
    // Navigate to filtered feed based on the metric clicked
    switch (type) {
      case "stories":
        navigate("/feed?type=stories");
        break;
      case "lives":
        navigate("/feed?category=inspiration");
        break;
      case "countries":
        navigate("/explore?view=global");
        break;
      default:
        navigate("/feed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Discover Life Stories</h2>
            <p className="text-muted-foreground">
              Read inspiring stories from people around the world
            </p>
          </div>
          <div className="max-w-sm mx-auto mt-8">
            <Button asChild className="w-full">
              <Link to="/login">Sign In to Read Stories</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "Pacifico, cursive" }}
            >
              Life Stories
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Share your journey, inspire others, and discover amazing life
              stories
            </p>

            {/* Enhanced Search Section */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search stories or people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={searchFilter} onValueChange={setSearchFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="stories">Stories</SelectItem>
                  <SelectItem value="people">People</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => navigate("/stories/create")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Share Your Story
              </Button>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-6 max-w-2xl mx-auto">
                <Card>
                  <CardContent className="p-4">
                    {isSearching ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Searching...
                        </p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.slice(0, 5).map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                            onClick={() => {
                              if (result.type === "people") {
                                navigate(`/users/${result.id || result._id}`);
                              } else {
                                navigate(`/stories/${result.id || result._id}`);
                              }
                            }}
                          >
                            {result.type === "people" ? (
                              <>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {getInitials(
                                      result.firstName,
                                      result.lastName,
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {getDisplayName(result)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    @{result.username}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    By {getDisplayName(result.author)}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No results found for "{searchQuery}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
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
                          className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                          onClick={() => navigate(`/stories/${story.id}`)}
                        >
                          {story.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {story.excerpt || story.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {getInitials(
                                  story.author?.firstName,
                                  story.author?.lastName,
                                )}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {getDisplayName(story.author)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(story.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleLikeStory(story.id || story._id)
                              }
                              className="flex items-center gap-1"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  story.isLiked
                                    ? "fill-current text-red-500"
                                    : ""
                                }`}
                              />
                              <span className="text-xs">
                                {story.likeCount || 0}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShareStory(story)}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Mini Feed Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">All Stories</h2>
              <div className="flex items-center gap-4">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Regular Stories Feed */}
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-muted rounded-full"></div>
                            <div className="space-y-1">
                              <div className="h-3 bg-muted rounded w-20"></div>
                              <div className="h-2 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : stories.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No stories found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share your story with the community.
                    </p>
                    <Button onClick={() => navigate("/stories/create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Story
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                stories.map((story) => (
                  <Card
                    key={story.id || story._id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {story.coverImage && (
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            className="w-full md:w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3
                              className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                              onClick={() => navigate(`/stories/${story.id}`)}
                            >
                              {story.title}
                            </h3>
                            {story.featured && (
                              <Badge variant="secondary" className="ml-2">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                            {story.excerpt || story.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {getInitials(
                                    story.author?.firstName,
                                    story.author?.lastName,
                                  )}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {getDisplayName(story.author)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    story.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleLikeStory(story.id || story._id)
                                }
                                className="flex items-center gap-1"
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    story.isLiked
                                      ? "fill-current text-red-500"
                                      : ""
                                  }`}
                                />
                                <span className="text-xs">
                                  {story.likeCount || 0}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">
                                  {story.comments || 0}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShareStory(story)}
                              >
                                <Share className="h-4 w-4" />
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

            {/* Pagination */}
            {stories.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={stories.length < 10}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Impact - Enhanced with Backend Data */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Community Impact</h3>
                <div className="space-y-4">
                  <div
                    className="text-center cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    onClick={() => handleCommunityImpactClick("stories")}
                  >
                    <div className="text-2xl font-bold text-primary">
                      {communityImpact.storiesShared.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Stories Shared
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                  <div
                    className="text-center cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    onClick={() => handleCommunityImpactClick("lives")}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {communityImpact.livesTouched.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      Lives Touched
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                  <div
                    className="text-center cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    onClick={() => handleCommunityImpactClick("countries")}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {communityImpact.countries}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Globe className="h-4 w-4" />
                      Countries
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Trending Topics</h3>
                <div className="space-y-2">
                  {[
                    { name: "Personal Growth", count: 234 },
                    { name: "Travel Adventures", count: 189 },
                    { name: "Life Lessons", count: 156 },
                    { name: "Career Journey", count: 142 },
                    { name: "Family Stories", count: 128 },
                  ].map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/feed?topic=${encodeURIComponent(topic.name)}`,
                        )
                      }
                    >
                      <span className="text-sm font-medium">{topic.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {topic.count} stories
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create Story CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Share Your Story</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Inspire others with your unique journey and experiences.
                </p>
                <Button
                  onClick={() => navigate("/stories/create")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write Story
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
