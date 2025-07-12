
import React, { useEffect } from "react";
import { BlogCard } from "./BlogCard";
import { Pagination } from "@/components/shared/Pagination";
import { useBlogStore } from "@/features/blogs/blogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, BookOpen, WifiOff, AlertTriangle } from "lucide-react";

export const BlogList = ({
  variant = "grid",
  showPagination = true,
  pageSize = 12,
}) => {
  const {
    blogs,
    isLoading,
    error,
    pagination,
    filters,
    getBlogs,
    setPage,
    clearError,
  } = useBlogStore();

  useEffect(() => {
    getBlogs({
      page: pagination.page,
      limit: pageSize,
      ...filters,
    });
  }, [pagination.page, pageSize, filters]);

  const handleRetry = () => {
    clearError();
    getBlogs({
      page: pagination.page,
      limit: pageSize,
      ...filters,
    });
  };

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show skeleton on initial load or when loading with no existing data
  if (isLoading && (!blogs || blogs.length === 0)) {
    return <BlogListSkeleton variant={variant} />;
  }

  // Show skeleton instead of error for better UX
  if (error && (!blogs || blogs.length === 0)) {
    return <BlogListSkeleton variant={variant} />;
  }

  // Show no results message only when not loading and no error and no blogs
  if (!isLoading && !error && (!blogs || blogs.length === 0)) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
        <p className="text-muted-foreground mb-4">
          {filters.search || filters.tags.length > 0 || filters.author
            ? "Try adjusting your search criteria"
            : "Be the first to write a blog post!"}
        </p>
        {error && (
          <Button variant="outline" onClick={handleRetry} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  const getGridClasses = () => {
    switch (variant) {
      case "list":
        return "space-y-4";
      case "masonry":
        return "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6";
      case "grid":
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    }
  };

  return (
    <div className="space-y-8">
      {/* Loading overlay when refreshing existing data */}
      {isLoading && blogs && blogs.length > 0 && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-background p-4 rounded-lg shadow-lg">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading blogs...</span>
          </div>
        </div>
      )}

      {/* Error banner that can be dismissed */}
      {error && blogs && blogs.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to refresh blogs. Showing cached results.</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className={getGridClasses()}>
        {(blogs || []).map((blog, index) => (
          <BlogCard
            key={blog._id || blog.id}
            blog={blog}
            variant={variant === "grid" && index === 0 ? "featured" : "default"}
          />
        ))}
      </div>

      {showPagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

const BlogListSkeleton = ({ variant }) => {
  const getSkeletonClasses = () => {
    switch (variant) {
      case "list":
        return "space-y-4";
      case "masonry":
        return "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6";
      case "grid":
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    }
  };

  const renderSkeletonItem = (index) => {
    if (variant === "list") {
      return (
        <div key={index} className="flex space-x-4 p-4 border rounded-lg">
          <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={getSkeletonClasses()}>
      {Array.from({ length: variant === "list" ? 5 : 8 }).map((_, index) =>
        renderSkeletonItem(index),
      )}
    </div>
  );
};
