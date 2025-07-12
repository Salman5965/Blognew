import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { blogService } from "@/services/blogService";
import { storiesService } from "@/services/storiesService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Plus,
  MoreVertical,
  ExternalLink,
  Copy,
  Loader2,
  AlertCircle,
  BookOpen,
  FileText,
  Globe,
  PenTool,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="h-full">
        <div className="aspect-video w-full bg-muted animate-pulse rounded-t-lg" />
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const PostCard = ({
  post,
  type,
  onEdit,
  onDelete,
  onDuplicate,
  viewMode = "grid",
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const postUrl =
    type === "blog"
      ? `${window.location.origin}/blog/${post.slug}`
      : `${window.location.origin}/stories/${post._id}`;

  const handleEdit = () => {
    if (type === "blog") {
      navigate(`/edit/${post._id}`);
    } else {
      navigate(`/stories/edit/${post._id}`);
    }
  };

  const handleView = () => {
    if (type === "blog") {
      window.open(`/blog/${post.slug}`, "_blank");
    } else {
      window.open(`/stories/${post._id}`, "_blank");
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={
                  post.featuredImage ||
                  post.image ||
                  post.coverImage ||
                  "/api/placeholder/80/80"
                }
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {post.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {type === "blog" ? "Blog" : "Story"}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(postUrl)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(post._id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(post._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <Badge className={getStatusColor(post.status)}>
                  {post.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {post.excerpt || post.description || post.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {(post.views || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likeCount || post.likes?.length || 0}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.commentsCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime || (type === "story" ? 2 : 5)} min
                  </div>
                </div>

                <div className="flex gap-2">
                  {post.status === "published" && (
                    <Button variant="outline" size="sm" onClick={handleView}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img
          src={
            post.featuredImage ||
            post.image ||
            post.coverImage ||
            "/api/placeholder/400/225"
          }
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
            <Badge variant="outline" className="text-xs">
              {type === "blog" ? "Blog" : "Story"}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(postUrl)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(post._id)}>
                <FileText className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(post._id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl leading-tight line-clamp-2">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt || post.description || post.summary}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {(post.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {post.tags?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {post.readTime || (type === "story" ? 2 : 5)} min
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {(post.views || 0).toLocaleString()}
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {post.likeCount || post.likes?.length || 0}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.commentsCount || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" className="flex-1" onClick={handleEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {post.status === "published" && (
            <Button variant="outline" onClick={handleView}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PostsTab = ({
  type,
  posts,
  loading,
  error,
  searchTerm,
  selectedStatus,
  viewMode,
  onSearch,
  onStatusChange,
  onViewModeChange,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateNew,
}) => {
  if (error && posts.length === 0) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Search your ${type}s...`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {posts.length} {type}
            {posts.length !== 1 ? "s" : ""}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedStatus !== "all" && ` with status "${selectedStatus}"`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Posts Grid/List */}
      {!loading && posts.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              : "space-y-4 mb-8"
          }
        >
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              type={type}
              viewMode={viewMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            {type === "blog" ? (
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            ) : (
              <PenTool className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            )}
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || selectedStatus !== "all"
                ? `No ${type}s found`
                : `No ${type}s yet`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : `Start creating your first ${type} post to share your thoughts with the world.`}
            </p>
            {searchTerm || selectedStatus !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  onSearch("");
                  onStatusChange("all");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First {type === "blog" ? "Blog" : "Story"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const MyPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("blogs");
  const [blogs, setBlogs] = useState([]);
  const [stories, setStories] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);
  const [storiesError, setStoriesError] = useState(null);
  const [blogSearchTerm, setBlogSearchTerm] = useState("");
  const [storySearchTerm, setStorySearchTerm] = useState("");
  const [blogSelectedStatus, setBlogSelectedStatus] = useState("all");
  const [storySelectedStatus, setStorySelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  const loadBlogs = async (
    search = blogSearchTerm,
    status = blogSelectedStatus,
  ) => {
    if (!user?._id) return;

    try {
      setBlogsLoading(true);
      setBlogsError(null);

      const query = {
        page: 1,
        limit: 50,
        author: user._id,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (search) {
        query.search = search;
      }

      if (status && status !== "all") {
        query.status = status;
      }

      const response = await blogService.getMyBlogs(query);
      const blogsData = response.blogs || response.data || [];
      setBlogs(blogsData);
    } catch (err) {
      setBlogsError(
        err.message || "Failed to load blogs. Please try again later.",
      );
      console.error("Error fetching blogs:", err);
    } finally {
      setBlogsLoading(false);
    }
  };

  const loadStories = async (
    search = storySearchTerm,
    status = storySelectedStatus,
  ) => {
    if (!user?._id) return;

    try {
      setStoriesLoading(true);
      setStoriesError(null);

      const query = {
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (search) {
        query.search = search;
      }

      if (status && status !== "all") {
        query.status = status;
      }

      const response = await storiesService.getMyStories(query);
      const storiesData = response.stories || response.data || [];
      setStories(storiesData);
    } catch (err) {
      setStoriesError(
        err.message || "Failed to load stories. Please try again later.",
      );
      console.error("Error fetching stories:", err);
    } finally {
      setStoriesLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadBlogs();
      loadStories();
    }
  }, [user]);

  const handleBlogSearch = (value) => {
    setBlogSearchTerm(value);
    loadBlogs(value, blogSelectedStatus);
  };

  const handleStorySearch = (value) => {
    setStorySearchTerm(value);
    loadStories(value, storySelectedStatus);
  };

  const handleBlogStatusChange = (status) => {
    setBlogSelectedStatus(status);
    loadBlogs(blogSearchTerm, status);
  };

  const handleStoryStatusChange = (status) => {
    setStorySelectedStatus(status);
    loadStories(storySearchTerm, status);
  };

  const handleEdit = (postId) => {
    if (activeTab === "blogs") {
      navigate(`/edit/${postId}`);
    } else {
      navigate(`/stories/edit/${postId}`);
    }
  };

  const handleDelete = (postId) => {
    setPostToDelete(postId);
    setDeleteType(activeTab === "blogs" ? "blog" : "story");
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete || !deleteType) return;

    try {
      if (deleteType === "blog") {
        await blogService.deleteBlog(postToDelete);
        setBlogs((prev) => prev.filter((blog) => blog._id !== postToDelete));
      } else {
        await storiesService.deleteStory(postToDelete);
        setStories((prev) =>
          prev.filter((story) => story._id !== postToDelete),
        );
      }

      toast({
        title: "Success",
        description: `${deleteType === "blog" ? "Blog" : "Story"} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${deleteType}`,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      setDeleteType(null);
    }
  };

  const handleDuplicate = async (postId) => {
    try {
      if (activeTab === "blogs") {
        const blogToClone = blogs.find((blog) => blog._id === postId);
        if (!blogToClone) return;

        const duplicatedBlog = {
          title: `${blogToClone.title} (Copy)`,
          content: blogToClone.content,
          excerpt: blogToClone.excerpt,
          tags: blogToClone.tags,
          category: blogToClone.category,
          status: "draft",
        };

        await blogService.createBlog(duplicatedBlog);
        loadBlogs();
      } else {
        const storyToClone = stories.find((story) => story._id === postId);
        if (!storyToClone) return;

        const duplicatedStory = {
          title: `${storyToClone.title} (Copy)`,
          content: storyToClone.content,
          summary: storyToClone.summary,
          tags: storyToClone.tags,
          category: storyToClone.category,
          status: "draft",
        };

        await storiesService.createStory(duplicatedStory);
        loadStories();
      }

      toast({
        title: "Success",
        description: `${activeTab === "blogs" ? "Blog" : "Story"} duplicated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to duplicate ${activeTab === "blogs" ? "blog" : "story"}`,
        variant: "destructive",
      });
    }
  };

  const handleCreateBlog = () => {
    navigate("/create");
  };

  const handleCreateStory = () => {
    navigate("/stories/create");
  };

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Posts</h1>
            <p className="text-muted-foreground">
              Manage and organize your blogs and stories
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button onClick={handleCreateBlog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Blog
            </Button>
            <Button onClick={handleCreateStory}>
              <Plus className="h-4 w-4 mr-2" />
              New Story
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Blogs
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              My Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="mt-6">
            <PostsTab
              type="blog"
              posts={blogs}
              loading={blogsLoading}
              error={blogsError}
              searchTerm={blogSearchTerm}
              selectedStatus={blogSelectedStatus}
              viewMode={viewMode}
              onSearch={handleBlogSearch}
              onStatusChange={handleBlogStatusChange}
              onViewModeChange={setViewMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onCreateNew={handleCreateBlog}
            />
          </TabsContent>

          <TabsContent value="stories" className="mt-6">
            <PostsTab
              type="story"
              posts={stories}
              loading={storiesLoading}
              error={storiesError}
              searchTerm={storySearchTerm}
              selectedStatus={storySelectedStatus}
              viewMode={viewMode}
              onSearch={handleStorySearch}
              onStatusChange={handleStoryStatusChange}
              onViewModeChange={setViewMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onCreateNew={handleCreateStory}
            />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the{" "}
                {deleteType} and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageWrapper>
  );
};

export default MyPosts;
