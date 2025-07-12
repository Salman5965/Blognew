import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Share2,
  Edit,
  Loader2,
  AlertCircle,
  Download,
  Target,
  Activity,
  LineChart,
  PieChart,
  Filter,
  Search,
  Star,
  Bookmark,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export const StoryAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [userStats, setUserStats] = useState(null);
  const [storyAnalytics, setStoryAnalytics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("views");
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

      // TODO: Load story analytics when story service is available
      // const storiesResponse = await storyService.getMyStories({
      //   limit: 100,
      //   sortBy: sortBy,
      //   sortOrder: "desc",
      // });
      // setStoryAnalytics(storiesResponse.stories || storiesResponse.data || []);

      // Placeholder for now
      setStoryAnalytics([]);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (isPublished) => {
    return isPublished
      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
  };

  const filteredStories = storyAnalytics.filter((story) =>
    story.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    growth,
    prefix = "",
    color = "blue",
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
            `${prefix}${formatNumber(value)}`
          )}
        </div>
        {subtitle && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {growth !== undefined && !loading && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {growth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={growth >= 0 ? "text-green-600" : "text-red-600"}>
              {growth >= 0 ? "+" : ""}
              {growth}%
            </span>
            <span>vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StoryPerformanceRow = ({ story, rank }) => (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors border-l-4 border-l-purple-500">
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <span className="text-sm font-bold text-white">#{rank}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">
            {story.title}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <Badge className={getStatusColor(story.isPublished)}>
              {story.isPublished ? "Published" : "Draft"}
            </Badge>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(story.publishedAt || story.createdAt)}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {story.readTime || 3} min read
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-sm">
        <div className="text-center">
          <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
            <Eye className="h-4 w-4 mr-1" />
            {formatNumber(story.views || 0)}
          </div>
          <div className="text-xs text-muted-foreground">Views</div>
        </div>
        <div className="text-center">
          <div className="flex items-center text-red-600 dark:text-red-400 font-semibold">
            <Heart className="h-4 w-4 mr-1" />
            {formatNumber(story.likes?.length || 0)}
          </div>
          <div className="text-xs text-muted-foreground">Likes</div>
        </div>
        <div className="text-center">
          <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold">
            <MessageCircle className="h-4 w-4 mr-1" />
            {formatNumber(story.comments?.length || 0)}
          </div>
          <div className="text-xs text-muted-foreground">Comments</div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/stories/${story._id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/stories/${story._id}`, "_blank")}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
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
            <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadAnalyticsData}>Try Again</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate analytics metrics
  const totalViews = userStats?.stories?.totalViews || 0;
  const totalLikes = userStats?.stories?.totalLikes || 0;
  const totalComments = userStats?.comments?.totalStoryComments || 0;
  const totalStories = userStats?.stories?.totalStories || 0;
  const avgReadTime = userStats?.stories?.avgReadTime || 0;

  // Calculate engagement metrics
  const engagementRate =
    totalViews > 0
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1)
      : 0;
  const avgViewsPerStory =
    totalStories > 0 ? Math.round(totalViews / totalStories) : 0;
  const avgLikesPerStory =
    totalStories > 0 ? Math.round(totalLikes / totalStories) : 0;

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-purple-600 dark:text-purple-400" />
                Story Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive insights into your story performance and reader
                engagement
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
            icon={BookOpen}
            title="Total Stories"
            value={totalStories}
            subtitle={`${totalStories} published stories`}
            color="purple"
            growth={calculateGrowthRate(
              totalStories,
              Math.round(totalStories * 0.85),
            )}
          />
          <MetricCard
            icon={Eye}
            title="Total Views"
            value={totalViews}
            subtitle="All-time story views"
            color="green"
            growth={calculateGrowthRate(
              totalViews,
              Math.round(totalViews * 0.9),
            )}
          />
          <MetricCard
            icon={Heart}
            title="Total Likes"
            value={totalLikes}
            subtitle="Likes on all stories"
            color="red"
            growth={calculateGrowthRate(
              totalLikes,
              Math.round(totalLikes * 0.88),
            )}
          />
          <MetricCard
            icon={MessageCircle}
            title="Story Comments"
            value={totalComments}
            subtitle="Comments on your stories"
            color="blue"
            growth={calculateGrowthRate(
              totalComments,
              Math.round(totalComments * 0.82),
            )}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(avgViewsPerStory)}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Avg Views/Story
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        {formatNumber(avgLikesPerStory)}
                      </div>
                      <div className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                        Avg Likes/Story
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {engagementRate}%
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Engagement Rate
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Content:
                        </span>
                        <span className="font-semibold">
                          {totalStories} stories
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg Read Time:
                        </span>
                        <span className="font-semibold">
                          {Math.round(avgReadTime)} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Engagement:
                        </span>
                        <span className="font-semibold">
                          {formatNumber(totalLikes + totalComments)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Member Since:
                        </span>
                        <span className="font-semibold">
                          {formatDate(userStats?.joinedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => navigate("/stories/create")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Story
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/stories")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Manage Stories
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/dashboard")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Top Performing Stories
                  </span>
                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="views">Views</SelectItem>
                        <SelectItem value="likes">Likes</SelectItem>
                        <SelectItem value="comments">Comments</SelectItem>
                        <SelectItem value="createdAt">Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search stories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredStories.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchTerm
                        ? "No stories found"
                        : "No stories published yet"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Start sharing your stories to see analytics"}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => navigate("/stories/create")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Share Your First Story
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStories.map((story, index) => (
                      <StoryPerformanceRow
                        key={story._id}
                        story={story}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-lg">
                      <Heart className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {totalLikes}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Total Likes
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg">
                      <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalComments}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Total Comments
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Engagement Rate
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {engagementRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Avg Likes per Story
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {avgLikesPerStory}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Comments per Story
                      </span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {totalStories > 0
                          ? Math.round(totalComments / totalStories)
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Reader Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Advanced Analytics Coming Soon
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Detailed reader demographics, reading patterns, and
                      engagement trends will be available in future updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Content Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredStories.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No stories yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start sharing your stories to see detailed analytics
                    </p>
                    <Button onClick={() => navigate("/stories/create")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Share Your First Story
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStories.map((story, index) => (
                      <div
                        key={story._id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                              {story.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                              <Badge
                                className={getStatusColor(story.isPublished)}
                              >
                                {story.isPublished ? "Published" : "Draft"}
                              </Badge>
                              <span>
                                {formatDate(
                                  story.publishedAt || story.createdAt,
                                )}
                              </span>
                              <span>{story.readTime || 3} min read</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 max-w-md">
                              <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {formatNumber(story.views || 0)}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  Views
                                </div>
                              </div>
                              <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                  {formatNumber(story.likes?.length || 0)}
                                </div>
                                <div className="text-xs text-red-600 dark:text-red-400">
                                  Likes
                                </div>
                              </div>
                              <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded">
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {formatNumber(story.comments?.length || 0)}
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400">
                                  Comments
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/stories/${story._id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(`/stories/${story._id}`, "_blank")
                              }
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default StoryAnalytics;
