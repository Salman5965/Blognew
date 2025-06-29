import { apiService } from "./api";

class ChatService {
  constructor() {
    this.mockData = {
      conversations: [],
      messages: {},
    };
  }

  // Get user conversations
  async getConversations() {
    try {
      const response = await apiService.get("/messages/conversations");
      if (response.status === "success") {
        return {
          data: response.data.conversations || [],
          status: "success",
        };
      }
      throw new Error(response.message || "Failed to fetch conversations");
    } catch (error) {
      console.warn("Failed to fetch conversations from API:", error);
      // Return empty data as fallback
      return {
        data: [],
        status: "success",
      };
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await apiService.get(
        `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      );
      if (response.status === "success") {
        return {
          data: response.data.messages || [],
          status: "success",
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.message || "Failed to fetch messages");
    } catch (error) {
      console.warn(
        `Failed to fetch messages for conversation ${conversationId}:`,
        error,
      );
      // Return empty data as fallback
      return {
        data: [],
        status: "success",
        pagination: {
          currentPage: page,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // Send a message
  async sendMessage(conversationId, content, type = "text") {
    try {
      const response = await apiService.post(
        `/messages/conversations/${conversationId}/messages`,
        {
          content,
          type,
        },
      );

      if (response.status === "success") {
        return {
          data: response.data.message,
          status: "success",
        };
      }

      throw new Error(response.message || "Failed to send message");
    } catch (error) {
      console.warn("Failed to send message via API:", error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(participantId) {
    try {
      const response = await apiService.post("/messages/conversations", {
        participantId,
      });

      if (response.status === "success") {
        return {
          data: response.data.conversation,
          status: "success",
        };
      }

      throw new Error(response.message || "Failed to create conversation");
    } catch (error) {
      console.warn("Failed to create conversation via API:", error);
      throw error;
    }
  }

  // Mark conversation as read
  async markAsRead(conversationId) {
    try {
      const response = await apiService.put(
        `/messages/conversations/${conversationId}/read`,
      );
      return response;
    } catch (error) {
      console.warn("Failed to mark as read via API:", error);
      // Silently fail for this non-critical action
      return { status: "error", message: error.message };
    }
  }

  // Search users for new conversations
  async searchUsers(query) {
    try {
      const response = await apiService.get(
        `/users/search?q=${encodeURIComponent(query)}&limit=10`,
      );
      if (response.status === "success") {
        return {
          data: response.data.users || [],
          status: "success",
        };
      }
      throw new Error(response.message || "Failed to search users");
    } catch (error) {
      console.warn("Failed to search users via API:", error);
      // Return empty search results
      return {
        data: [],
        status: "success",
      };
    }
  }

  // Real-time message handling (for WebSocket implementation)
  onNewMessage(callback) {
    // This would typically set up WebSocket connection
    // For now, just provide the callback structure
    if (typeof callback === "function") {
      // Store callback for when WebSocket is implemented
      this.messageCallback = callback;
    }
  }

  // Disconnect from real-time messaging
  disconnect() {
    // Clean up WebSocket connections when implemented
    this.messageCallback = null;
  }

  // Get conversation by participant ID
  async getConversationByParticipant(participantId) {
    try {
      const response = await apiService.get(
        `/messages/conversations/participant/${participantId}`,
      );
      if (response.status === "success") {
        return {
          data: response.data.conversation,
          status: "success",
        };
      }
      throw new Error(response.message || "Failed to fetch conversation");
    } catch (error) {
      console.warn("Failed to fetch conversation by participant:", error);
      return {
        data: null,
        status: "error",
        message: error.message,
      };
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      const response = await apiService.delete(
        `/messages/conversations/${conversationId}`,
      );
      return response;
    } catch (error) {
      console.warn("Failed to delete conversation:", error);
      throw error;
    }
  }

  // Block/unblock a user
  async toggleBlockUser(userId) {
    try {
      const response = await apiService.post(`/users/${userId}/block`);
      return response;
    } catch (error) {
      console.warn("Failed to toggle block user:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
