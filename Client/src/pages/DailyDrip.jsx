import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Crown,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Bookmark,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import blogService from "@/services/blogService";
import { LikeButton } from "@/components/shared/LikeButton";
import BookmarkButton from "@/components/shared/BookmarkButton";

const DailyDrip = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === "admin" || user?.isAdmin;

  // Remove mock data to prevent issues with invalid ObjectIds

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Try to fetch from backend, fallback to mock data
      const response = await blogService.getBlogs({
        page: 1,
        limit: 20,
        category: "daily-drip",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success && response.data?.blogs?.length > 0) {
        setPosts(response.data.blogs);
      } else {
        setPosts([]); // Use empty array instead of mock data
      }
    } catch (error) {
      console.error("Error loading daily drip posts:", error);
      setPosts([]); // Use empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSubmitting(true);
    try {
      const postData = {
        ...newPost,
        category: "daily-drip",
        tags: ["daily-drip", "admin", "inspiration"],
        isDailyDrip: true,
      };

      const result = await blogService.createBlog(postData);
      if (result.success) {
        setNewPost({ title: "", content: "", excerpt: "" });
        setShowCreateForm(false);
        loadPosts();
      }
    } catch (error) {
      console.error("Error creating daily drip post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "popular") return matchesSearch && post.likes > 50;
    if (selectedFilter === "recent")
      return (
        matchesSearch &&
        new Date(post.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

    return matchesSearch;
  });

  const filterOptions = [
    { value: "all", label: "All Posts", icon: Filter },
    { value: "recent", label: "Recent", icon: Clock },
    { value: "popular", label: "Popular", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Daily Drip
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Daily inspiration, tips, and challenges curated by our experts to
            fuel your writing journey
          </p>
        </div>

        {/* Admin Create Post */}
        {isAdmin && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold">Admin Panel</h2>
                </div>
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Daily Drip
                </Button>
              </div>
            </CardHeader>

            {showCreateForm && (
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Brief excerpt..."
                    value={newPost.excerpt}
                    onChange={(e) =>
                      setNewPost({ ...newPost, excerpt: e.target.value })
                    }
                    required
                  />
                  <Textarea
                    placeholder="Write your daily drip content..."
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    rows={6}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Publishing..." : "Publish Daily Drip"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search daily drips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={
                    selectedFilter === filter.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                        <Crown className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {post.author?.firstName} {post.author?.lastName}
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <h2 className="text-xl font-bold mb-3 cursor-pointer hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <LikeButton
                      blogId={post._id}
                      likeCount={post.likes}
                      isLiked={post.isLiked}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.slug || post._id}`)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments} comments
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookmarkButton
                      blogId={post._id}
                      initialIsBookmarked={post.isBookmarked}
                      disabled={!isAuthenticated}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Crown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Daily Drips Found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Check back soon for new daily inspiration!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default DailyDrip;
