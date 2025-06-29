import { apiService as api } from "@/services/api";

class ForumService {
  // Get forum statistics
  async getStats() {
    try {
      const response = await api.get("/forum/stats");
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("Authentication required for forum stats");
      } else {
        console.error("Error fetching forum stats:", error);
      }
      // Return fallback data for better UX
      return {
        success: false,
        data: {
          totalMembers: 2847,
          onlineMembers: 234,
          totalMessages: 15892,
          channelsCount: 12,
        },
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
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("Authentication required for forum channels");
      } else {
        console.error("Error fetching channels:", error);
      }
      // Return fallback channels for better UX
      return {
        success: false,
        data: {
          channels: [
            {
              id: "general",
              name: "General Discussion",
              description: "General conversations and announcements",
              category: "general",
              memberCount: 1247,
              onlineCount: 89,
              lastActivity: new Date(Date.now() - 2 * 60 * 1000),
              unreadCount: 3,
              isPinned: true,
            },
            {
              id: "development",
              name: "Development",
              description: "Programming and development discussions",
              category: "development",
              memberCount: 892,
              onlineCount: 45,
              lastActivity: new Date(Date.now() - 5 * 60 * 1000),
              unreadCount: 1,
              isPinned: false,
            },
            {
              id: "design",
              name: "Design & UI/UX",
              description: "Design discussions and feedback",
              category: "development",
              memberCount: 634,
              onlineCount: 23,
              lastActivity: new Date(Date.now() - 15 * 60 * 1000),
              unreadCount: 0,
              isPinned: false,
            },
            {
              id: "career",
              name: "Career Advice",
              description: "Career guidance and job opportunities",
              category: "career",
              memberCount: 445,
              onlineCount: 12,
              lastActivity: new Date(Date.now() - 30 * 60 * 1000),
              unreadCount: 5,
              isPinned: false,
            },
            {
              id: "offtopic",
              name: "Off Topic",
              description: "Everything else not related to development",
              category: "off-topic",
              memberCount: 1156,
              onlineCount: 67,
              lastActivity: new Date(Date.now() - 10 * 60 * 1000),
              unreadCount: 0,
              isPinned: false,
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalChannels: 5,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    }
  }

  // Get messages for a specific channel
  async getChannelMessages(channelId, options = {}) {
    try {
      const { page = 1, limit = 50, before, after } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(before && { before }),
        ...(after && { after }),
      });

      const response = await api.get(
        `/forum/channels/${channelId}/messages?${params}`,
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      // Return fallback messages
      return {
        success: false,
        data: {
          messages: this.getMockMessages(channelId),
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalMessages: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    }
  }

  // Send a message to a channel
  async sendMessage(channelId, messageData) {
    try {
      const response = await api.post(
        `/forum/channels/${channelId}/messages`,
        messageData,
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send message",
      };
    }
  }

  // Add reaction to a message
  async addReaction(messageId, emoji) {
    try {
      const response = await api.post(
        `/forum/messages/${messageId}/reactions`,
        {
          emoji,
        },
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error adding reaction:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add reaction",
      };
    }
  }

  // Remove reaction from a message
  async removeReaction(messageId, emoji) {
    try {
      const response = await api.delete(
        `/forum/messages/${messageId}/reactions`,
        {
          data: { emoji },
        },
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error removing reaction:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to remove reaction",
      };
    }
  }

  // Get mock messages for fallback
  getMockMessages(channelId) {
    const mockUsers = [
      {
        _id: "user1",
        username: "alice",
        firstName: "Alice",
        lastName: "Johnson",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        role: "moderator",
      },
      {
        _id: "user2",
        username: "bob",
        firstName: "Bob",
        lastName: "Smith",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        role: "member",
      },
      {
        _id: "user3",
        username: "charlie",
        firstName: "Charlie",
        lastName: "Brown",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        role: "member",
      },
    ];

    return [
      {
        _id: "msg1",
        content:
          "Welcome to the community! Feel free to introduce yourself and ask any questions.",
        author: mockUsers[0],
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        reactions: [
          { emoji: "👋", count: 5, users: ["user2", "user3"] },
          { emoji: "❤️", count: 3, users: ["user2"] },
        ],
        isPinned: true,
      },
      {
        _id: "msg2",
        content:
          "Has anyone tried the new React 18 features? The concurrent rendering is amazing!",
        author: mockUsers[1],
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        reactions: [
          { emoji: "🚀", count: 7, users: ["user1", "user3"] },
          { emoji: "💯", count: 4, users: ["user1"] },
        ],
        replies: [
          {
            _id: "reply1",
            content:
              "Yes! The automatic batching feature has improved performance significantly in our app.",
            author: mockUsers[2],
            createdAt: new Date(Date.now() - 25 * 60 * 1000),
          },
        ],
      },
      {
        _id: "msg3",
        content: `Here's a quick code snippet for anyone struggling with async/await:

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\``,
        author: mockUsers[0],
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        reactions: [
          { emoji: "🔥", count: 12, users: ["user2", "user3"] },
          { emoji: "👍", count: 8, users: ["user2"] },
        ],
      },
      {
        _id: "msg4",
        content:
          "Anyone attending the upcoming tech conference? Would love to connect!",
        author: mockUsers[2],
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        reactions: [{ emoji: "🎯", count: 3, users: ["user1"] }],
      },
    ];
  }

  // Create a new channel (admin/moderator only)
  async createChannel(channelData) {
    try {
      const response = await api.post("/forum/channels", channelData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error creating channel:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create channel",
      };
    }
  }

  // Join a channel
  async joinChannel(channelId) {
    try {
      const response = await api.post(`/forum/channels/${channelId}/join`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error joining channel:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to join channel",
      };
    }
  }

  // Leave a channel
  async leaveChannel(channelId) {
    try {
      const response = await api.post(`/forum/channels/${channelId}/leave`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error leaving channel:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to leave channel",
      };
    }
  }
}

export default new ForumService();
