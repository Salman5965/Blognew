import { PAGINATION } from "@/utils/constant";
import apiService from "./api";

class BlogService {
  async getBlogs(query = {}) {
    try {
      const params = new URLSearchParams();

      params.append("page", String(query.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(query.limit || PAGINATION.BLOG_LIMIT));

      if (query.search) params.append("search", query.search);
      if (query.author) params.append("author", query.author);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);
      if (query.isPublished !== undefined)
        params.append("isPublished", String(query.isPublished));
      if (query.sortBy) params.append("sortBy", query.sortBy);
      if (query.sortOrder) params.append("sortOrder", query.sortOrder);

      if (query.tags?.length) {
        query.tags.forEach((tag) => params.append("tags", tag));
      }

      const response = await apiService.get(`/blogs?${params}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch blogs");
    } catch (error) {
      // Handle rate limiting gracefully
      if (
        error.status === 429 ||
        error.message?.includes("Too many requests")
      ) {
        console.warn("Rate limited, returning empty data");
        return {
          blogs: [],
          pagination: {
            currentPage: query.page || 1,
            totalPages: 0,
            totalBlogs: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: query.limit || PAGINATION.BLOG_LIMIT,
          },
        };
      }

      // Handle 500 server errors gracefully
      if (error.status === 500 || error.response?.status === 500) {
        console.warn("Server error, returning empty data");
        return {
          blogs: [],
          pagination: {
            currentPage: query.page || 1,
            totalPages: 0,
            totalBlogs: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: query.limit || PAGINATION.BLOG_LIMIT,
          },
        };
      }

      // Log network errors but don't expose them to users
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("network") ||
        error.message?.includes("Failed to fetch data") ||
        error.isNetworkError ||
        error.name === "TypeError" ||
        !error.response
      ) {
        console.error("Network error fetching blogs:", error);

        // Return empty data structure when API is unavailable
        return {
          blogs: [],
          pagination: {
            currentPage: query.page || 1,
            totalPages: 0,
            totalBlogs: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: query.limit || PAGINATION.BLOG_LIMIT,
          },
        };
      }

      // Re-throw non-network errors
      throw error;
    }
  }

  async getBlogBySlug(slug) {
    try {
      const response = await apiService.get(`/blogs/${slug}`);

      if (response && response.status === "success") {
        return response.data;
      }

      // Handle response that exists but indicates failure
      throw new Error(response?.message || "Blog not found");
    } catch (error) {
      console.warn(`Error fetching blog by slug "${slug}":`, {
        message: error.message,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
        isRateLimitError: error.isRateLimitError,
        retryAfter: error.retryAfter,
      });

      // Handle rate limit errors
      if (error.isRateLimitError || error.status === 429) {
        return {
          data: null,
          status: "error",
          message:
            error.message ||
            "Too many requests. Please wait before trying again.",
          errorType: "rate_limit",
          retryAfter: error.retryAfter,
        };
      }

      // Handle network errors more gracefully
      if (error.isNetworkError || error.message?.includes("Failed to fetch")) {
        // Return a fallback response structure instead of throwing
        return {
          data: null,
          status: "error",
          message:
            "Unable to connect to server. Please check your internet connection and try again.",
          isNetworkError: true,
          errorType: "network",
        };
      }

      // Handle 404 or other API errors
      if (error.response?.status === 404) {
        return {
          data: null,
          status: "error",
          message: `Blog with slug "${slug}" not found`,
          errorType: "not_found",
        };
      }

      // Handle other API errors gracefully
      if (error.response) {
        return {
          data: null,
          status: "error",
          message:
            error.response.data?.message ||
            `Server error (${error.response.status})`,
          errorType: "api",
          statusCode: error.response.status,
        };
      }

      // Re-throw unexpected errors
      throw error;
    }
  }

  async getBlogById(id) {
    const response = await apiService.get(`/blogs/${id}`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Blog not found");
  }

  async createBlog(blogData) {
    console.log("BlogService: Creating blog with data:", blogData);

    try {
      const response = await apiService.post("/blogs", blogData);

      console.log("BlogService: Response from server:", response);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to create blog");
    } catch (error) {
      console.error("BlogService: Error creating blog:", error);

      // Handle validation errors from server
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors
            .map((err) => err.msg || err.message)
            .join(", ");
          throw new Error(`Validation failed: ${errorMessages}`);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      }

      throw error;
    }
  }

  async updateBlog(id, updateData) {
    const response = await apiService.put(`/blogs/${id}`, updateData);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to update blog");
  }

  async deleteBlog(id) {
    const response = await apiService.delete(`/blogs/${id}`);

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete blog");
    }
    return true;
  }

  async likeBlog(id) {
    const response = await apiService.post(`/blogs/${id}/like`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to toggle like");
  }

  async unlikeBlog(id) {
    // Both like and unlike use the same endpoint (toggle)
    const response = await apiService.post(`/blogs/${id}/like`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to toggle like");
  }

  async incrementViewCount(id) {
    try {
      await apiService.post(`/blogs/${id}/view`);
    } catch (error) {
      // View count increment is not critical
      console.warn("Failed to increment view count:", error);
    }
  }

  async getUserBlogs(userId, query = {}) {
    const params = new URLSearchParams();

    params.append("page", String(query.page || PAGINATION.DEFAULT_PAGE));
    params.append("limit", String(query.limit || PAGINATION.BLOG_LIMIT));

    if (query.search) params.append("search", query.search);
    if (query.category) params.append("category", query.category);
    if (query.status) params.append("status", query.status);
    if (query.isPublished !== undefined)
      params.append("isPublished", String(query.isPublished));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);

    if (query.tags?.length) {
      query.tags.forEach((tag) => params.append("tags", tag));
    }

    const endpoint = userId ? `/blogs/user/${userId}` : "/blogs/my";
    const response = await apiService.get(`${endpoint}?${params}`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to fetch user blogs");
  }

  async getTags() {
    try {
      const response = await apiService.get("/blogs/tags");

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch tags");
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await apiService.get("/blogs/categories");

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch categories");
    } catch (error) {
      // If endpoint doesn't exist, return common categories
      console.warn(
        "Categories endpoint not available, returning default categories",
      );
      return [
        "Technology",
        "Programming",
        "Web Development",
        "Design",
        "Tutorial",
      ];
    }
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiService.post("/blogs/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === "success") {
      return response.data.url;
    }

    throw new Error(response.message || "Failed to upload image");
  }

  // Additional methods for blog management

  async publishBlog(id) {
    const response = await apiService.put(`/blogs/${id}/publish`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to publish blog");
  }

  async unpublishBlog(id) {
    const response = await apiService.put(`/blogs/${id}/unpublish`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to unpublish blog");
  }

  async getDraftBlogs(query = {}) {
    return this.getBlogs({ ...query, status: "draft" });
  }

  async getPublishedBlogs(query = {}) {
    return this.getBlogs({ ...query, status: "published" });
  }

  // Method to get blogs for the current user
  async getMyBlogs(query = {}) {
    const params = new URLSearchParams();

    params.append("page", String(query.page || PAGINATION.DEFAULT_PAGE));
    params.append("limit", String(query.limit || PAGINATION.BLOG_LIMIT));

    if (query.search) params.append("search", query.search);
    if (query.status) params.append("status", query.status);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);

    try {
      const response = await apiService.get(`/blogs/my-blogs?${params}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch my blogs");
    } catch (error) {
      // If /blogs/my-blogs endpoint doesn't exist, fall back to using author filter
      console.warn("My blogs endpoint not available, using author filter");

      // Get current user to use as author filter
      try {
        const userResponse = await apiService.get("/auth/profile");
        if (userResponse.status === "success") {
          const userId = userResponse.data.user._id;
          return this.getBlogs({ ...query, author: userId });
        }
      } catch (userError) {
        console.error("Failed to get current user for author filter");
      }

      throw error;
    }
  }
}

export const blogService = new BlogService();
export default blogService;
