import api from "./api";

export const messageService = {
  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await api.get("/chat/unread-count");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      // Return default count if API fails
      return { count: 0 };
    }
  },

  // Get user's conversations
  getConversations: async (page = 1, limit = 20) => {
    try {
      const response = await api.get("/messages/conversations", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return { conversations: [], pagination: {} };
    }
  },

  // Get messages in a conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await api.get(
        `/messages/conversations/${conversationId}`,
        {
          params: { page, limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { messages: [], pagination: {} };
    }
  },

  // Send a new message
  sendMessage: async (conversationId, content, type = "text") => {
    try {
      const response = await api.post(
        `/messages/conversations/${conversationId}`,
        {
          content,
          type,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      const response = await api.patch(
        `/messages/conversations/${conversationId}/read`,
      );
      return response.data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },
};

export default messageService;
