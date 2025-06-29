import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBlogEditor } from "@/hooks/useBlogEditor";
import { useBlogStore } from "@/features/blogs/blogStore";
import { ROUTES } from "@/utils/constant";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Loader2,
  FolderOpen,
  ChevronDown,
  Upload,
  Link,
  Image,
  CheckCircle,
  Circle,
  Clock,
  Zap,
} from "lucide-react";
import BlogPreviewModal from "@/components/ui/previewDialog";

const BLOG_CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Cybersecurity",
  "DevOps",
  "Tutorial",
  "News",
  "Opinion",
  "Review",
  "Guide",
  "Tips",
  "Business",
  "Career",
  "Personal",
  "Lifestyle",
  "Health",
  "Travel",
  "Food",
  "Entertainment",
  "Sports",
  "Education",
];

const CustomSelect = ({ value, onValueChange, placeholder, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    setIsOpen(false);

    if (onValueChange) {
      onValueChange(optionValue);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={
            selectedOption ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[99999] mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CreateBlog = () => {
  const navigate = useNavigate();
  const { createBlog } = useBlogStore();
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState("url");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    title,
    content,
    excerpt,
    coverImage,
    category,
    tags,
    isPublished,
    visibility,
    isDirty,
    setTitle,
    setContent,
    setExcerpt,
    setCoverImage,
    setCategory,
    setIsPublished,
    setVisibility,
    addTag,
    removeTag,
    generateExcerpt,
    getBlogData,
    reset,
  } = useBlogEditor({
    autoSave: true,
  });

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag("");
    }
  };

  const handleSave = async (publish = false) => {
    try {
      setError(null);
      setIsSaving(true);

      // Validate before publishing
      if (publish) {
        const errors = [];
        if (!title?.trim()) errors.push("Title is required");
        if (!content?.trim()) errors.push("Content is required");
        if (!category?.trim()) errors.push("Category is required");

        if (errors.length > 0) {
          setError(`Cannot publish: ${errors.join(", ")}`);
          setIsSaving(false);
          return;
        }
      }

      const blogData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        category: category.trim(),
        status: publish ? "published" : "draft",
      };

      // Only include featuredImage if it's a valid URL
      if (coverImage && coverImage.trim()) {
        try {
          new URL(coverImage.trim());
          blogData.featuredImage = coverImage.trim();
        } catch (e) {
          // Skip invalid URLs
          console.warn("Invalid featured image URL, skipping:", coverImage);
        }
      }

      console.log("Sending blog data:", blogData); // Debug log

      const createdBlog = await createBlog(blogData);

      if (publish) {
        navigate(`${ROUTES.BLOG_DETAILS}/${createdBlog.slug}`);
      } else {
        navigate(ROUTES.MY_BLOGS);
      }
    } catch (err) {
      console.error("Blog creation error:", err); // Debug log
      setError(err instanceof Error ? err.message : "Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Convert file to base64 (replace with actual upload logic)
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    category &&
    category.trim().length > 0;

  // Helper function to get category label from slug
  const getCategoryLabel = (categorySlug) => {
    return (
      BLOG_CATEGORIES.find(
        (cat) => cat.toLowerCase().replace(/\s+/g, "-") === categorySlug,
      ) || categorySlug
    );
  };

  // Prepare category options for CustomSelect
  const categoryOptions = BLOG_CATEGORIES.map((cat) => ({
    value: cat.toLowerCase().replace(/\s+/g, "-"),
    label: cat,
  }));

  // Handle category change
  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  // Get publishing checklist and stats
  const blogData = getBlogData();

  // Inline validation function
  const validateBlogForPublishing = (data) => {
    const errors = [];
    if (!data.title?.trim()) errors.push("Title is required");
    if (!data.content?.trim()) errors.push("Content is required");
    if (!data.category?.trim()) errors.push("Category is required");
    return {
      isValid: errors.length === 0,
      canPublish: errors.length === 0,
      errors,
    };
  };

  // Inline publishing checklist
  const getPublishingChecklist = (data) => {
    const checklist = [
      {
        id: "title",
        label: "Title",
        required: true,
        completed: !!data.title?.trim(),
      },
      {
        id: "content",
        label: "Content",
        required: true,
        completed: !!data.content?.trim(),
      },
      {
        id: "category",
        label: "Category",
        required: true,
        completed: !!data.category?.trim(),
      },
      {
        id: "excerpt",
        label: "Excerpt",
        required: false,
        completed: !!data.excerpt?.trim(),
      },
      {
        id: "featuredImage",
        label: "Featured Image",
        required: false,
        completed: !!data.coverImage?.trim(),
      },
      {
        id: "tags",
        label: "Tags",
        required: false,
        completed: !!(data.tags?.length > 0),
      },
    ];
    const completed = checklist.filter((item) => item.completed).length;
    return {
      checklist,
      progress: {
        percentage: Math.round((completed / checklist.length) * 100),
      },
    };
  };

  // Inline reading time estimation
  const estimateReadingTime = (text) => {
    if (!text) return 0;
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    return Math.ceil(words / 200) || 1;
  };

  const publishingChecklist = getPublishingChecklist(blogData);
  const readingTime = estimateReadingTime(content);
  const validation = validateBlogForPublishing(blogData);

  return (
    <div className="min-h-screen bg-background">
      <PageWrapper className="py-8" maxWidth="4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Create New Blog</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!isFormValid}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>

            <Button
              onClick={() => handleSave(true)}
              disabled={!validation.canPublish || isSaving}
              className={
                validation.canPublish ? "bg-green-600 hover:bg-green-700" : ""
              }
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : validation.canPublish ? (
                <Zap className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              {validation.canPublish ? "Publish Now" : "Cannot Publish Yet"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter your blog title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>

              {/* Image Upload Mode Toggle */}
              <div className="flex items-center space-x-2 mb-3">
                <Button
                  type="button"
                  variant={imageUploadMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageUploadMode("url")}
                >
                  <Link className="h-4 w-4 mr-2" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={imageUploadMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageUploadMode("upload")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              {imageUploadMode === "url" ? (
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  onPaste={(e) => {
                    e.stopPropagation();
                  }}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Image className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </Button>
                  {coverImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCoverImage("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {coverImage && (
                <div className="mt-2">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-md border"
                    onError={() => {
                      setCoverImage("");
                      setError(
                        "Failed to load image. Please check the URL or try a different image.",
                      );
                    }}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <CustomSelect
                value={category}
                onValueChange={handleCategoryChange}
                placeholder="Select a category..."
                options={categoryOptions}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-none"
                onPaste={(e) => {
                  e.stopPropagation();
                }}
              />
              <p className="text-sm text-muted-foreground">
                {content.length} characters
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Progress */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Publishing Progress</h3>
                <Badge
                  variant={validation.canPublish ? "default" : "secondary"}
                >
                  {publishingChecklist.progress.percentage}%
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    validation.canPublish ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${publishingChecklist.progress.percentage}%`,
                  }}
                ></div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {publishingChecklist.checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    {item.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={`text-sm ${item.required ? "font-medium" : ""} ${
                        item.completed
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                      {item.required && <span className="text-red-500">*</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Blog Stats */}
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reading time:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{readingTime} min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Words:</span>
                  <span>
                    {
                      content.split(/\s+/).filter((word) => word.length > 0)
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Publish Settings</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publish immediately</Label>
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              {/* Post Visibility */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Post Visibility</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="postVisibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-primary"
                    />
                    <div>
                      <div className="text-sm font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">
                        Anyone can see this post
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="postVisibility"
                      value="followers"
                      checked={visibility === "followers"}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-primary"
                    />
                    <div>
                      <div className="text-sm font-medium">Followers Only</div>
                      <div className="text-xs text-muted-foreground">
                        Only your followers can see this post
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="postVisibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-primary"
                    />
                    <div>
                      <div className="text-sm font-medium">Private</div>
                      <div className="text-xs text-muted-foreground">
                        Only you can see this post
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category Display */}
              {category && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Selected Category
                  </Label>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(category)}
                    </Badge>
                  </div>
                </div>
              )}

              {isDirty && (
                <p className="text-sm text-muted-foreground">
                  You have unsaved changes
                </p>
              )}

              {/* Validation Errors */}
              {validation.errors.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-red-600">
                    Required:
                  </Label>
                  {validation.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">
                      • {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Excerpt</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateExcerpt}
                  disabled={!content.trim()}
                >
                  Auto-generate
                </Button>
              </div>

              <Textarea
                placeholder="Brief description of your blog..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">
                {excerpt.length}/200 characters
              </p>
            </div>

            {/* Tags */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Tags</h3>

              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  maxLength={50}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="group">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <BlogPreviewModal
          blogData={getBlogData()}
          isOpen={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      </PageWrapper>
    </div>
  );
};
