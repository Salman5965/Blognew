
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { formatBlogDate } from "@/utils/formatDate";

/**
 * Component to display and manage blog publish status
 */
export const PublishStatus = ({
  blog,
  onPublish,
  onUnpublish,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const isPublished = blog.status === "published" || blog.isPublished;
  const isDraft = blog.status === "draft" || !blog.isPublished;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center space-x-3">
        {/* Status Badge */}
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className={isPublished ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {isPublished ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Published
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Draft
            </>
          )}
        </Badge>

        {/* Date Information */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {isPublished && blog.publishedAt && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Published {formatBlogDate(blog.publishedAt)}</span>
            </div>
          )}

          {blog.updatedAt && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated {formatBlogDate(blog.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center space-x-2">
          {isDraft && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onPublish?.(blog._id || blog.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="h-3 w-3 mr-1" />
              Publish
            </Button>
          )}

          {isPublished && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUnpublish?.(blog._id || blog.id)}
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Unpublish
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(blog._id || blog.id)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete?.(blog._id || blog.id)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Simple status indicator for blog cards
 */
export const BlogStatusBadge = ({ blog, className = "" }) => {
  const isPublished = blog.status === "published" || blog.isPublished;

  return (
    <Badge
      variant={isPublished ? "default" : "secondary"}
      className={`${isPublished ? "bg-green-500" : ""} ${className}`}
    >
      {isPublished ? "Published" : "Draft"}
    </Badge>
  );
};

/**
 * Publish confirmation dialog content
 */
export const PublishConfirmation = ({ blog, onConfirm, onCancel }) => {
  const blogTitle = blog.title || "Untitled Blog";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Publish Blog Post?</h3>
        <p className="text-muted-foreground">
          Are you sure you want to publish "{blogTitle}"? Once published, it
          will be visible to all readers.
        </p>
      </div>

      <div className="bg-muted p-3 rounded space-y-2">
        <div className="flex justify-between text-sm">
          <span>Title:</span>
          <span className="font-medium">{blogTitle}</span>
        </div>

        {blog.category && (
          <div className="flex justify-between text-sm">
            <span>Category:</span>
            <Badge variant="secondary" className="text-xs">
              {blog.category}
            </Badge>
          </div>
        )}

        {blog.tags?.length > 0 && (
          <div className="flex justify-between text-sm">
            <span>Tags:</span>
            <div className="flex space-x-1">
              {blog.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
          <Eye className="h-4 w-4 mr-2" />
          Publish Now
        </Button>
      </div>
    </div>
  );
};

export default PublishStatus;