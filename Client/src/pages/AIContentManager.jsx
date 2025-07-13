import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Cpu,
  Zap,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Clock,
  Filter,
  Search,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  BarChart3,
  Settings,
  Globe,
  Sparkles,
  Target,
  Rss,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";

const AIContentManager = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [stats, setStats] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingContent, setEditingContent] = useState(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [publishingContent, setPublishingContent] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin" || user?.isAdmin;

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [isAdmin, currentPage, statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStats(), loadContent()]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load AI content data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/ai-content/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadContent = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await fetch(`/api/ai-content?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setContent(data.data.content);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  const generateContent = async (categories = null) => {
    try {
      setGeneratingContent(true);
      const requestBody = {
        categories: categories || [
          "technology",
          "space",
          "nature",
          "ocean",
          "travel",
          "news",
        ],
        limit: 5,
      };

      const response = await fetch("/api/ai-content/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Generated ${data.data.generated} new content items`,
        });
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const publishContent = async (contentIds) => {
    try {
      setPublishingContent(true);
      const response = await fetch("/api/ai-content/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ contentIds }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Published ${data.data.publishedCount} articles`,
        });
        setSelectedContent([]);
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error publishing content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to publish content",
        variant: "destructive",
      });
    } finally {
      setPublishingContent(false);
    }
  };

  const updateContent = async (contentId, updates) => {
    try {
      const response = await fetch(`/api/ai-content/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Content updated successfully",
        });
        setEditingContent(null);
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    }
  };

  const deleteContent = async (contentId) => {
    try {
      const response = await fetch(`/api/ai-content/${contentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Content deleted successfully",
        });
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const triggerDailyGeneration = async () => {
    try {
      setGeneratingContent(true);
      const response = await fetch("/api/ai-content/trigger/daily", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Daily content generation triggered successfully",
        });
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error triggering daily generation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger daily generation",
        variant: "destructive",
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
      case "generated":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300";
      case "rejected":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4" />;
      case "generated":
        return <Bot className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "technology":
        return <Cpu className="h-4 w-4" />;
      case "space":
        return <Sparkles className="h-4 w-4" />;
      case "nature":
        return <Globe className="h-4 w-4" />;
      case "ocean":
        return <Target className="h-4 w-4" />;
      case "travel":
        return <Calendar className="h-4 w-4" />;
      case "news":
        return <Rss className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Icon
            className={`h-8 w-8 text-${color}-600 dark:text-${color}-400`}
          />
        </div>
      </CardContent>
    </Card>
  );

  const filteredContent = content.filter(
    (item) =>
      item.generatedTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Bot className="h-8 w-8 mr-3 text-purple-600 dark:text-purple-400" />
              AI Content Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage automated content generation for Daily Drip
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={() => generateContent()}
              disabled={generatingContent}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {generatingContent ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Generate Content
            </Button>
            <Button
              onClick={triggerDailyGeneration}
              disabled={generatingContent}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Trigger Daily
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Bot}
              title="Total Content"
              value={stats.totalContent || 0}
              subtitle="All AI-generated items"
              color="purple"
            />
            <StatCard
              icon={CheckCircle}
              title="Published"
              value={stats.publishedContent || 0}
              subtitle="Live articles"
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              title="Ready to Publish"
              value={stats.recentContent?.length || 0}
              subtitle="High quality content"
              color="blue"
            />
            <StatCard
              icon={BarChart3}
              title="Categories"
              value={stats.categoryStats?.length || 0}
              subtitle="Active categories"
              color="orange"
            />
          </div>
        )}

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Filters and Controls */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Content Management
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    {selectedContent.length > 0 && (
                      <Button
                        onClick={() => publishContent(selectedContent)}
                        disabled={publishingContent}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {publishingContent ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Publish Selected ({selectedContent.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="space">Space</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="ocean">Ocean</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredContent.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No content found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Start generating AI content to see it here
                      </p>
                      <Button onClick={() => generateContent()}>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Content
                      </Button>
                    </div>
                  ) : (
                    filteredContent.map((item) => (
                      <Card
                        key={item._id}
                        className={`hover:shadow-md transition-shadow ${
                          selectedContent.includes(item._id)
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <Checkbox
                                checked={selectedContent.includes(item._id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedContent([
                                      ...selectedContent,
                                      item._id,
                                    ]);
                                  } else {
                                    setSelectedContent(
                                      selectedContent.filter(
                                        (id) => id !== item._id,
                                      ),
                                    );
                                  }
                                }}
                                disabled={item.status !== "generated"}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge
                                    className={getStatusColor(item.status)}
                                  >
                                    {getStatusIcon(item.status)}
                                    <span className="ml-1 capitalize">
                                      {item.status}
                                    </span>
                                  </Badge>
                                  <Badge variant="outline">
                                    {getCategoryIcon(item.category)}
                                    <span className="ml-1 capitalize">
                                      {item.category}
                                    </span>
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Quality: {item.qualityScore || 0}%
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                  {item.generatedTitle || item.originalTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {item.generatedExcerpt ||
                                    "No excerpt available"}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDistanceToNow(
                                      new Date(item.createdAt),
                                      {
                                        addSuffix: true,
                                      },
                                    )}
                                  </span>
                                  <span>
                                    Source:{" "}
                                    {item.metadata?.sourceWebsite || "Unknown"}
                                  </span>
                                  {item.metadata?.readTime && (
                                    <span>
                                      {item.metadata.readTime} min read
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {item.generatedTitle ||
                                        item.originalTitle}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Generated content preview
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Generated Content:
                                      </h4>
                                      <div className="prose dark:prose-invert max-w-none">
                                        {item.generatedContent ||
                                          "No content generated yet"}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Tags:
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {item.generatedTags?.map(
                                          (tag, index) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                            >
                                              {tag}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {item.status === "generated" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingContent(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContent(item._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and insights for AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-4">
                        Status Distribution
                      </h4>
                      <div className="space-y-2">
                        {stats.statusStats?.map((stat) => (
                          <div
                            key={stat._id}
                            className="flex justify-between items-center"
                          >
                            <span className="capitalize">
                              {stat._id || "Unknown"}
                            </span>
                            <Badge variant="outline">{stat.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">
                        Category Performance
                      </h4>
                      <div className="space-y-2">
                        {stats.categoryStats?.map((stat) => (
                          <div
                            key={stat._id}
                            className="flex justify-between items-center"
                          >
                            <span className="capitalize">{stat._id}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{stat.count}</Badge>
                              <Badge variant="secondary">
                                {Math.round(stat.avgQualityScore || 0)}% avg
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Loading analytics...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Generation Settings</CardTitle>
                <CardDescription>
                  Configure AI content generation parameters and sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Categories</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        "technology",
                        "space",
                        "nature",
                        "ocean",
                        "travel",
                        "news",
                      ].map((category) => (
                        <Button
                          key={category}
                          variant="outline"
                          onClick={() => generateContent([category])}
                          disabled={generatingContent}
                          className="justify-start"
                        >
                          {getCategoryIcon(category)}
                          <span className="ml-2 capitalize">{category}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Quality Threshold</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Minimum quality score for automatic publishing (currently
                      75%)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Publishing Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      Content is automatically generated daily at 6:00 AM UTC
                      and published hourly based on quality scores.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Scheduler</CardTitle>
                <CardDescription>
                  Monitor and control automated content generation and
                  publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Daily Generation</h4>
                        <Badge variant="outline" className="text-green-600">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Runs daily at 6:00 AM UTC
                      </p>
                      <Button
                        onClick={triggerDailyGeneration}
                        disabled={generatingContent}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Trigger Now
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Auto Publishing</h4>
                        <Badge variant="outline" className="text-green-600">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Runs every hour for ready content
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Next Scheduled Tasks</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Content Generation</span>
                        <span className="text-muted-foreground">
                          Tomorrow 6:00 AM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto Publishing Check</span>
                        <span className="text-muted-foreground">Next hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content Cleanup</span>
                        <span className="text-muted-foreground">
                          Next Sunday 3:00 AM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Content Dialog */}
        {editingContent && (
          <Dialog
            open={!!editingContent}
            onOpenChange={() => setEditingContent(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Generated Content</DialogTitle>
                <DialogDescription>
                  Make changes to the AI-generated content before publishing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <Input
                    value={editingContent.generatedTitle || ""}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        generatedTitle: e.target.value,
                      })
                    }
                    placeholder="Article title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Excerpt
                  </label>
                  <Textarea
                    value={editingContent.generatedExcerpt || ""}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        generatedExcerpt: e.target.value,
                      })
                    }
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content
                  </label>
                  <Textarea
                    value={editingContent.generatedContent || ""}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        generatedContent: e.target.value,
                      })
                    }
                    placeholder="Article content"
                    rows={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={editingContent.generatedTags?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        generatedTags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim()),
                      })
                    }
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingContent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      updateContent(editingContent._id, {
                        generatedTitle: editingContent.generatedTitle,
                        generatedContent: editingContent.generatedContent,
                        generatedExcerpt: editingContent.generatedExcerpt,
                        generatedTags: editingContent.generatedTags,
                      })
                    }
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageWrapper>
  );
};

export default AIContentManager;
