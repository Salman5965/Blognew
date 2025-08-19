import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { storiesService } from "@/services/storiesService";
import { ROUTES } from "@/utils/constant";
import {
  PlusCircle,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  Bookmark,
  Share2,
  Target,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("blogs");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [userStats, setUserStats] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    if (user?._id) {
      loadDashboardData();
    }
  }, [user, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user statistics (includes both blogs and stories)
      const stats = await userService.getUserStats(user._id);
      setUserStats(stats);

      // Load recent blogs
      const blogsResponse = await blogService.getMyBlogs({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setRecentBlogs(blogsResponse.blogs || blogsResponse.data || []);

      // Load recent stories
      try {
        const storiesResponse = await storiesService.getMyStories({
          limit: 5,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        setRecentStories(storiesResponse.stories || storiesResponse.data || []);
      } catch (error) {
        console.warn("Stories not available, using empty array");
        setRecentStories([]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color = "blue",
    loading = false,
    subtitle,
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            value?.toLocaleString() || 0
          )}
        </div>
        {subtitle && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  const BlogRow = ({ blog }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
          {blog.title}
        </h3>
        <div className="flex items-center space-x-4 mt-1">
          <Badge className={getStatusColor(blog.status)}>{blog.status}</Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4" />
          <span>{blog.views || blog.viewCount || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Heart className="h-4 w-4" />
          <span>
            {blog.likesCount || blog.likeCount || blog.likes?.length || 0}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>
            {blog.commentsCount ||
              blog.commentCount ||
              blog.comments?.length ||
              0}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`${ROUTES.EDIT_BLOG}/${blog._id}`)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const QuickActionButton = ({
    icon: Icon,
    label,
    onClick,
    color = "blue",
  }) => (
    <Button
      variant="ghost"
      className="w-full justify-start space-x-3 p-3 h-auto"
      onClick={onClick}
    >
      <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
      <span className="font-medium">{label}</span>
    </Button>
  );

  if (loading && !userStats) {
    return (
      <PageWrapper className="py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error && !userStats) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Try Again</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your content performance and growth
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog Analytics
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Story Analytics
            </TabsTrigger>
          </TabsList>

          {/* Blog Analytics Tab */}
          <TabsContent value="blogs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={FileText}
                title="Total Blogs"
                value={userStats?.blogs?.totalBlogs}
                subtitle={`${userStats?.blogs?.totalBlogs || 0} published blogs`}
                color="blue"
                loading={loading}
              />
              <StatCard
                icon={Eye}
                title="Total Views"
                value={userStats?.blogs?.totalViews}
                subtitle="All-time blog views"
                color="green"
                loading={loading}
              />
              <StatCard
                icon={Heart}
                title="Total Likes"
                value={userStats?.blogs?.totalLikes}
                subtitle="Likes on all blogs"
                color="red"
                loading={loading}
              />
              <StatCard
                icon={MessageCircle}
                title="Blog Comments"
                value={userStats?.comments?.totalComments}
                subtitle="Comments on your blogs"
                color="purple"
                loading={loading}
              />
            </div>

            {/* Blog Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Blog Posts</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.MY_BLOGS)}
                      >
                        View all
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : recentBlogs.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No blogs yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start creating your first blog post
                        </p>
                        <Button onClick={() => navigate(ROUTES.CREATE_BLOG)}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Blog
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentBlogs.map((blog) => (
                          <div
                            key={blog._id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                {blog.title}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge className={getStatusColor(blog.status)}>
                                  {blog.status}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(
                                    blog.publishedAt || blog.createdAt,
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>{blog.views || blog.viewCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span>
                                  {blog.likesCount ||
                                    blog.likeCount ||
                                    blog.likes?.length ||
                                    0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <span>
                                  {blog.commentsCount ||
                                    blog.commentCount ||
                                    blog.comments?.length ||
                                    0}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`${ROUTES.EDIT_BLOG}/${blog._id}`)
                                }
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Blog Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Avg Views per Blog
                        </span>
                        <span className="font-semibold">
                          {userStats?.blogs?.totalBlogs > 0
                            ? Math.round(
                                (userStats?.blogs?.totalViews || 0) /
                                  userStats.blogs.totalBlogs,
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Avg Likes per Blog
                        </span>
                        <span className="font-semibold">
                          {userStats?.blogs?.totalBlogs > 0
                            ? Math.round(
                                (userStats?.blogs?.totalLikes || 0) /
                                  userStats.blogs.totalBlogs,
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Engagement Rate
                        </span>
                        <span className="font-semibold">
                          {userStats?.blogs?.totalViews > 0
                            ? (
                                ((userStats?.blogs?.totalLikes || 0) /
                                  userStats.blogs.totalViews) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate(ROUTES.CREATE_BLOG)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      Create New Blog
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate(ROUTES.MY_BLOGS)}
                    >
                      <FileText className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Manage Blogs
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/dashboard/blog-analytics")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Detailed Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Story Analytics Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Stories"
                value={userStats?.stories?.totalStories}
                subtitle={`${userStats?.stories?.totalStories || 0} published stories`}
                color="blue"
                loading={loading}
              />
              <StatCard
                icon={Eye}
                title="Total Views"
                value={userStats?.stories?.totalViews}
                subtitle="All-time story views"
                color="green"
                loading={loading}
              />
              <StatCard
                icon={Heart}
                title="Total Likes"
                value={userStats?.stories?.totalLikes}
                subtitle="Likes on all stories"
                color="red"
                loading={loading}
              />
              <StatCard
                icon={MessageCircle}
                title="Story Comments"
                value={userStats?.comments?.totalStoryComments}
                subtitle="Comments on your stories"
                color="purple"
                loading={loading}
              />
            </div>

            {/* Story Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Stories</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/stories")}
                      >
                        View all
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : recentStories.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No stories yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start sharing your first story
                        </p>
                        <Button onClick={() => navigate("/stories/create")}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Story
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentStories.map((story) => (
                          <div
                            key={story._id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                {story.title}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge
                                  className={
                                    story.isPublished
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {story.isPublished ? "Published" : "Draft"}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(
                                    story.publishedAt || story.createdAt,
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>{story.views || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span>{story.likes?.length || 0}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/stories/${story._id}`)
                                }
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Story Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Story Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Avg Views per Story
                        </span>
                        <span className="font-semibold">
                          {userStats?.stories?.totalStories > 0
                            ? Math.round(
                                (userStats?.stories?.totalViews || 0) /
                                  userStats.stories.totalStories,
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Avg Likes per Story
                        </span>
                        <span className="font-semibold">
                          {userStats?.stories?.totalStories > 0
                            ? Math.round(
                                (userStats?.stories?.totalLikes || 0) /
                                  userStats.stories.totalStories,
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Engagement Rate
                        </span>
                        <span className="font-semibold">
                          {userStats?.stories?.totalViews > 0
                            ? (
                                ((userStats?.stories?.totalLikes || 0) /
                                  userStats.stories.totalViews) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/stories/create")}
                    >
                      <PlusCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      Create New Story
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/stories")}
                    >
                      <BookOpen className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Browse Stories
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate("/dashboard/story-analytics")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Detailed Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "published":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
    case "draft":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
  }
};

export default Dashboard;
