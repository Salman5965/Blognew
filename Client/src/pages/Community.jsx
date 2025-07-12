<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Heart,
  Star,
  ArrowRight,
  Activity,
  UserPlus,
  MessageCircle,
  Eye,
  Crown,
  Medal,
  Trophy,
  Clock,
  Hash,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import communityService from "@/services/communityService";

const Community = () => {
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    totalPosts: 0,
    totalDiscussions: 0,
    dailyActiveUsers: 0,
  });
  const [topMembers, setTopMembers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [featuredDiscussions, setFeaturedDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        const [stats, members, activity, topics, discussions] =
          await Promise.all([
            communityService.getStats(),
            communityService.getTopMembers(),
            communityService.getRecentActivity(),
            communityService.getPopularTopics(),
            communityService.getFeaturedDiscussions(),
          ]);

        setCommunityStats(stats);
        setTopMembers(members);
        setRecentActivity(activity);
        setPopularTopics(topics);
        setFeaturedDiscussions(discussions);
      } catch (error) {
        console.error("Failed to load community data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunityData();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-orange-500" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "post":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
=======
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
>>>>>>> origin/main
    }
  };

  if (!isAuthenticated) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Join Our Community</h2>
            <p className="text-muted-foreground">
              Connect with writers, readers, and creators from around the world
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">Sign In to Join</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
=======
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
>>>>>>> origin/main
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Community Hub</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Connect, share, and grow with our vibrant community of writers and
              readers
            </p>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(communityStats?.totalMembers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(communityStats?.onlineMembers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(communityStats?.totalPosts || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(communityStats?.totalDiscussions || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Discussions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader
              className="text-center pb-4"
              onClick={() => navigate("/community/forum")}
            >
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Join Discussions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Participate in real-time conversations
              </p>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader
              className="text-center pb-4"
              onClick={() => navigate("/explore")}
            >
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Explore Trending</CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover popular content and authors
              </p>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader
              className="text-center pb-4"
              onClick={() => navigate("/create")}
            >
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Create Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share your stories with the community
              </p>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Discussions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Featured Discussions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : Array.isArray(featuredDiscussions) ? (
                  featuredDiscussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={discussion.author.avatar} />
                        <AvatarFallback>
                          {discussion.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {discussion.title}
                          </h4>
                          {discussion.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {discussion.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by {discussion.author.name}</span>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {discussion.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {discussion.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {discussion.lastActivity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No discussions available</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/community/forum")}
                >
                  View All Discussions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-16 bg-muted rounded-full animate-pulse"
                      ></div>
                    ))
                  ) : Array.isArray(popularTopics) ? (
                    popularTopics.map((topic) => (
                      <Badge
                        key={topic.id}
                        variant="secondary"
                        className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                      >
                        #{topic.name}
                        <span className="ml-1 text-xs opacity-70">
                          {topic.count}
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No topics available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Community Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 animate-pulse"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="h-2 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                ) : Array.isArray(topMembers) ? (
                  topMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex items-center space-x-1">
                        {getRankIcon(index + 1)}
                        <span className="text-xs font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.points} points
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground text-sm">
                    No contributors available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2 animate-pulse"
                    >
                      <div className="w-4 h-4 bg-muted rounded mt-0.5"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                ) : Array.isArray(recentActivity) ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-2"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 text-xs">
                        <p className="text-foreground">
                          <span className="font-medium">
                            {activity.user.name}
                          </span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground text-sm">
                    No recent activity
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Forum CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Join the Forum</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with community members in real-time discussions
                </p>
                <Button
                  onClick={() => navigate("/community/forum")}
                  className="w-full"
                >
                  Enter Forum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
=======
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
>>>>>>> origin/main
  );
};

export default Community;
