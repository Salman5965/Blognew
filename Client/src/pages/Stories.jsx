import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Filter,
  Users,
  BookOpen,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { storyService } from "@/services/storyService";
import { formatDistanceToNow } from "date-fns";

// Utility function to remove duplicate stories
const deduplicateStories = (stories) => {
  const seen = new Set();
  return stories.filter((story) => {
    if (seen.has(story._id)) {
      console.warn(`Duplicate story found with ID: ${story._id}`);
      return false;
    }
    seen.add(story._id);
    return true;
  });
};

const Stories = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  // Initial load
  useEffect(() => {
    loadStories(true);
  }, []);

  // Load when sortBy changes (but not on initial render)
  useEffect(() => {
    if (stories.length > 0) {
      // Only if we already have stories loaded
      loadStories(true);
    }
  }, [sortBy]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadStories(false);
    }
  }, [page]);

  const loadStories = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setStories([]); // Clear stories when resetting
      }

      const response = await storyService.getStories({
        page: reset ? 1 : page,
        limit: 10,
        sortBy,
        sortOrder: "desc",
        search: searchQuery,
      });

      if (response && response.stories) {
        if (reset) {
          setStories(deduplicateStories(response.stories));
        } else {
          // Filter out any duplicates based on _id to prevent key conflicts
          setStories((prev) => {
            const combined = [...prev, ...response.stories];
            return deduplicateStories(combined);
          });
        }
        setHasMore(response.pagination?.hasNext || false);
      }
    } catch (err) {
      setError("Failed to load stories");
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadStories(true);
  };

  const handleCreateStory = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/stories/create");
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const StoryCard = ({ story }) => (
    <Card className="mb-6 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={story.author?.avatar} />
              <AvatarFallback>
                {story.author?.firstName?.[0]}
                {story.author?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium hover:text-primary cursor-pointer">
                  {story.author?.firstName} {story.author?.lastName}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  @{story.author?.username}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground space-x-2">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(new Date(story.createdAt))} ago
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bookmark className="w-4 h-4 mr-2" />
                Save Story
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link to={`/stories/${story._id}`} className="block">
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {story.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {story.excerpt || story.content?.substring(0, 200)}...
          </p>
        </Link>

        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {story.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span>{story.likesCount || 0}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{story.commentsCount || 0}</span>
            </button>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{story.views || 0}</span>
            </div>
          </div>
          <span className="text-xs">{story.readTime || "2"} min read</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stories</h1>
              <p className="text-muted-foreground">
                Discover and share inspiring stories from our community
              </p>
            </div>
            <Button onClick={handleCreateStory} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Write Story
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="likesCount">Most Liked</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Stories List */}
        <div className="space-y-6">
          {loading && stories.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => loadStories(true)} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No stories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Be the first to share a story!"}
              </p>
              <Button onClick={handleCreateStory}>
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Story
              </Button>
            </div>
          ) : (
            <>
              {stories.map((story, index) => (
                <StoryCard key={story._id || `story-${index}`} story={story} />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-8">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Stories;
