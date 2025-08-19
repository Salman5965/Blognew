import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import storiesService from "@/services/storiesService";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Users,
  Flame,
  Calendar,
  BookOpen,
  Play,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Stories = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  // Filter options
  const filters = [
    { value: "latest", label: "Latest", icon: Clock },
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "popular", label: "Popular", icon: Flame },
    { value: "following", label: "Following", icon: Users },
  ];

  // Load stories
  const loadStories = async (page = 1, filter = "latest", search = "", append = true) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const sortBy = getSortField(filter);
      const response = await storiesService.getStories({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder: "desc",
      });

      if (response && response.stories) {
        if (append && page > 1) {
          setStories((prev) => [...prev, ...response.stories]);
        } else {
          setStories(response.stories);
        }

        setHasMore(response.pagination?.hasNextPage || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const getSortField = (filter) => {
    switch (filter) {
      case "trending":
        return "viewsCount";
      case "popular":
        return "likesCount";
      case "following":
        return "createdAt";
      case "latest":
      default:
        return "createdAt";
    }
  };

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setStories([]);
    await loadStories(1, selectedFilter, searchQuery, false);
  };

  const handleFilterChange = async (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    setHasMore(true);
    setStories([]);
    await loadStories(1, filter, searchQuery, false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      setHasMore(true);
      setStories([]);
      loadStories(1, selectedFilter, searchQuery, false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      loadStories(nextPage, selectedFilter, searchQuery, true);
    }
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && touchStartY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY;
      
      if (distance > 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance * 0.5, 100));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 50) {
      await handleRefresh();
    }
    
    setIsPulling(false);
    setPullDistance(0);
    setTouchStartY(0);
  };

  // Add touch event listeners
  useEffect(() => {
    const element = document.getElementById('stories-container');
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isPulling, pullDistance, touchStartY]);

  // Story like handler
  const handleLikeStory = async (storyId) => {
    try {
      // TODO: Implement story like functionality
      toast({
        title: "Coming Soon",
        description: "Story likes will be available soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like story. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return "?";
    }

    return (
      name
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    );
  };

  // Story card component
  const StoryCard = ({ story }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={story.author?.avatar} />
              <AvatarFallback>
                {getUserInitials(story.author?.username || story.author?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                to={`/users/${story.author?.id || story.author?._id}`}
                className="font-medium hover:underline"
              >
                {story.author?.name || story.author?.username || "Anonymous"}
              </Link>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{getTimeAgo(story.createdAt)}</span>
                {story.readTime && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{story.readTime} min read</span>
                  </>
                )}
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
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Save</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => navigate(`/stories/${story.id || story._id}`)}
        >
          <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {story.title}
          </h2>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {story.excerpt || story.content?.substring(0, 200) + "..."}
          </p>

          {story.coverImage && (
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLikeStory(story.id || story._id)}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span>{story.likesCount || 0}</span>
            </button>

            <button
              onClick={() => navigate(`/stories/${story.id || story._id}#comments`)}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{story.commentsCount || 0}</span>
            </button>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Eye className="h-5 w-5" />
              <span>{(story.views || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view stories.
          </p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <div id="stories-container" className="relative">
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 bg-primary/10 backdrop-blur-sm z-40 flex items-center justify-center transition-all duration-200"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="flex items-center space-x-2 text-primary">
            {pullDistance > 50 ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Release to refresh</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <span className="text-sm font-medium">Pull to refresh</span>
              </>
            )}
          </div>
        </div>
      )}

      <PageWrapper className="py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Stories Feed</h1>
              <p className="text-muted-foreground mt-1">
                Discover amazing life stories from our community
              </p>
            </div>
            {/* Desktop Refresh Button */}
            <div className="hidden sm:block mt-4 sm:mt-0">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter stories" />
              </SelectTrigger>
              <SelectContent>
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <SelectItem key={filter.value} value={filter.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {filter.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Stories Feed */}
          <div className="space-y-6">
            {loading && stories.length === 0 ? (
              // Loading skeleton
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                        <div className="h-32 bg-muted rounded mb-4"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-4 bg-muted rounded w-12"></div>
                            <div className="h-4 bg-muted rounded w-12"></div>
                            <div className="h-4 bg-muted rounded w-12"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-muted rounded"></div>
                            <div className="h-8 w-8 bg-muted rounded"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : stories.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Stories Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No stories match your search criteria."
                      : "No stories available yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {stories.map((story) => (
                  <StoryCard key={story.id || story._id} story={story} />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      disabled={loadingMore}
                      className="min-w-32"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}

                {!hasMore && stories.length > 0 && (
                  <div className="text-center mt-8 text-muted-foreground">
                    <p>You've reached the end of the stories!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
};

export default Stories;
