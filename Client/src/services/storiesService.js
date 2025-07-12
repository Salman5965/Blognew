import { apiService } from "./api";

class StoriesService {
  // Get all stories with optional filters
  async getStories(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.page) {
        params.append("page", filters.page);
      }
      if (filters.limit) {
        params.append("limit", filters.limit);
      }
<<<<<<< HEAD

      const response = await apiService.get(`/stories?${params}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      // Return fallback data for better UX
      return {
        stories: [
          {
            id: "1",
            title: "Finding My Voice After Years of Silence",
            excerpt:
              "Growing up in a household where children were seen but not heard, I struggled for years to find my voice. This is the story of how I learned to speak up for myself and others.",
            content: "Full story content here...",
            author: {
              id: "user1",
              name: "Sarah Mitchell",
              avatar: "/api/placeholder/40/40",
              isVerified: true,
            },
            coverImage: "/api/placeholder/400/300",
            audioUrl: null,
            location: "Seattle, WA",
            likes: 234,
            comments: 45,
            readTime: 8,
            isLiked: false,
            isFeatured: true,
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            title: "The Day I Decided to Change Everything",
            excerpt:
              "At 45, I realized I was living someone else's dream. Here's how I found the courage to start over and build the life I actually wanted.",
            content: "Full story content here...",
            author: {
              id: "user2",
              name: "Michael Chen",
              avatar: "/api/placeholder/40/40",
              isVerified: false,
            },
            coverImage: "/api/placeholder/400/300",
            audioUrl: "/audio/story2.mp3",
            location: "Portland, OR",
            likes: 189,
            comments: 32,
            readTime: 12,
            isLiked: true,
            isFeatured: false,
            createdAt: "2024-01-14T15:45:00Z",
            updatedAt: "2024-01-14T15:45:00Z",
          },
          {
            id: "3",
            title: "Learning to Love Myself Through Chronic Illness",
            excerpt:
              "When I was diagnosed with an autoimmune condition, I thought my life was over. Instead, it became the beginning of truly learning to care for myself.",
            content: "Full story content here...",
            author: {
              id: "user3",
              name: "Elena Rodriguez",
              avatar: "/api/placeholder/40/40",
              isVerified: true,
            },
            coverImage: "/api/placeholder/400/300",
            audioUrl: null,
            location: "Austin, TX",
            likes: 312,
            comments: 78,
            readTime: 15,
            isLiked: false,
            isFeatured: true,
            createdAt: "2024-01-13T09:20:00Z",
            updatedAt: "2024-01-13T09:20:00Z",
          },
          {
            id: "4",
            title: "From Homeless to Harvard: My Unlikely Journey",
            excerpt:
              "Living in my car at 19 with nothing but determination, I never imagined I'd one day walk across Harvard's graduation stage.",
            content: "Full story content here...",
            author: {
              id: "user4",
              name: "David Thompson",
              avatar: "/api/placeholder/40/40",
              isVerified: true,
            },
            coverImage: "/api/placeholder/400/300",
            audioUrl: "/audio/story4.mp3",
            location: "Boston, MA",
            likes: 567,
            comments: 124,
            readTime: 20,
            isLiked: false,
            isFeatured: false,
            createdAt: "2024-01-12T14:15:00Z",
            updatedAt: "2024-01-12T14:15:00Z",
          },
          {
            id: "5",
            title: "The Letter I Never Sent to My Estranged Father",
            excerpt:
              "After 15 years of silence, I finally wrote the letter I always wanted to send. I never mailed it, but writing it changed everything.",
            content: "Full story content here...",
            author: {
              id: "user5",
              name: "Jessica Park",
              avatar: "/api/placeholder/40/40",
              isVerified: false,
            },
            coverImage: "/api/placeholder/400/300",
            audioUrl: null,
            location: "Denver, CO",
            likes: 445,
            comments: 89,
            readTime: 6,
            isLiked: true,
            isFeatured: false,
            createdAt: "2024-01-11T11:30:00Z",
            updatedAt: "2024-01-11T11:30:00Z",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalStories: 47,
          hasNext: true,
          hasPrev: false,
=======
      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.tag) {
        params.append("tag", filters.tag);
      }
      if (filters.sort) {
        params.append("sort", filters.sort);
      }

      const response = await apiService.get(`/stories?${params}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch stories");
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      // Return empty data structure instead of mock data
      return {
        stories: [],
        pagination: {
          currentPage: filters.page || 1,
          totalPages: 0,
          totalStories: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: filters.limit || 10,
>>>>>>> origin/main
        },
      };
    }
  }

