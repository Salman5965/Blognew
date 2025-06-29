import { PAGINATION } from "@/utils/constant";
import apiService from "./api";

class ExploreService {
  async getTrendingAuthors(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 12));

      if (options.timeframe) params.append("timeframe", options.timeframe);
      if (options.category) params.append("category", options.category);

      const response = await apiService.get(
        `/explore/trending-authors?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      // Always handle errors silently and provide mock data
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.warn(
          "Error fetching trending authors, using mock data:",
          error.message,
        );
      }
    }

    // Return mock trending authors data
    return {
      authors: [
        {
          _id: "author1",
          username: "alice_writes",
          firstName: "Alice",
          lastName: "Johnson",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          bio: "Tech writer and blogger passionate about AI and machine learning",
          stats: {
            followersCount: 2847,
            blogsCount: 94,
            totalViews: 125000,
          },
          isFollowing: false,
          trending: true,
        },
        {
          _id: "author2",
          username: "dev_chronicles",
          firstName: "Bob",
          lastName: "Smith",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          bio: "Full-stack developer sharing coding tips and best practices",
          stats: {
            followersCount: 1923,
            blogsCount: 67,
            totalViews: 89000,
          },
          isFollowing: false,
          trending: true,
        },
        {
          _id: "author3",
          username: "design_guru",
          firstName: "Sarah",
          lastName: "Davis",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          bio: "UX/UI designer creating beautiful and functional experiences",
          stats: {
            followersCount: 3245,
            blogsCount: 52,
            totalViews: 156000,
          },
          isFollowing: true,
          trending: true,
        },
      ],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 1,
        totalAuthors: 3,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 12,
      },
    };
  }

  async getFeaturedContent(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 6));

      if (options.type) params.append("type", options.type);

      const response = await apiService.get(
        `/explore/featured-content?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      // Always handle errors silently and provide mock data
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.warn(
          "Error fetching featured content, using mock data:",
          error.message,
        );
      }
    }

    return {
      content: [
        {
          _id: "featured1",
          title: "The Future of Web Development: What's Next?",
          excerpt:
            "Exploring upcoming trends and technologies that will shape the future of web development.",
          type: "blog",
          author: {
            username: "tech_visionary",
            firstName: "Alex",
            lastName: "Chen",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
          },
          stats: {
            views: 15420,
            likes: 892,
            comments: 127,
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          featuredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ["webdev", "future", "technology"],
        },
        {
          _id: "featured2",
          title: "Building Accessible Applications: A Complete Guide",
          excerpt:
            "Learn how to create web applications that are accessible to everyone, including users with disabilities.",
          type: "blog",
          author: {
            username: "accessibility_advocate",
            firstName: "Maya",
            lastName: "Patel",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
          },
          stats: {
            views: 8934,
            likes: 567,
            comments: 89,
          },
          featuredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ["accessibility", "webdev", "inclusive"],
        },
      ],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 1,
        totalContent: 2,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 6,
      },
    };
  }

  async getPopularTags(limit = 20) {
    try {
      const response = await apiService.get(
        `/explore/popular-tags?limit=${limit}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      // Always handle errors silently and provide mock data
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.warn(
          "Error fetching popular tags, using mock data:",
          error.message,
        );
      }
    }

    return {
      tags: [
        { name: "javascript", count: 2847, trending: true },
        { name: "react", count: 1923, trending: true },
        { name: "webdev", count: 1654, trending: false },
        { name: "tutorial", count: 1234, trending: false },
        { name: "programming", count: 1156, trending: true },
        { name: "css", count: 987, trending: false },
        { name: "nodejs", count: 845, trending: false },
        { name: "python", count: 789, trending: true },
        { name: "design", count: 567, trending: false },
        { name: "career", count: 456, trending: false },
      ].slice(0, limit),
    };
  }

  async getRecommendedUsers(options = {}) {
    try {
      const params = new URLSearchParams();
      params.append("page", String(options.page || PAGINATION.DEFAULT_PAGE));
      params.append("limit", String(options.limit || 8));

      const response = await apiService.get(
        `/explore/recommended-users?${params}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      // Always handle errors silently and provide mock data
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.warn(
          "Error fetching recommended users, using mock data:",
          error.message,
        );
      }
    }

    return {
      users: [
        {
          _id: "user1",
          username: "code_ninja",
          firstName: "Kevin",
          lastName: "Wong",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
          bio: "Software engineer passionate about clean code",
          stats: {
            followersCount: 1456,
            blogsCount: 34,
          },
          isFollowing: false,
          mutualConnections: 5,
        },
        {
          _id: "user2",
          username: "data_scientist",
          firstName: "Emma",
          lastName: "Rodriguez",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          bio: "Data scientist exploring AI and ML",
          stats: {
            followersCount: 2234,
            blogsCount: 67,
          },
          isFollowing: false,
          mutualConnections: 3,
        },
      ],
      pagination: {
        currentPage: options.page || 1,
        totalPages: 1,
        totalUsers: 2,
        hasNextPage: false,
        hasPrevPage: false,
        limit: options.limit || 8,
      },
    };
  }

  async getTrendingTopics(limit = 10) {
    try {
      const response = await apiService.get(
        `/explore/trending-topics?limit=${limit}`,
      );

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      // Always handle errors silently and provide mock data
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.warn(
          "Error fetching trending topics, using mock data:",
          error.message,
        );
      }
    }

    return {
      topics: [
        { name: "Web Development", count: 234, growth: "+15%" },
        { name: "Machine Learning", count: 189, growth: "+28%" },
        { name: "React.js", count: 156, growth: "+12%" },
        { name: "JavaScript", count: 145, growth: "+8%" },
        { name: "UI/UX Design", count: 134, growth: "+22%" },
        { name: "Node.js", count: 98, growth: "+5%" },
        { name: "Python", count: 87, growth: "+18%" },
        { name: "Career Advice", count: 76, growth: "+25%" },
        { name: "CSS", count: 65, growth: "+7%" },
        { name: "DevOps", count: 54, growth: "+30%" },
      ].slice(0, limit),
    };
  }

  async getExploreStats() {
    try {
      const response = await apiService.get(`/explore/stats`);

      if (response?.status === "success") {
        return response.data;
      }
    } catch (error) {
      // Always handle errors silently and provide mock data
      if (
        error.response?.status === 404 ||
        error.message?.includes("Not Found")
      ) {
        console.warn("Explore API not available, using mock data");
      } else {
        console.warn(
          "Error fetching explore stats, using mock data:",
          error.message,
        );
      }
    }

    return {
      totalAuthors: 15420,
      totalBlogs: 47892,
      activeUsers: 8934,
      popularTopics: 234,
    };
  }
}

export const exploreService = new ExploreService();
export default exploreService;
