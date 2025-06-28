import { apiService as api } from "@/services/api";

class ForumService {
  // Get forum statistics
  async getStats() {
    try {
      const response = await api.get("/forum/stats");
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch forum stats");
    } catch (error) {
      console.error("Error fetching forum stats:", error);
      // Return mock data as fallback
      return {
        totalMembers: 12453,
        onlineMembers: 342,
        totalMessages: 89234,
        channelsCount: 28,
      };
    }
  }

  // Get all channels
  async getChannels(options = {}) {
    try {
      const { category, search, page = 1, limit = 20 } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(search && { search }),
      });

      const response = await api.get(`/forum/channels?${params}`);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch channels");
    } catch (error) {
      console.error("Error fetching channels:", error);

      // Return mock data as fallback
      return {
        channels: this.getMockChannels(),
        pagination: {
          currentPage: page,
          totalPages: 2,
          totalChannels: 25,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  // Get channel by ID
  async getChannelById(channelId) {
    try {
      const response = await api.get(`/forum/channels/${channelId}`);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch channel");
    } catch (error) {
      console.error("Error fetching channel:", error);

      // Return mock channel
      const mockChannels = this.getMockChannels();
      return mockChannels.find((c) => c.id === channelId) || mockChannels[0];
    }
  }

  // Get messages in a channel
  async getChannelMessages(channelId, options = {}) {
    try {
      const { page = 1, limit = 50, before } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(before && { before }),
      });

      const response = await api.get(
        `/forum/channels/${channelId}/messages?${params}`,
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch messages");
    } catch (error) {
      console.error("Error fetching channel messages:", error);

      // Return mock messages
      return {
        messages: this.getMockMessages(),
        hasMore: false,
      };
    }
  }

  // Send message to channel
  async sendMessage(channelId, messageData) {
    try {
      const response = await api.post(
        `/forum/channels/${channelId}/messages`,
        messageData,
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to send message");
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Add reaction to message
  async addReaction(messageId, emoji) {
    try {
      const response = await api.post(
        `/forum/messages/${messageId}/reactions`,
        { emoji },
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to add reaction");
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw error;
    }
  }

  // Remove reaction from message
  async removeReaction(messageId, emoji) {
    try {
      const response = await api.delete(
        `/forum/messages/${messageId}/reactions`,
        {
          data: { emoji },
        },
      );
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to remove reaction");
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw error;
    }
  }

  // Create new channel
  async createChannel(channelData) {
    try {
      const response = await api.post("/forum/channels", channelData);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to create channel");
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/forum/messages/${messageId}`);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Failed to delete message");
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  // Mock data methods
  getMockChannels() {
    return [
      {
        _id: "welcome",
        name: "welcome",
        description: "Welcome new members!",
        category: "general",
        icon: "Users",
        messageCount: 1234,
        memberCount: 500,
        onlineCount: 45,
        lastActivity: "2 min ago",
        isPinned: true,
        unreadCount: 3,
      },
      {
        _id: "general-chat",
        name: "general-chat",
        description: "General discussions",
        category: "general",
        icon: "Hash",
        messageCount: 8934,
        memberCount: 1200,
        onlineCount: 123,
        lastActivity: "1 min ago",
        unreadCount: 12,
      },
      {
        _id: "frontend",
        name: "frontend",
        description: "React, Vue, Angular discussions",
        category: "development",
        icon: "Code",
        messageCount: 4567,
        memberCount: 800,
        onlineCount: 67,
        lastActivity: "30 sec ago",
        unreadCount: 8,
      },
      {
        _id: "help-general",
        name: "help-general",
        description: "General help and questions",
        category: "help",
        icon: "HelpCircle",
        messageCount: 3456,
        memberCount: 600,
        onlineCount: 78,
        lastActivity: "1 min ago",
        unreadCount: 15,
      },
    ];
  }

  getMockMessages() {
    return [
      {
        _id: 1,
        content:
          "Welcome to the community! Feel free to introduce yourself and ask questions.",
        author: {
          _id: "user1",
          username: "moderator",
          firstName: "Community",
          lastName: "Moderator",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
          role: "moderator",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        reactions: [
          { emoji: "👋", count: 12, users: ["user2"] },
          { emoji: "🎉", count: 8, users: ["user3"] },
        ],
        isPinned: true,
      },
      {
        _id: 2,
        content:
          "Hey everyone! Just wanted to share this awesome React tutorial I found.",
        author: {
          _id: "user2",
          username: "developer",
          firstName: "John",
          lastName: "Developer",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
          role: "member",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        reactions: [{ emoji: "👍", count: 5, users: ["user1"] }],
      },
    ];
  }
}

export default new ForumService();
