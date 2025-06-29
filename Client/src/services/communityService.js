import { apiService } from "./api";

class CommunityService {
  // Get community statistics
  async getCommunityStats() {
    try {
      const response = await apiService.get("/community/stats");
      return response;
    } catch (error) {
      console.error("Failed to fetch community stats:", error);
      // Return empty data structure
      return {
        totalMembers: 0,
        totalPosts: 0,
        totalComments: 0,
        activeToday: 0,
      };
    }
  }

  // Get top community members/contributors
  async getTopMembers() {
    try {
      const response = await apiService.get("/community/top-members");
      return response;
    } catch (error) {
      console.error("Failed to fetch top members:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get recent community activity
  async getRecentActivity() {
    try {
      const response = await apiService.get("/community/recent-activity");
      return response;
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get community forums/channels
  async getForums() {
    try {
      const response = await apiService.get("/community/forums");
      return response;
    } catch (error) {
      console.error("Failed to fetch forums:", error);
      // Return empty data structure
      return {
        channels: [],
        totalChannels: 0,
        popularChannels: [],
      };
    }
  }

  // Get featured discussions
  async getFeaturedDiscussions() {
    try {
      const response = await apiService.get("/community/featured-discussions");
      return response;
    } catch (error) {
      console.error("Failed to fetch featured discussions:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get community leaderboard
  async getLeaderboard(timeframe = "month", limit = 10) {
    try {
      const response = await apiService.get(
        `/community/leaderboard?timeframe=${timeframe}&limit=${limit}`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get user community stats
  async getUserCommunityStats(userId) {
    try {
      const response = await apiService.get(`/community/users/${userId}/stats`);
      return response;
    } catch (error) {
      console.error("Failed to fetch user community stats:", error);
      // Return empty data structure
      return {
        points: 0,
        rank: 0,
        postsCount: 0,
        commentsCount: 0,
        likesReceived: 0,
        level: "Member",
      };
    }
  }

  // Join a community channel
  async joinChannel(channelId) {
    try {
      const response = await apiService.post(
        `/community/channels/${channelId}/join`,
      );
      return response;
    } catch (error) {
      console.error("Failed to join channel:", error);
      throw error;
    }
  }

  // Leave a community channel
  async leaveChannel(channelId) {
    try {
      const response = await apiService.post(
        `/community/channels/${channelId}/leave`,
      );
      return response;
    } catch (error) {
      console.error("Failed to leave channel:", error);
      throw error;
    }
  }

  // Report inappropriate content
  async reportContent(contentId, contentType, reason) {
    try {
      const response = await apiService.post("/community/report", {
        contentId,
        contentType,
        reason,
      });
      return response;
    } catch (error) {
      console.error("Failed to report content:", error);
      throw error;
    }
  }

  // Search community content
  async searchCommunity(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append("q", query);

      if (filters.type) params.append("type", filters.type);
      if (filters.channel) params.append("channel", filters.channel);
      if (filters.timeframe) params.append("timeframe", filters.timeframe);

      const response = await apiService.get(`/community/search?${params}`);
      return response;
    } catch (error) {
      console.error("Failed to search community:", error);
      // Return empty results
      return {
        results: [],
        total: 0,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }
}

export const communityService = new CommunityService();
export default communityService;