<<<<<<< HEAD
  // Get featured stories
  async getFeaturedStories() {
    try {
      const response = await apiService.get("/stories/featured");
      return response;
    } catch (error) {
      console.error("Failed to fetch featured stories:", error);
      // Return fallback data
      const allStories = await this.getStories();
      return {
        stories: allStories.stories.filter((story) => story.isFeatured),
=======
  // Get popular stories
  async getPopularStories(limit = 10) {
    try {
      const response = await apiService.get(`/stories/popular?limit=${limit}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch popular stories");
    } catch (error) {
      console.error("Failed to fetch popular stories:", error);
      return {
        stories: [],
>>>>>>> origin/main
      };
    }
  }

<<<<<<< HEAD
  // Get a single story by ID
  async getStoryById(storyId) {
    try {
      const response = await apiService.get(`/stories/${storyId}`);
      return response;
=======
  // Get featured stories (alias for popular stories for now)
  async getFeaturedStories(limit = 10) {
    try {
      // For now, use popular stories as featured stories
      // This could be a separate endpoint in the future
      const response = await apiService.get(`/stories/popular?limit=${limit}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch featured stories");
    } catch (error) {
      console.error("Failed to fetch featured stories:", error);
      return {
        stories: [],
      };
    }
  }

  // Get my stories
  async getMyStories(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.page) {
        params.append("page", filters.page);
      }
      if (filters.limit) {
        params.append("limit", filters.limit);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await apiService.get(`/stories/my-stories?${params}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch my stories");
    } catch (error) {
      console.error("Failed to fetch my stories:", error);
      return {
        stories: [],
        pagination: {
          currentPage: filters.page || 1,
          totalPages: 0,
          totalStories: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: filters.limit || 10,
        },
      };
    }
  }

  // Get single story by ID
  async getStoryById(storyId) {
    try {
      const response = await apiService.get(`/stories/${storyId}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch story");
>>>>>>> origin/main
    } catch (error) {
      console.error("Failed to fetch story:", error);
      throw error;
    }
  }

  // Create a new story
  async createStory(storyData) {
    try {
<<<<<<< HEAD
      const response = await apiService.post("/stories", storyData);
      return response;
    } catch (error) {
      console.error("Failed to create story:", error);
=======
      console.log("StoriesService: Creating story with data:", storyData);

      const response = await apiService.post("/stories", storyData);

      console.log("StoriesService: Response from server:", response);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to create story");
    } catch (error) {
      console.error("StoriesService: Failed to create story:", error);

      // Log more details about the error
      if (error.response) {
        console.error("StoriesService: Error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });

        // If it's a validation error, show the specific validation messages
        if (error.response.status === 400 && error.response.data?.errors) {
          console.error("Validation errors:", error.response.data.errors);
        }
      }

>>>>>>> origin/main
      throw error;
    }
  }

  // Update a story
  async updateStory(storyId, storyData) {
    try {
      const response = await apiService.put(`/stories/${storyId}`, storyData);
<<<<<<< HEAD
      return response;
=======

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to update story");
>>>>>>> origin/main
    } catch (error) {
      console.error("Failed to update story:", error);
      throw error;
    }
  }

  // Delete a story
  async deleteStory(storyId) {
    try {
      const response = await apiService.delete(`/stories/${storyId}`);
<<<<<<< HEAD
      return response;
=======

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to delete story");
>>>>>>> origin/main
    } catch (error) {
      console.error("Failed to delete story:", error);
      throw error;
    }
  }

<<<<<<< HEAD
  // Like a story
  async likeStory(storyId) {
    try {
      const response = await apiService.post(`/stories/${storyId}/like`);
      return response;
    } catch (error) {
      console.error("Failed to like story:", error);
=======
  // Like/Unlike a story
  async toggleLikeStory(storyId) {
    try {
      const response = await apiService.post(`/stories/${storyId}/like`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to toggle like");
    } catch (error) {
      console.error("Failed to toggle like:", error);
>>>>>>> origin/main
      throw error;
    }
  }

<<<<<<< HEAD
  // Unlike a story
  async unlikeStory(storyId) {
    try {
      const response = await apiService.delete(`/stories/${storyId}/like`);
      return response;
    } catch (error) {
      console.error("Failed to unlike story:", error);
      throw error;
    }
  }

  // Add a comment to a story
  async addComment(storyId, commentData) {
    try {
      const response = await apiService.post(
        `/stories/${storyId}/comments`,
        commentData,
      );
      return response;
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  }

  // Get comments for a story
  async getComments(storyId, page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/stories/${storyId}/comments?page=${page}&limit=${limit}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      return {
        comments: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // Bookmark a story
  async bookmarkStory(storyId) {
    try {
      const response = await apiService.post(`/stories/${storyId}/bookmark`);
      return response;
    } catch (error) {
      console.error("Failed to bookmark story:", error);
      throw error;
    }
  }

  // Remove bookmark from a story
  async removeBookmark(storyId) {
    try {
      const response = await apiService.delete(`/stories/${storyId}/bookmark`);
      return response;
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      throw error;
    }
  }

  // Get user's stories
  async getUserStories(userId, page = 1, limit = 20) {
    try {
      const response = await apiService.get(
        `/users/${userId}/stories?page=${page}&limit=${limit}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch user stories:", error);
=======
  // Alias for toggleLikeStory (for compatibility)
  async likeStory(storyId) {
    return this.toggleLikeStory(storyId);
  }

  // Search stories
  async searchStories(query, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: query,
      };
      return await this.getStories(searchFilters);
    } catch (error) {
      console.error("Failed to search stories:", error);
>>>>>>> origin/main
      return {
        stories: [],
        pagination: {
          currentPage: 1,
<<<<<<< HEAD
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
=======
          totalPages: 0,
          totalStories: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: filters.limit || 10,
>>>>>>> origin/main
        },
      };
    }
  }

<<<<<<< HEAD
  // Get trending stories
  async getTrendingStories(period = "week") {
    try {
      const response = await apiService.get(
        `/stories/trending?period=${period}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch trending stories:", error);
      // Return fallback data
      const allStories = await this.getStories();
      return {
        stories: allStories.stories
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 10),
      };
=======
  // Get story categories (if needed)
  async getCategories() {
    try {
      const response = await apiService.get("/stories/categories");

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch categories");
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Return common story categories as fallback
      return [
        "Personal Growth",
        "Life Lessons",
        "Travel",
        "Career",
        "Relationships",
        "Health",
        "Inspiration",
        "Adventure",
        "Family",
        "Creativity",
      ];
    }
  }

  // Get story tags
  async getTags() {
    try {
      const response = await apiService.get("/stories/tags");

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to fetch tags");
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
>>>>>>> origin/main
    }
  }
}

<<<<<<< HEAD
const storiesService = new StoriesService();
=======
export const storiesService = new StoriesService();
>>>>>>> origin/main
export default storiesService;
