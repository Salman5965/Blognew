
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
import {
  Search,
  Filter,
  Grid,
  List,
  X,
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
  Share2,
  Loader2,
  AlertCircle,
  BookOpen,
  FileText,
  Globe,
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

const BlogCard = ({
  blog,
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

  const blogUrl = `${window.location.origin}/blog/${blog.slug}`;

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={
                  blog.featuredImage || blog.image || "/api/placeholder/80/80"
                }
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {blog.title}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(blog._id)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(blogUrl)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(blog._id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(blog._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <Badge className={getStatusColor(blog.status)}>
                  {blog.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </span>
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {blog.excerpt || blog.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {(blog.views || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {blog.likeCount || blog.likes?.length || 0}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {blog.commentsCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {blog.readTime || 5} min
                  </div>
                </div>

                <div className="flex gap-2">
                  {blog.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/blog/${blog.slug}`, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`${ROUTES.EDIT_BLOG}/${blog._id || blog.id}`)
                    }
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
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
          src={blog.featuredImage || blog.image || "/api/placeholder/400/225"}
          alt={blog.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={getStatusColor(blog.status)}>{blog.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(blog._id)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(blogUrl)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(blog._id)}>
                <FileText className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(blog._id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-xl leading-tight line-clamp-2">
          {blog.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {blog.excerpt || blog.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {(blog.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {blog.tags?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{blog.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {blog.readTime || 5} min
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {(blog.views || 0).toLocaleString()}
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {blog.likeCount || blog.likes?.length || 0}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {blog.commentsCount || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(blog._id)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {blog.status === "published" && (
            <Button
              variant="outline"
              onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MyBlogs = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const loadBlogs = async (
    page = 1,
    search = searchTerm,
    status = selectedStatus,
  ) => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);

      const query = {
        page,
        limit: 12,
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
      const pagination = response.pagination || {};

      setBlogs(blogsData);
      setTotalPages(
        pagination.totalPages ||
          Math.ceil((pagination.total || blogsData.length) / 12),
      );
      setTotalBlogs(pagination.total || blogsData.length);
      setCurrentPage(pagination.page || page);
    } catch (err) {
      setError(err.message || "Failed to load blogs. Please try again later.");
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadBlogs();
    }
  }, [user]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadBlogs(1, value, selectedStatus);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    loadBlogs(1, searchTerm, status);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadBlogs(page, searchTerm, selectedStatus);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (blogId) => {
    navigate(`/edit/${blogId}`);
  };

  const handleDelete = (blogId) => {
    setBlogToDelete(blogId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      await blogService.deleteBlog(blogToDelete);
      setBlogs((prev) => prev.filter((blog) => blog._id !== blogToDelete));
      setTotalBlogs((prev) => prev - 1);

      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleDuplicate = async (blogId) => {
    try {
      const blogToClone = blogs.find((blog) => blog._id === blogId);
      if (!blogToClone) return;

      const duplicatedBlog = {
        title: `${blogToClone.title} (Copy)`,
        content: blogToClone.content,
        excerpt: blogToClone.excerpt,
        tags: blogToClone.tags,
        category: blogToClone.category,
        status: "draft",
      };

      const response = await blogService.createBlog(duplicatedBlog);

      toast({
        title: "Success",
        description: "Blog duplicated successfully",
      });

      // Refresh blogs list
      loadBlogs(currentPage, searchTerm, selectedStatus);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate blog",
        variant: "destructive",
      });
    }
  };

  if (error && blogs.length === 0) {
    return (
      <PageWrapper className="py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => loadBlogs()} variant="outline">
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Blogs</h1>
            <p className="text-muted-foreground">
              Manage and organize your blog posts
            </p>
          </div>
          <Button onClick={() => navigate("/create")} className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create New Blog
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your blogs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
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
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
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
              Showing {blogs.length} of {totalBlogs} blog
              {totalBlogs !== 1 ? "s" : ""}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedStatus !== "all" && ` with status "${selectedStatus}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Blogs Grid/List */}
        {!loading && blogs.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                : "space-y-4 mb-8"
            }
          >
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && blogs.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || selectedStatus !== "all"
                  ? "No blogs found"
                  : "No blogs yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Start creating your first blog post to share your thoughts with the world."}
              </p>
              {searchTerm || selectedStatus !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    loadBlogs(1, "", "all");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate("/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Blog
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                );
              }
              if (page === currentPage - 3 || page === currentPage + 3) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                blog post and remove all associated data.
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

export default MyBlogs;
