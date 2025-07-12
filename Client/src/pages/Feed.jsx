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
import { blogService } from "@/services/blogService";
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
  Plus,
  Users,
  Flame,
  Calendar,
  BookOpen,
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

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const filters = [
    { value: "latest", label: "Latest Posts", icon: Clock },
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "popular", label: "Most Popular", icon: Flame },
    { value: "following", label: "Following", icon: Users },
  ];

  // Load posts
  const loadPosts = async (
    page = 1,
    filter = selectedFilter,
    search = searchQuery,
    append = false,
  ) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const query = {
        page,
        limit: 10,
        sortBy: getSortBy(filter),
        sortOrder: "desc",
      };

      // Add filter-specific parameters
      if (filter === "following" && user) {
        query.following = true;
        query.userId = user.id;
      }

      if (filter === "trending") {
        query.trending = true;
        query.timeframe = "week"; // trending in the last week
      }

      if (filter === "popular") {
        query.popular = true;
        query.minLikes = 1; // minimum likes for popular posts
      }

      if (search && search.trim()) {
        query.search = search.trim();
      }

      const response = await blogService.getBlogs(query);
      const newPosts = response.blogs || response.data || [];

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      const pagination = response.pagination || {};
      setHasMore(pagination.hasNextPage || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const getSortBy = (filter) => {
    switch (filter) {
      case "trending":
        return "viewsCount"; // Sort by view count for trending
      case "popular":
        return "likesCount"; // Sort by likes count for popular
      case "following":
        return "createdAt"; // Sort by creation date for following
      case "latest":
      default:
        return "createdAt"; // Sort by creation date for latest
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadPosts(1, selectedFilter, searchQuery, false);
  };

  const handleFilterChange = async (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    setHasMore(true);
    setPosts([]); // Clear existing posts
    await loadPosts(1, filter, searchQuery, false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      loadPosts(1, selectedFilter, searchQuery, false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadPosts(currentPage + 1, selectedFilter, searchQuery, true);
    }
  };

  const handleLike = async (postId) => {
    try {
      await blogService.likeBlog(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likeCount: (post.likeCount || 0) + (post.isLiked ? -1 : 1),
                isLiked: !post.isLiked,
              }
            : post,
        ),
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return "?";
    }

    return (
      name
        .trim()
        .split(" ")
        .filter((n) => n.length > 0) // Filter out empty strings
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const PostCard = ({ post }) => (
    <Card className="mb-6 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback>
                {getInitials(post.author?.fullName || post.author?.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {post.author?.fullName || post.author?.username || "Anonymous"}
              </p>
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span>•</span>
                <span>{post.readTime || 5} min read</span>
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
              <DropdownMenuItem onClick={() => navigate(`/blog/${post.slug}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Post
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save for Later
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Post Content */}
      <CardContent className="pt-0">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => navigate(`/blog/${post.slug}`)}
            />
          </div>
        )}

        {/* Title and Excerpt */}
        <div className="mb-4">
          <h2
            className="text-xl font-bold mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/blog/${post.slug}`)}
          >
            {post.title}
          </h2>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.excerpt || post.description}
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center space-x-2 text-sm hover:text-red-500 transition-colors ${
                post.isLiked ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <Heart
                className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`}
              />
              <span>{post.likeCount || 0}</span>
            </button>

            <button
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentsCount || 0}</span>
            </button>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Eye className="h-5 w-5" />
              <span>{(post.views || 0).toLocaleString()}</span>
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
            You need to be logged in to view the blog feed.
          </p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Blog Feed</h1>
            <p className="text-muted-foreground mt-1">
              Discover amazing content from our community
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
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
            <Button onClick={() => navigate("/create")} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              className="pl-10"
            />
          </div>
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter posts" />
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

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms or filters."
                  : "Be the first to create a post!"}
              </p>
              <Button onClick={() => navigate("/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading more...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center mt-8 text-muted-foreground">
                <p>You've reached the end of the feed!</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default Feed;
