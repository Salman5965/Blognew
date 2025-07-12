import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { communityService } from "@/services/communityService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Hash,
  Send,
  Loader2,
  X,
  Plus,
  Image,
  Link,
  FileText,
} from "lucide-react";

export const CreatePostDialog = ({
  open,
  onOpenChange,
  categories = [],
  onPostCreate,
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();

    if (!tag) return;

    if (formData.tags.includes(tag)) {
      toast({
        title: "Warning",
        description: "Tag already added",
        variant: "destructive",
      });
      return;
    }

    if (formData.tags.length >= 5) {
      toast({
        title: "Warning",
        description: "Maximum 5 tags allowed",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    } else if (formData.content.length > 5000) {
      newErrors.content = "Content must be less than 5000 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const response = await communityService.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        category: "",
        tags: [],
      });
      setTagInput("");
      setErrors({});

      // Notify parent component
      if (onPostCreate) {
        onPostCreate(response.post);
      }

      // Close dialog
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;

    // Reset form when closing
    setFormData({
      title: "",
      content: "",
      category: "",
      tags: [],
    });
    setTagInput("");
    setErrors({});

    onOpenChange(false);
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      general: Hash,
      development: FileText,
      help: "❓",
      career: "💼",
      offtopic: "💬",
    };
    return icons[categoryId] || Hash;
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      general: "text-blue-600",
      development: "text-green-600",
      help: "text-orange-600",
      career: "text-purple-600",
      offtopic: "text-gray-600",
    };
    return colors[categoryId] || "text-blue-600";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Create New Post
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a discussion with the
            community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="What's your post about?"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              maxLength={200}
              className={errors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center">
              {errors.title && (
                <span className="text-sm text-red-500">{errors.title}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.title.length}/200 characters
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category.id);
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        {typeof IconComponent === "string" ? (
                          <span>{IconComponent}</span>
                        ) : (
                          <IconComponent
                            className={`h-4 w-4 ${getCategoryColor(category.id)}`}
                          />
                        )}
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.category && (
              <span className="text-sm text-red-500">{errors.category}</span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask questions, or provide details..."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className={`min-h-32 resize-none ${errors.content ? "border-red-500" : ""}`}
              maxLength={5000}
            />
            <div className="flex justify-between items-center">
              {errors.content && (
                <span className="text-sm text-red-500">{errors.content}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.content.length}/5000 characters
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                maxLength={20}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Add up to 5 tags to help others discover your post. Press Enter or
              click + to add.
            </p>
          </div>

          {/* Future: Attachments */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <div className="space-y-2">
              <div className="flex justify-center space-x-4 text-muted-foreground">
                <Image className="h-6 w-6" />
                <Link className="h-6 w-6" />
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                File attachments coming soon
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Your post will be visible to all community members
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.title.trim() ||
                !formData.content.trim() ||
                !formData.category
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Post
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
