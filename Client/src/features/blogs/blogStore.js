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
      // Cache management
      lastFetchTime: null,
      cacheTimeout: 2 * 60 * 1000, // 2 minutes cache

      getBlogs: async (query, forceRefresh = false) => {
        try {
          const { filters, pagination, lastFetchTime, cacheTimeout, blogs } =
            get();

          // Check if we have recent cached data
          const now = Date.now();
          const isCacheValid =
            lastFetchTime &&
            now - lastFetchTime < cacheTimeout &&
            !forceRefresh &&
            blogs.length > 0;

          if (isCacheValid) {
            console.log("Using cached blog data");
            return;
          }

          set({ isLoading: true, error: null });

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
          let blogList = [];
          let paginationData = initialPagination;

          if (response) {
            // Handle case where response.data exists
            if (response.data) {
              blogList = Array.isArray(response.data)
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
              blogList = Array.isArray(response.blogs) ? response.blogs : [];
              paginationData = response.pagination || initialPagination;
            }
            // Handle case where response is array directly
            else if (Array.isArray(response)) {
              blogList = response;
            }
            // Handle case where response has the data directly
            else {
              blogList = response.blogs || [];
              paginationData = response.pagination || initialPagination;
            }
          }

          set({
            blogs: blogList,
            pagination: {
              ...initialPagination,
              ...paginationData,
              page: mergedQuery.page,
              limit: mergedQuery.limit,
            },
            isLoading: false,
            error: null,
            lastFetchTime: Date.now(),
          });
        } catch (error) {
          console.error("Error fetching blogs:", error);

          // Don't show network errors to users, just log them
          const errorMessage =
            error?.status === 429
              ? null // Don't show rate limit errors
              : error?.message?.includes("fetch") ||
                  error?.message?.includes("network") ||
                  error?.message?.includes("Failed to fetch") ||
                  error?.message?.includes("Too many requests")
                ? null // Don't set error for network issues or rate limits
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
          } else if (response && typeof response === "object") {
            blog = response;
          }

          set({
            currentBlog: blog,
            isLoading: false,
            error: null,
          });

          // Increment view count in background
          if (blog) {
            try {
              await blogService.incrementViewCount(blog._id || blog.id);
            } catch (viewError) {
              console.warn("Failed to increment view count:", viewError);
            }
          }

          return blog;
        } catch (error) {
          console.error("Error fetching blog by slug:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch blog";
          set({
            currentBlog: null,
            error: errorMessage,
            isLoading: false,
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
          } else if (response && typeof response === "object") {
            blog = response;
          }

          set({
            currentBlog: blog,
            isLoading: false,
            error: null,
          });

          return blog;
        } catch (error) {
          console.error("Error fetching blog by ID:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch blog";
          set({
            currentBlog: null,
            error: errorMessage,
            isLoading: false,
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
            blog = response.data;
          } else if (response?.blog) {
            blog = response.blog;
          } else if (response && typeof response === "object") {
            blog = response;
          }

          if (blog) {
            const { blogs } = get();
            set({
              blogs: [blog, ...blogs],
              currentBlog: blog,
              isLoading: false,
              error: null,
              lastFetchTime: null, // Invalidate cache
            });
          }

          return blog;
        } catch (error) {
          console.error("Error creating blog:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create blog";
          set({
            error: errorMessage,
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
            updatedBlog = response.data;
          } else if (response?.blog) {
            updatedBlog = response.blog;
          } else if (response && typeof response === "object") {
            updatedBlog = response;
          }

          if (updatedBlog) {
            const { blogs } = get();
            const updatedBlogs = blogs.map((blog) =>
              (blog._id || blog.id) === id ? updatedBlog : blog,
            );

            set({
              blogs: updatedBlogs,
              currentBlog: updatedBlog,
              isLoading: false,
              error: null,
              lastFetchTime: null, // Invalidate cache
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
            error: null,
            lastFetchTime: null, // Invalidate cache
          });
        } catch (error) {
          console.error("Error deleting blog:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete blog";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      likeBlog: async (id) => {
        try {
          const { blogs, currentBlog } = get();

          // Optimistic update
          const updatedBlogs = blogs.map((blog) => {
            if ((blog._id || blog.id) === id) {
              return {
                ...blog,
                isLiked: true,
                likesCount: (blog.likesCount || 0) + 1,
              };
            }
            return blog;
          });

          set({ blogs: updatedBlogs });

          if (currentBlog && (currentBlog._id || currentBlog.id) === id) {
            set({
              currentBlog: {
                ...currentBlog,
                isLiked: true,
                likesCount: (currentBlog.likesCount || 0) + 1,
              },
            });
          }

          const result = await blogService.likeBlog(id);
          return result;
        } catch (error) {
          console.error("Error liking blog:", error);

          // Revert optimistic update on error
          const { blogs, currentBlog } = get();
          const revertedBlogs = blogs.map((blog) => {
            if ((blog._id || blog.id) === id) {
              return {
                ...blog,
                isLiked: false,
                likesCount: Math.max((blog.likesCount || 1) - 1, 0),
              };
            }
            return blog;
          });

          set({ blogs: revertedBlogs });

          if (currentBlog && (currentBlog._id || currentBlog.id) === id) {
            set({
              currentBlog: {
                ...currentBlog,
                isLiked: false,
                likesCount: Math.max((currentBlog.likesCount || 1) - 1, 0),
              },
            });
          }

          throw error;
        }
      },

      unlikeBlog: async (id) => {
        try {
          const { blogs, currentBlog } = get();

          // Optimistic update
          const updatedBlogs = blogs.map((blog) => {
            if ((blog._id || blog.id) === id) {
              return {
                ...blog,
                isLiked: false,
                likesCount: Math.max((blog.likesCount || 1) - 1, 0),
              };
            }
            return blog;
          });

          set({ blogs: updatedBlogs });

          if (currentBlog && (currentBlog._id || currentBlog.id) === id) {
            set({
              currentBlog: {
                ...currentBlog,
                isLiked: false,
                likesCount: Math.max((currentBlog.likesCount || 1) - 1, 0),
              },
            });
          }

          const result = await blogService.unlikeBlog(id);
          return result;
        } catch (error) {
          console.error("Error unliking blog:", error);

          // Revert optimistic update on error
          const { blogs, currentBlog } = get();
          const revertedBlogs = blogs.map((blog) => {
            if ((blog._id || blog.id) === id) {
              return {
                ...blog,
                isLiked: true,
                likesCount: (blog.likesCount || 0) + 1,
              };
            }
            return blog;
          });

          set({ blogs: revertedBlogs });

          if (currentBlog && (currentBlog._id || currentBlog.id) === id) {
            set({
              currentBlog: {
                ...currentBlog,
                isLiked: true,
                likesCount: (currentBlog.likesCount || 0) + 1,
              },
            });
          }

          throw error;
        }
      },

      getUserBlogs: async (userId, page = 1, limit = 10) => {
        try {
          set({ isLoading: true, error: null });
          const response = await blogService.getUserBlogs(userId, page, limit);

          let userBlogs = [];
          let paginationData = initialPagination;

          if (response?.data) {
            userBlogs = Array.isArray(response.data)
              ? response.data
              : response.data.blogs || [];
            paginationData = response.data.pagination || initialPagination;
          } else if (response?.blogs) {
            userBlogs = response.blogs;
            paginationData = response.pagination || initialPagination;
          } else if (Array.isArray(response)) {
            userBlogs = response;
          }

          set({
            blogs: userBlogs,
            pagination: {
              ...initialPagination,
              ...paginationData,
              page,
              limit,
            },
            isLoading: false,
            error: null,
          });

          return userBlogs;
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
          lastFetchTime: null, // Invalidate cache when filters change
        });
      },

      resetFilters: () => {
        set({
          filters: initialFilters,
          pagination: { ...get().pagination, page: 1 },
          lastFetchTime: null, // Invalidate cache
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

      refreshBlogs: async (forceRefresh = true) => {
        // Refresh the current blogs list to ensure all like states are up to date
        const { pagination, filters } = get();
        await get().getBlogs(
          {
            page: pagination.page,
            limit: pagination.limit,
            ...filters,
          },
          forceRefresh,
        );
      },
    }),
    {
      name: "blog-store",
    },
  ),
);
