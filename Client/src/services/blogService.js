// import { PAGINATION } from "@/utils/constant";
// import apiService from "./api";

// class BlogService {
//   async getBlogs(query = {}) {
//     try {
//       const params = new URLSearchParams();

//       params.append("page", String(query.page || PAGINATION.DEFAULT_PAGE));
//       params.append("limit", String(query.limit || PAGINATION.BLOG_LIMIT));

//       if (query.search) params.append("search", query.search);
//       if (query.author) params.append("author", query.author);
//       if (query.category) params.append("category", query.category);
//       if (query.status) params.append("status", query.status);
//       if (query.isPublished !== undefined)
//         params.append("isPublished", String(query.isPublished));
//       if (query.sortBy) params.append("sortBy", query.sortBy);
//       if (query.sortOrder) params.append("sortOrder", query.sortOrder);

//       if (query.tags?.length) {
//         query.tags.forEach((tag) => params.append("tags", tag));
//       }

//       const response = await apiService.get(`/blogs?${params}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch blogs");
//     } catch (error) {
//       // Log network errors but don't expose them to users
//       if (
//         error.message?.includes("fetch") ||
//         error.message?.includes("network") ||
//         error.name === "TypeError"
//       ) {
//         console.error("Network error fetching blogs:", error);

//         // Return empty data structure instead of throwing
//         return {
//           blogs: [],
//           pagination: {
//             currentPage: query.page || 1,
//             totalPages: 0,
//             totalBlogs: 0,
//             hasNextPage: false,
//             hasPrevPage: false,
//             limit: query.limit || PAGINATION.BLOG_LIMIT,
//           },
//         };
//       }

//       // Re-throw non-network errors
//       throw error;
//     }
//   }

//   async getBlogBySlug(slug) {
//     const response = await apiService.get(`/blogs/slug/${slug}`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Blog not found");
//   }

//   async getBlogById(id) {
//     const response = await apiService.get(`/blogs/${id}`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Blog not found");
//   }

//   async createBlog(blogData) {
//     const response = await apiService.post("/blogs", blogData);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to create blog");
//   }

//   async updateBlog(id, updateData) {
//     const response = await apiService.put(`/blogs/${id}`, updateData);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to update blog");
//   }

//   async deleteBlog(id) {
//     const response = await apiService.delete(`/blogs/${id}`);

//     if (response.status !== "success") {
//       throw new Error(response.message || "Failed to delete blog");
//     }
//     return true;
//   }

//   async likeBlog(id) {
//     const response = await apiService.post(`/blogs/${id}/like`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to like blog");
//   }

//   async unlikeBlog(id) {
//     const response = await apiService.delete(`/blogs/${id}/like`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to unlike blog");
//   }

//   async incrementViewCount(id) {
//     try {
//       await apiService.post(`/blogs/${id}/view`);
//     } catch (error) {
//       // View count increment is not critical
//       console.warn("Failed to increment view count:", error);
//     }
//   }

//   async getUserBlogs(userId, query = {}) {
//     const params = new URLSearchParams();

//     params.append("page", String(query.page || PAGINATION.DEFAULT_PAGE));
//     params.append("limit", String(query.limit || PAGINATION.BLOG_LIMIT));

//     if (query.search) params.append("search", query.search);
//     if (query.category) params.append("category", query.category);
//     if (query.status) params.append("status", query.status);
//     if (query.isPublished !== undefined)
//       params.append("isPublished", String(query.isPublished));
//     if (query.sortBy) params.append("sortBy", query.sortBy);
//     if (query.sortOrder) params.append("sortOrder", query.sortOrder);

//     if (query.tags?.length) {
//       query.tags.forEach((tag) => params.append("tags", tag));
//     }

//     const endpoint = userId ? `/blogs/user/${userId}` : "/blogs/my";
//     const response = await apiService.get(`${endpoint}?${params}`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to fetch user blogs");
//   }

//   async getTags() {
//     try {
//       const response = await apiService.get("/blogs/tags");

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch tags");
//     } catch (error) {
//       // If endpoint doesn't exist, return common tags
//       console.warn("Tags endpoint not available, returning default tags");
//       return [
//         "React",
//         "JavaScript",
//         "Node.js",
//         "CSS",
//         "TypeScript",
//         "API",
//         "Performance",
//         "Tutorial",
//       ];
//     }
//   }

//   async getCategories() {
//     try {
//       const response = await apiService.get("/blogs/categories");

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch categories");
//     } catch (error) {
//       // If endpoint doesn't exist, return common categories
//       console.warn(
//         "Categories endpoint not available, returning default categories",
//       );
//       return [
//         "Technology",
//         "Programming",
//         "Web Development",
//         "Design",
//         "Tutorial",
//       ];
//     }
//   }

