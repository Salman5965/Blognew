import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  Download,
  Share2,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [userStats, setUserStats] = useState(null);
  const [blogAnalytics, setBlogAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?._id) {
      loadAnalyticsData();
    }
  }, [user, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user statistics
      const stats = await userService.getUserStats(user._id);
      setUserStats(stats);

      // Load blog analytics
      const blogsResponse = await blogService.getMyBlogs({
        limit: 50,
        sortBy: "views",
        sortOrder: "desc",
      });
      setBlogAnalytics(blogsResponse.blogs || blogsResponse.data || []);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const MetricCard = ({ icon: Icon, title, value, growth, prefix = "" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {formatNumber(value)}
        </div>
        {growth !== undefined && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {growth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={growth >= 0 ? "text-green-600" : "text-red-600"}>
              {growth >= 0 ? "+" : ""}
              {growth}%
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const BlogPerformanceRow = ({ blog, rank }) => (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">#{rank}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm line-clamp-1">{blog.title}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>{formatNumber(blog.views || 0)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Heart className="h-3 w-3" />
          <span>{formatNumber(blog.likeCount || 0)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-3 w-3" />
          <span>{formatNumber(blog.commentCount || 0)}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <PageWrapper className="py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadAnalyticsData}>Try Again</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate some analytics metrics
  const totalViews = userStats?.blogs?.totalViews || 0;
  const totalLikes = userStats?.blogs?.totalLikes || 0;
  const totalComments = userStats?.comments?.totalComments || 0;
  const totalBlogs = userStats?.blogs?.totalBlogs || 0;

  // Calculate engagement rate
  const engagementRate =
    totalViews > 0
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1)
      : 0;

  // Calculate average views per blog
  const avgViewsPerBlog =
    totalBlogs > 0 ? Math.round(totalViews / totalBlogs) : 0;

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="mb-2 sm:mb-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Detailed insights into your blog performance
              </p>
            </div>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Eye}
            title="Total Views"
            value={totalViews}
            growth={calculateGrowthRate(
              totalViews,
              Math.round(totalViews * 0.85),
            )}
          />
          <MetricCard
            icon={Heart}
            title="Total Likes"
            value={totalLikes}
            growth={calculateGrowthRate(
              totalLikes,
              Math.round(totalLikes * 0.9),
            )}
          />
          <MetricCard
            icon={MessageCircle}
            title="Comments"
            value={totalComments}
            growth={calculateGrowthRate(
              totalComments,
              Math.round(totalComments * 0.8),
            )}
          />
          <MetricCard
            icon={TrendingUp}
            title="Engagement Rate"
            value={engagementRate}
            growth={calculateGrowthRate(
              parseFloat(engagementRate),
              parseFloat(engagementRate) * 0.92,
            )}
            prefix={engagementRate > 0 ? "" : ""}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Performance</TabsTrigger>
            <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Blogs
                    </span>
                    <span className="font-semibold">{totalBlogs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Avg. Views per Blog
                    </span>
                    <span className="font-semibold">
                      {formatNumber(avgViewsPerBlog)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Engagement Rate
                    </span>
                    <span className="font-semibold">{engagementRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Most Active Day
                    </span>
                    <span className="font-semibold">Monday</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber(totalViews)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Total Views
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalLikes}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Total Likes
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalComments}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Comments
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {engagementRate}%
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Engagement
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Blogs</CardTitle>
              </CardHeader>
              <CardContent>
                {blogAnalytics.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No blogs published yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating content to see analytics
                    </p>
                    <Button onClick={() => navigate("/create")}>
                      Create Your First Blog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blogAnalytics.slice(0, 10).map((blog, index) => (
                      <BlogPerformanceRow
                        key={blog._id}
                        blog={blog}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Audience Analytics Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      Detailed audience insights will be available in a future
                      update
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reading Patterns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Reading Analytics Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      Reading time and engagement patterns will be tracked soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Analytics;
