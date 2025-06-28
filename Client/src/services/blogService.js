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

        // Return mock data structure with sample blogs for better UX
        const mockBlogs = this.generateMockBlogs();
        return {
          blogs: mockBlogs,
          pagination: {
            currentPage: query.page || 1,
            totalPages: 1,
            totalBlogs: mockBlogs.length,
            hasNextPage: false,
            hasPrevPage: false,
            limit: query.limit || PAGINATION.BLOG_LIMIT,
          },
          isOffline: true, // Flag to indicate this is offline data
        };
      }

      // Re-throw non-network errors
      throw error;
    }
  }

  async getBlogBySlug(slug) {
    const response = await apiService.get(`/blogs/${slug}`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error(response.message || "Blog not found");
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
      // If endpoint doesn't exist, return common tags
      console.warn("Tags endpoint not available, returning default tags");
      return [
        "React",
        "JavaScript",
        "Node.js",
        "CSS",
        "TypeScript",
        "API",
        "Performance",
        "Tutorial",
      ];
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

  // Generate mock blogs for offline/error scenarios
  generateMockBlogs() {
    const mockBlogs = [
      {
        _id: "mock-1",
        id: "mock-1",
        title: "Welcome to BlogHub",
        excerpt:
          "Discover amazing stories and connect with passionate writers from around the world.",
        content:
          "Welcome to our blogging platform! Here you can read, write, and share stories that matter...",
        slug: "welcome-to-bloghub",
        coverImage: "/placeholder.svg",
        tags: ["welcome", "blogging"],
        status: "published",
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        views: 125,
        viewCount: 125,
        likesCount: 24,
        likeCount: 24,
        likes: [],
        commentsCount: 8,
        commentCount: 8,
        comments: [],
        isLiked: false,
        author: {
          _id: "mock-author-1",
          id: "mock-author-1",
          username: "bloghub_team",
          firstName: "BlogHub",
          lastName: "Team",
          avatar: "/placeholder.svg",
        },
      },
      {
        _id: "mock-2",
        id: "mock-2",
        title: "Getting Started with Writing",
        excerpt:
          "Tips and tricks for new writers to create engaging content and build an audience.",
        content:
          "Writing is a journey of discovery. Every great writer started with a single word...",
        slug: "getting-started-with-writing",
        coverImage: "/placeholder.svg",
        tags: ["writing", "tips", "beginners"],
        status: "published",
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        views: 89,
        viewCount: 89,
        likesCount: 15,
        likeCount: 15,
        likes: [],
        commentsCount: 5,
        commentCount: 5,
        comments: [],
        isLiked: false,
        author: {
          _id: "mock-author-2",
          id: "mock-author-2",
          username: "writing_guru",
          firstName: "Sarah",
          lastName: "Johnson",
          avatar: "/placeholder.svg",
        },
      },
      {
        _id: "mock-3",
        id: "mock-3",
        title: "The Future of Digital Storytelling",
        excerpt:
          "Exploring how technology is changing the way we tell and consume stories.",
        content:
          "Digital storytelling has evolved beyond traditional formats...",
        slug: "future-of-digital-storytelling",
        coverImage: "/placeholder.svg",
        tags: ["technology", "storytelling", "future"],
        status: "published",
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        views: 156,
        viewCount: 156,
        likesCount: 32,
        likeCount: 32,
        likes: [],
        commentsCount: 12,
        commentCount: 12,
        comments: [],
        isLiked: false,
        author: {
          _id: "mock-author-3",
          id: "mock-author-3",
          username: "tech_storyteller",
          firstName: "Alex",
          lastName: "Chen",
          avatar: "/placeholder.svg",
        },
      },
    ];

    return mockBlogs;
  }
}

export const blogService = new BlogService();
export default blogService;
