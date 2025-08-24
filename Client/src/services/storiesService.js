// import { apiService } from "./api";

// class StoriesService {
//   // Get all stories with optional filters
//   async getStories(filters = {}) {
//     try {
//       const params = new URLSearchParams();
//       if (filters.search) {
//         params.append("search", filters.search);
//       }
//       if (filters.page) {
//         params.append("page", filters.page);
//       }
//       if (filters.limit) {
//         params.append("limit", filters.limit);
//       }
//       if (filters.category) {
//         params.append("category", filters.category);
//       }
//       if (filters.tag) {
//         params.append("tag", filters.tag);
//       }
//       if (filters.sort) {
//         params.append("sort", filters.sort);
//       }

//       const response = await apiService.get(`/stories?${params}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch stories");
//     } catch (error) {
//       console.error("Failed to fetch stories:", error);
//       // Return empty data structure instead of mock data
//       return {
//         stories: [],
//         pagination: {
//           currentPage: filters.page || 1,
//           totalPages: 0,
//           totalStories: 0,
//           hasNextPage: false,
//           hasPrevPage: false,
//           limit: filters.limit || 10,
//         },
//       };
//     }
//   }

//   // Get popular stories
//   async getPopularStories(limit = 10) {
//     try {
//       const response = await apiService.get(`/stories/popular?limit=${limit}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch popular stories");
//     } catch (error) {
//       console.error("Failed to fetch popular stories:", error);
//       return {
//         stories: [],
//       };
//     }
//   }

//   // Get featured stories (alias for popular stories for now)
//   async getFeaturedStories(limit = 10) {
//     try {
//       // For now, use popular stories as featured stories
//       // This could be a separate endpoint in the future
//       const response = await apiService.get(`/stories/popular?limit=${limit}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch featured stories");
//     } catch (error) {
//       console.error("Failed to fetch featured stories:", error);
//       return {
//         stories: [],
//       };
//     }
//   }

//   // Get my stories
//   async getMyStories(filters = {}) {
//     try {
//       const params = new URLSearchParams();
//       if (filters.page) {
//         params.append("page", filters.page);
//       }
//       if (filters.limit) {
//         params.append("limit", filters.limit);
//       }
//       if (filters.status) {
//         params.append("status", filters.status);
//       }

//       const response = await apiService.get(`/stories/my-stories?${params}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch my stories");
//     } catch (error) {
//       console.error("Failed to fetch my stories:", error);
//       return {
//         stories: [],
//         pagination: {
//           currentPage: filters.page || 1,
//           totalPages: 0,
//           totalStories: 0,
//           hasNextPage: false,
//           hasPrevPage: false,
//           limit: filters.limit || 10,
//         },
//       };
//     }
//   }

//   // Get single story by ID
//   async getStoryById(storyId) {
//     try {
//       const response = await apiService.get(`/stories/${storyId}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch story");
//     } catch (error) {
//       console.error("Failed to fetch story:", error);
//       throw error;
//     }
//   }

//   // Create a new story
//   async createStory(storyData) {
//     try {
//       console.log("StoriesService: Creating story with data:", storyData);

//       const response = await apiService.post("/stories", storyData);

//       console.log("StoriesService: Response from server:", response);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to create story");
//     } catch (error) {
//       console.error("StoriesService: Failed to create story:", error);

//       // Log more details about the error
//       if (error.response) {
//         console.error("StoriesService: Error response:", {
//           status: error.response.status,
//           statusText: error.response.statusText,
//           data: error.response.data,
//           headers: error.response.headers,
//         });

//         // If it's a validation error, show the specific validation messages
//         if (error.response.status === 400 && error.response.data?.errors) {
//           console.error("Validation errors:", error.response.data.errors);
//         }
//       }

//       throw error;
//     }
//   }

//   // Update a story
//   async updateStory(storyId, storyData) {
//     try {
//       const response = await apiService.put(`/stories/${storyId}`, storyData);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to update story");
//     } catch (error) {
//       console.error("Failed to update story:", error);
//       throw error;
//     }
//   }

//   // Delete a story
//   async deleteStory(storyId) {
//     try {
//       const response = await apiService.delete(`/stories/${storyId}`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to delete story");
//     } catch (error) {
//       console.error("Failed to delete story:", error);
//       throw error;
//     }
//   }

//   // Like/Unlike a story
//   async toggleLikeStory(storyId) {
//     try {
//       const response = await apiService.post(`/stories/${storyId}/like`);

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to toggle like");
//     } catch (error) {
//       console.error("Failed to toggle like:", error);
//       throw error;
//     }
//   }

//   // Alias for toggleLikeStory (for compatibility)
//   async likeStory(storyId) {
//     return this.toggleLikeStory(storyId);
//   }

//   // Search stories
//   async searchStories(query, filters = {}) {
//     try {
//       const searchFilters = {
//         ...filters,
//         search: query,
//       };
//       return await this.getStories(searchFilters);
//     } catch (error) {
//       console.error("Failed to search stories:", error);
//       return {
//         stories: [],
//         pagination: {
//           currentPage: 1,
//           totalPages: 0,
//           totalStories: 0,
//           hasNextPage: false,
//           hasPrevPage: false,
//           limit: filters.limit || 10,
//         },
//       };
//     }
//   }

//   // Get story categories (if needed)
//   async getCategories() {
//     try {
//       const response = await apiService.get("/stories/categories");

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch categories");
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//       // Return common story categories as fallback
//       return [
//         "Personal Growth",
//         "Life Lessons",
//         "Travel",
//         "Career",
//         "Relationships",
//         "Health",
//         "Inspiration",
//         "Adventure",
//         "Family",
//         "Creativity",
//       ];
//     }
//   }

//   // Get story tags
//   async getTags() {
//     try {
//       const response = await apiService.get("/stories/tags");

//       if (response.status === "success") {
//         return response.data;
//       }

//       throw new Error(response.message || "Failed to fetch tags");
//     } catch (error) {
//       console.error("Failed to fetch tags:", error);
//       return [];
//     }
//   }
// }

// export const storiesService = new StoriesService();
// export default storiesService;








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
        },
      };
    }
  }

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
      };
    }
  }

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
    } catch (error) {
      console.error("Failed to fetch story:", error);
      throw error;
    }
  }

  // Create a new story
  async createStory(storyData) {
    try {
      console.log("StoriesService: Creating story with data:", storyData);

      // Determine if this is a file upload or regular JSON
      const isFormData = storyData instanceof FormData;

      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const response = await apiService.post("/stories", storyData, config);

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

      throw error;
    }
  }

  // Update a story
  async updateStory(storyId, storyData) {
    try {
      const response = await apiService.put(`/stories/${storyId}`, storyData);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to update story");
    } catch (error) {
      console.error("Failed to update story:", error);
      throw error;
    }
  }

  // Delete a story
  async deleteStory(storyId) {
    try {
      const response = await apiService.delete(`/stories/${storyId}`);

      if (response.status === "success") {
        return response.data;
      }

      throw new Error(response.message || "Failed to delete story");
    } catch (error) {
      console.error("Failed to delete story:", error);
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      return {
        stories: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalStories: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: filters.limit || 10,
        },
      };
    }
  }

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
    }
  }
}

export const storiesService = new StoriesService();
export default storiesService;
