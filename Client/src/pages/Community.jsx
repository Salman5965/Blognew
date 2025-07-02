import React, { useState, useEffect, useCallback } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import CommunityPost from "@/components/community/CommunityPost";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import { communityService } from "@/services/communityService";
import {
  MessageSquare,
  Search,
  Filter,
  TrendingUp,
  Plus,
  Users,
  Hash,
  Clock,
  Star,
  Loader2,
  RefreshCw,
  Settings,
  Pin,
  Eye,
  Heart,
  MessageCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { iconColors } from "@/utils/iconColors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Community = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Real-time connection state
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connected");

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [selectedCategory, sortBy]);

  // Search effect
  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else if (searchQuery.length === 0) {
      // Reset to initial data when search is cleared
      loadInitialData();
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [postsResponse, categoriesResponse] = await Promise.all([
        communityService.getPosts({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          sortBy,
          page: 1,
          limit: 20,
        }),
        communityService.getCategories(),
      ]);

      setPosts(postsResponse.posts || []);
      setCategories(categoriesResponse.categories || []);
      setPage(1);
      setHasMore(postsResponse.hasMore || false);
    } catch (error) {
      console.error("Error loading community data:", error);

      // Only show error toast for non-404 errors (avoid showing errors for missing endpoints)
      if (
        !error.message?.includes("Not Found") &&
        error.response?.status !== 404
      ) {
        toast({
          title: "Error",
          description: "Failed to load community data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const response = await communityService.getPosts({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        sortBy,
        page: nextPage,
        limit: 20,
        search: searchQuery,
      });

      setPosts((prev) => [...prev, ...(response.posts || [])]);
      setPage(nextPage);
      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast({
        title: "Error",
        description: "Failed to load more posts",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    try {
      setLoading(true);

      const response = await communityService.searchPosts({
        query: searchQuery.trim(),
        category: selectedCategory === "all" ? undefined : selectedCategory,
        sortBy,
        page: 1,
        limit: 20,
      });

      setPosts(response.posts || []);
      setPage(1);
      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error("Error searching posts:", error);

      // Only show error toast for actual errors, not missing endpoints
      if (
        !error.message?.includes("Not Found") &&
        error.response?.status !== 404
      ) {
        toast({
          title: "Search Error",
          description: "Failed to search posts",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreate = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setIsCreatePostOpen(false);
    toast({
      title: "Success",
      description: "Post created successfully!",
    });
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    toast({
      title: "Success",
      description: "Post deleted successfully",
    });
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);

    try {
      setLoading(true);
      const response = await communityService.getPosts({
        category: category === "all" ? undefined : category,
        sortBy,
        page: 1,
        limit: 20,
        search: searchQuery,
      });

      setPosts(response.posts || []);
      setPage(1);
      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error("Error filtering by category:", error);
      toast({
        title: "Error",
        description: "Failed to filter posts by category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Join the Community</h1>
          <p className="text-muted-foreground mb-6">
            Connect with fellow developers, share knowledge, and participate in
            discussions.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register">Create Account</a>
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Community Header */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center">
              <MessageSquare className={`h-8 w-8 mr-3 ${iconColors.primary}`} />
              Community Discussions
            </h1>
            <p className="text-muted-foreground">
              Share ideas, ask questions, and connect with developers worldwide
            </p>
          </div>
        </div>

        {/* Controls and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-3 w-3" />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Recent</span>
                  </div>
                </SelectItem>
                <SelectItem value="trending">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>Trending</span>
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>Popular</span>
                  </div>
                </SelectItem>
                <SelectItem value="unanswered">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-3 w-3" />
                    <span>Unanswered</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={loadInitialData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button onClick={() => setIsCreatePostOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Be the first to start a discussion in the community!"}
              </p>
              <Button onClick={() => setIsCreatePostOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </Card>
          ) : (
            <>
              {posts.map((post) => (
                <CommunityPost
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="min-w-32"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More Posts"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Post Dialog */}
        <CreatePostDialog
          open={isCreatePostOpen}
          onOpenChange={setIsCreatePostOpen}
          categories={categories}
          onPostCreate={handlePostCreate}
        />
      </div>
    </PageWrapper>
  );
};

export default Community;