//   async uploadImage(file) {
//     const formData = new FormData();
//     formData.append("image", file);

//     const response = await apiService.post("/blogs/upload-image", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     if (response.status === "success") {
//       return response.data.url;
//     }

//     throw new Error(response.message || "Failed to upload image");
//   }

//   // Additional methods for blog management

//   async publishBlog(id) {
//     const response = await apiService.put(`/blogs/${id}/publish`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to publish blog");
//   }

//   async unpublishBlog(id) {
//     const response = await apiService.put(`/blogs/${id}/unpublish`);

//     if (response.status === "success") {
//       return response.data;
//     }

//     throw new Error(response.message || "Failed to unpublish blog");
//   }

//   async getDraftBlogs(query = {}) {
//     return this.getBlogs({ ...query, status: "draft" });
//   }

//   async getPublishedBlogs(query = {}) {
//     return this.getBlogs({ ...query, status: "published" });
//   }

//   // Method to get blogs for the current user
//   async getMyBlogs(query = {}) {
//     const params = new URLSearchParams();

//     params.append("page", String(query.page || PAGINATION.DEFAULT_PAGE));
//     params.append("limit", String(query.limit || PAGINATION.BLOG_LIMIT));

//     if (query.search) params.append("search", query.search);
//     if (query.status) params.append("status", query.status);
//     if (query.sortBy) params.append("sortBy", query.sortBy);
//     if (query.sortOrder) params.append("sortOrder", query.sortOrder);

//     try {
//       const response = await apiService.get(`/blogs/my-blogs?${params}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch my blogs");
//     } catch (error) {
//       // If /blogs/my-blogs endpoint doesn't exist, fall back to using author filter
//       console.warn("My blogs endpoint not available, using author filter");

//       // Get current user to use as author filter
//       try {
//         const userResponse = await apiService.get("/auth/profile");
//         if (userResponse.status === "success") {
//           const userId = userResponse.data.user._id;
//           return this.getBlogs({ ...query, author: userId });
//         }
//       } catch (userError) {
//         console.error("Failed to get current user for author filter");
//       }

//       throw error;
//     }
//   }
// }

// export const blogService = new BlogService();
// export default blogService;

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
        console.warn("Rate limited, using mock data fallback");
        return {
          status: "success",
          data: this.getMockBlogs(),
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalBlogs: 3,
            hasNextPage: false,
            hasPrevPage: false,
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
    const response = await apiService.post("/blogs", blogData);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Failed to create blog");
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

  // Mock blogs for fallback when API is unavailable or rate limited
  getMockBlogs() {
    return [
      {
        _id: "1",
        title: "Getting Started with React Development",
        content:
          "Learn the fundamentals of React including components, state, and props...",
        excerpt: "A comprehensive guide to starting your React journey",
        author: {
          _id: "author1",
          username: "developer",
          firstName: "John",
          lastName: "Doe",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        },
        tags: ["react", "javascript", "frontend", "tutorial"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: "published",
        likesCount: 42,
        commentsCount: 8,
        viewsCount: 156,
        isLiked: false,
        slug: "getting-started-with-react",
      },
      {
        _id: "2",
        title: "Advanced Node.js Patterns and Best Practices",
        content:
          "Explore advanced patterns in Node.js development including async patterns, error handling...",
        excerpt: "Deep dive into professional Node.js development techniques",
        author: {
          _id: "author2",
          username: "backend_dev",
          firstName: "Jane",
          lastName: "Smith",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        },
        tags: ["nodejs", "backend", "javascript", "performance"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        status: "published",
        likesCount: 28,
        commentsCount: 5,
        viewsCount: 89,
        isLiked: false,
        slug: "advanced-nodejs-patterns",
      },
      {
        _id: "3",
        title: "Building Modern UIs with Tailwind CSS",
        content:
          "Discover how to create beautiful, responsive UIs with Tailwind CSS utility classes...",
        excerpt: "Master modern CSS with the utility-first approach",
        author: {
          _id: "author3",
          username: "ui_designer",
          firstName: "Alex",
          lastName: "Johnson",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        },
        tags: ["css", "tailwind", "design", "frontend", "ui"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        status: "published",
        likesCount: 67,
        commentsCount: 12,
        viewsCount: 234,
        isLiked: true,
        slug: "building-modern-uis-with-tailwind-css",
      },
    ];
  }
}

export const blogService = new BlogService();
export default blogService;
