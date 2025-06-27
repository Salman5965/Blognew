import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { blogService } from "@/services/blogService";
import { PAGINATION } from "@/utils/constant";

const initialFilters = {
  search: "",
  tags: [],
  author: undefined,
};

const initialPagination = {
  page: PAGINATION.DEFAULT_PAGE,
  limit: PAGINATION.BLOG_LIMIT,
  total: 0,
  totalPages: 0,
};

export const useBlogStore = create(
  devtools(
    (set, get) => ({
      blogs: [],
      currentBlog: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: initialPagination,

      getBlogs: async (query) => {
        try {
          set({ isLoading: true, error: null });
          const { filters, pagination } = get();

          const mergedQuery = {
            ...query,
            page: query?.page || pagination.page,
            limit: query?.limit || pagination.limit,
            search: query?.search !== undefined ? query.search : filters.search,
            tags: query?.tags || filters.tags,
            author: query?.author || filters.author,
          };

          const response = await blogService.getBlogs(mergedQuery);

          // Handle different response structures
          let blogs = [];
          let paginationData = initialPagination;

          if (response) {
            // Handle case where response.data exists
            if (response.data) {
              blogs = Array.isArray(response.data)
                ? response.data
                : response.data.blogs
                  ? response.data.blogs
                  : [];
              paginationData =
                response.data.pagination ||
                response.pagination ||
                initialPagination;
            }
            // Handle case where response.blogs exists
            else if (response.blogs) {
              blogs = Array.isArray(response.blogs) ? response.blogs : [];
              paginationData = response.pagination || initialPagination;
            }
            // Handle case where response is array directly
            else if (Array.isArray(response)) {
              blogs = response;
            }
            // Handle case where response has the data directly
            else {
              blogs = response.blogs || [];
              paginationData = response.pagination || initialPagination;
            }
          }

          set({
            blogs: blogs,
            pagination: {
              ...initialPagination,
              ...paginationData,
              page: mergedQuery.page,
              limit: mergedQuery.limit,
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching blogs:", error);

          // Don't show network errors to users, just log them
          const errorMessage =
            error?.message?.includes("fetch") ||
            error?.message?.includes("network") ||
            error?.message?.includes("Failed to fetch")
              ? null // Don't set error for network issues
              : error instanceof Error
                ? error.message
                : "Failed to fetch blogs";

          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      getBlogBySlug: async (slug) => {
        try {
          set({ isLoading: true, error: null });
          const response = await blogService.getBlogBySlug(slug);

          let blog = null;
          if (response?.data) {
            blog = response.data;
          } else if (response?.blog) {
            blog = response.blog;
          } else {
            blog = response;
          }

          if (blog) {
            // Increment view count
            try {
              await blogService.incrementViewCount(blog._id || blog.id);
            } catch (viewError) {
              console.warn("Failed to increment view count:", viewError);
            }
          }

          set({
            currentBlog: blog,
            isLoading: false,
          });
          return blog;
        } catch (error) {
          console.error("Error fetching blog by slug:", error);
          set({
            error: error instanceof Error ? error.message : "Blog not found",
            isLoading: false,
            currentBlog: null,
          });
          throw error;
        }
      },

      getBlogById: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const response = await blogService.getBlogById(id);

          let blog = null;
          if (response?.data) {
            blog = response.data;
          } else if (response?.blog) {
            blog = response.blog;
          } else {
            blog = response;
          }

          set({
            currentBlog: blog,
            isLoading: false,
          });
          return blog;
        } catch (error) {
          console.error("Error fetching blog by ID:", error);
          set({
            error: error instanceof Error ? error.message : "Blog not found",
            isLoading: false,
            currentBlog: null,
          });
          throw error;
        }
      },

      createBlog: async (blogData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await blogService.createBlog(blogData);

          let blog = null;
          if (response?.data) {
            blog = response.data.blog || response.data;
          } else {
            blog = response;
          }

          if (blog) {
            const { blogs } = get();
            set({
              blogs: [blog, ...blogs],
              currentBlog: blog,
              isLoading: false,
            });
          }

          return blog;
        } catch (error) {
          console.error("Error creating blog:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to create blog",
            isLoading: false,
          });
          throw error;
        }
      },

      updateBlog: async (id, blogData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await blogService.updateBlog(id, blogData);

          let updatedBlog = null;
          if (response?.data) {
            updatedBlog = response.data.blog || response.data;
          } else {
            updatedBlog = response;
          }

          if (updatedBlog) {
            const { blogs, currentBlog } = get();
            const updatedBlogs = blogs.map((blog) =>
              (blog._id || blog.id) === (updatedBlog._id || updatedBlog.id)
                ? updatedBlog
                : blog,
            );
            set({
              blogs: updatedBlogs,
              currentBlog:
                currentBlog?.id === updatedBlog.id ? updatedBlog : currentBlog,
              isLoading: false,
            });
          }

          return updatedBlog;
        } catch (error) {
          console.error("Error updating blog:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to update blog",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteBlog: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await blogService.deleteBlog(id);
          const { blogs, currentBlog } = get();
          const filteredBlogs = blogs.filter(
            (blog) => (blog._id || blog.id) !== id,
          );
          set({
            blogs: filteredBlogs,
            currentBlog:
              currentBlog && (currentBlog._id || currentBlog.id) === id
                ? null
                : currentBlog,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error deleting blog:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete blog",
            isLoading: false,
          });
          throw error;
        }
      },

      likeBlog: async (id) => {
        try {
          const result = await blogService.likeBlog(id);
          const { blogs, currentBlog } = get();

          // Update based on server response
          const isLiked = result.isLiked;
          const likeCount = result.likeCount;

          const updatedBlogs = blogs.map((blog) =>
            (blog._id || blog.id) === id
              ? { ...blog, likeCount, isLiked }
              : blog,
          );

          set({
            blogs: updatedBlogs,
            currentBlog:
              currentBlog && (currentBlog._id || currentBlog.id) === id
                ? {
                    ...currentBlog,
                    likeCount,
                    isLiked,
                  }
                : currentBlog,
          });

          return result;
        } catch (error) {
          console.error("Error liking blog:", error);
          throw error;
        }
      },

      unlikeBlog: async (id) => {
        try {
          const result = await blogService.unlikeBlog(id);
          const { blogs, currentBlog } = get();

          // Update based on server response
          const isLiked = result.isLiked;
          const likeCount = result.likeCount;

          const updatedBlogs = blogs.map((blog) =>
            (blog._id || blog.id) === id
              ? { ...blog, likeCount, isLiked }
              : blog,
          );

          set({
            blogs: updatedBlogs,
            currentBlog:
              currentBlog && (currentBlog._id || currentBlog.id) === id
                ? {
                    ...currentBlog,
                    likeCount,
                    isLiked,
                  }
                : currentBlog,
          });

          return result;
        } catch (error) {
          console.error("Error unliking blog:", error);
          throw error;
        }
      },

      getUserBlogs: async (userId, query) => {
        try {
          set({ isLoading: true, error: null });
          const { pagination } = get();
          const mergedQuery = {
            ...query,
            page: query?.page || pagination.page,
            limit: query?.limit || pagination.limit,
          };
          const response = await blogService.getUserBlogs(userId, mergedQuery);

          let blogs = [];
          let paginationData = initialPagination;

          if (response?.data) {
            blogs = Array.isArray(response.data)
              ? response.data
              : response.data.blogs
                ? response.data.blogs
                : [];
            paginationData =
              response.data.pagination ||
              response.pagination ||
              initialPagination;
          } else {
            blogs = response?.blogs || [];
            paginationData = response?.pagination || initialPagination;
          }

          set({
            blogs: blogs,
            pagination: {
              ...initialPagination,
              ...paginationData,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching user blogs:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch user blogs",
            isLoading: false,
          });
        }
      },

      setCurrentBlog: (blog) => {
        set({ currentBlog: blog });
      },

      updateFilters: (newFilters) => {
        const { filters } = get();
        set({
          filters: { ...filters, ...newFilters },
          pagination: { ...get().pagination, page: 1 },
        });
      },

      resetFilters: () => {
        set({
          filters: initialFilters,
          pagination: { ...get().pagination, page: 1 },
        });
      },

      setPage: (page) => {
        set({
          pagination: { ...get().pagination, page },
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "blog-store",
    },
  ),
);
