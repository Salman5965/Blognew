import { apiService } from "./api";

class ChatService {
  constructor() {
    this.mockData = {
      conversations: [
        {
          id: "1",
          participantId: "user2",
          participantName: "Sarah Wilson",
          participantAvatar: "/placeholder.svg",
          lastMessage: "Hey! How are you doing?",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          unreadCount: 2,
          isOnline: true,
        },
        {
          id: "2",
          participantId: "user3",
          participantName: "Mike Johnson",
          participantAvatar: "/placeholder.svg",
          lastMessage: "Thanks for sharing that blog post!",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          unreadCount: 0,
          isOnline: false,
        },
        {
          id: "3",
          participantId: "user4",
          participantName: "Emma Davis",
          participantAvatar: "/placeholder.svg",
          lastMessage: "Let me know when you're available for a call",
          lastMessageTime: new Date(
            Date.now() - 1000 * 60 * 60 * 2,
          ).toISOString(), // 2 hours ago
          unreadCount: 1,
          isOnline: true,
        },
      ],
      messages: {
        1: [
          {
            id: "m1",
            senderId: "user2",
            content: "Hey! How are you doing?",
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            type: "text",
          },
          {
            id: "m2",
            senderId: "current_user",
            content:
              "Hi Sarah! I'm doing great, thanks for asking. How about you?",
            timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
            type: "text",
          },
          {
            id: "m3",
            senderId: "user2",
            content:
              "I'm wonderful! Just finished reading your latest blog post about React hooks. Really insightful!",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            type: "text",
          },
        ],
        2: [
          {
            id: "m4",
            senderId: "user3",
            content: "Thanks for sharing that blog post!",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: "text",
          },
          {
            id: "m5",
            senderId: "current_user",
            content: "You're welcome! Glad you found it helpful.",
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            type: "text",
          },
        ],
        3: [
          {
            id: "m6",
            senderId: "user4",
            content: "Let me know when you're available for a call",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: "text",
          },
        ],
      },
    };
  }

  async getConversations() {
    try {
      // Try to get from API first
      const response = await apiService.get("/api/chat/conversations");
      return response.data || response;
    } catch (error) {
      console.warn(
        "Failed to fetch conversations from API, using mock data:",
        error,
      );
      // Return mock data as fallback
      return {
        data: this.mockData.conversations,
        status: "success",
      };
    }
  }

  async getMessages(conversationId) {
    try {
      const response = await apiService.get(
        `/api/chat/conversations/${conversationId}/messages`,
      );
      return response.data || response;
    } catch (error) {
      console.warn(
        `Failed to fetch messages for conversation ${conversationId}, using mock data:`,
        error,
      );
      // Return mock data as fallback
      return {
        data: this.mockData.messages[conversationId] || [],
        status: "success",
      };
    }
  }

  async sendMessage(conversationId, content, type = "text") {
    try {
      const response = await apiService.post(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          content,
          type,
        },
      );
      return response.data || response;
    } catch (error) {
      console.warn(
        "Failed to send message via API, simulating success:",
        error,
      );
      // Simulate successful message sending
      const newMessage = {
        id: "m" + Date.now(),
        senderId: "current_user",
        content,
        timestamp: new Date().toISOString(),
        type,
      };

      // Add to mock data
      if (!this.mockData.messages[conversationId]) {
        this.mockData.messages[conversationId] = [];
      }
      this.mockData.messages[conversationId].push(newMessage);

      return {
        data: newMessage,
        status: "success",
      };
    }
  }

  async createConversation(participantId) {
    try {
      const response = await apiService.post("/api/chat/conversations", {
        participantId,
      });
      return response.data || response;
    } catch (error) {
      console.warn("Failed to create conversation via API, using mock:", error);
      // Create mock conversation
      const newConversation = {
        id: "conv_" + Date.now(),
        participantId,
        participantName: "New User",
        participantAvatar: "/placeholder.svg",
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isOnline: false,
      };

      this.mockData.conversations.unshift(newConversation);
      this.mockData.messages[newConversation.id] = [];

      return {
        data: newConversation,
        status: "success",
      };
    }
  }

  async markAsRead(conversationId) {
    try {
      await apiService.patch(`/api/chat/conversations/${conversationId}/read`);
    } catch (error) {
      console.warn("Failed to mark as read via API:", error);
      // Update mock data
      const conversation = this.mockData.conversations.find(
        (c) => c.id === conversationId,
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    }
  }

  async searchUsers(query) {
    try {
      const response = await apiService.get(
        `/api/users/search?q=${encodeURIComponent(query)}`,
      );
      return response.data || response;
    } catch (error) {
      console.warn("Failed to search users via API, using mock:", error);
      // Return mock search results
      const mockUsers = [
        {
          id: "user5",
          username: "john_doe",
          name: "John Doe",
          avatar: "/placeholder.svg",
        },
        {
          id: "user6",
          username: "jane_smith",
          name: "Jane Smith",
          avatar: "/placeholder.svg",
        },
        {
          id: "user7",
          username: "alex_brown",
          name: "Alex Brown",
          avatar: "/placeholder.svg",
        },
      ].filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()),
      );

      return {
        data: mockUsers,
        status: "success",
      };
    }
  }

  // WebSocket or real-time connection simulation
  subscribeToMessages(conversationId, callback) {
    // In a real implementation, this would connect to WebSocket
    console.log(`Subscribing to messages for conversation ${conversationId}`);

    // Simulate receiving a message every 30 seconds for demo
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        // 20% chance
        const mockMessage = {
          id: "m" + Date.now(),
          senderId: "user" + Math.floor(Math.random() * 5 + 2),
          content: "This is a simulated real-time message!",
          timestamp: new Date().toISOString(),
          type: "text",
        };
        callback(mockMessage);
      }
    }, 30000);

    return () => clearInterval(interval);
  }

  // Get total unread count across all conversations
  async getUnreadCount() {
    try {
      const conversations = await this.getConversations();
      const totalUnread =
        conversations.data?.reduce(
          (total, conv) => total + (conv.unreadCount || 0),
          0,
        ) || 0;
      return totalUnread;
    } catch (error) {
      console.warn("Failed to get unread count:", error);
      return 0;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
