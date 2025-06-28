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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
}

export default new ForumService();
