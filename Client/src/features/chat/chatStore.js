import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { chatService } from "@/services/chatService";

export const useChatStore = create()(
  devtools(
    (set, get) => ({
      // State
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoading: false,
      error: null,
      unreadCount: 0,
      isOpen: false,
      activeTab: "conversations", // 'conversations' | 'new-chat'
      searchQuery: "",
      searchResults: [],
      isSearching: false,

      // Actions
      toggleChat: () =>
        set(
          (state) => ({
            isOpen: !state.isOpen,
            error: null,
          }),
          false,
          "toggleChat",
        ),

      openChat: () => set({ isOpen: true, error: null }, false, "openChat"),

      closeChat: () =>
        set(
          {
            isOpen: false,
            currentConversation: null,
            activeTab: "conversations",
            searchQuery: "",
            searchResults: [],
          },
          false,
          "closeChat",
        ),

      setActiveTab: (tab) =>
        set(
          {
            activeTab: tab,
            error: null,
          },
          false,
          "setActiveTab",
        ),

      // Fetch conversations
      fetchConversations: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await chatService.getConversations();

          if (response.status === "success") {
            const totalUnread = response.data.reduce(
              (sum, conv) => sum + (conv.unreadCount || 0),
              0,
            );
            set({
              conversations: response.data || [],
              unreadCount: totalUnread,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to fetch conversations",
            );
          }
        } catch (error) {
          set({
            error: error.message || "Failed to fetch conversations",
            isLoading: false,
          });
        }
      },

      // Open conversation
      openConversation: async (conversation) => {
        try {
          set({ isLoading: true, error: null });

          // Mark as read
          if (conversation.unreadCount > 0) {
            await chatService.markAsRead(conversation.id);

            // Update local state
            const { conversations } = get();
            const updatedConversations = conversations.map((conv) =>
              conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv,
            );
            const newUnreadCount = updatedConversations.reduce(
              (sum, conv) => sum + (conv.unreadCount || 0),
              0,
            );

            set({
              conversations: updatedConversations,
              unreadCount: newUnreadCount,
            });
          }

          // Fetch messages
          const response = await chatService.getMessages(conversation.id);

          if (response.status === "success") {
            set({
              currentConversation: conversation,
              messages: response.data || [],
              isLoading: false,
              activeTab: "conversation",
            });
          } else {
            throw new Error(response.message || "Failed to fetch messages");
          }
        } catch (error) {
          set({
            error: error.message || "Failed to open conversation",
            isLoading: false,
          });
        }
      },

      // Send message
      sendMessage: async (content, type = "text") => {
        const { currentConversation, messages } = get();
        if (!currentConversation) return;

        try {
          // Optimistically add message
          const tempMessage = {
            id: "temp_" + Date.now(),
            senderId: "current_user",
            content,
            timestamp: new Date().toISOString(),
            type,
            sending: true,
          };

          set({ messages: [...messages, tempMessage] });

          // Send to server
          const response = await chatService.sendMessage(
            currentConversation.id,
            content,
            type,
          );

          if (response.status === "success") {
            // Replace temp message with server response
            const updatedMessages = messages.filter(
              (m) => m.id !== tempMessage.id,
            );
            set({
              messages: [...updatedMessages, response.data],
              error: null,
            });

            // Update conversation last message
            const { conversations } = get();
            const updatedConversations = conversations.map((conv) =>
              conv.id === currentConversation.id
                ? {
                    ...conv,
                    lastMessage: content,
                    lastMessageTime: response.data.timestamp,
                  }
                : conv,
            );
            set({ conversations: updatedConversations });
          } else {
            throw new Error(response.message || "Failed to send message");
          }
        } catch (error) {
          // Remove temp message on error
          set({
            messages: messages.filter((m) => m.id !== `temp_${Date.now()}`),
            error: error.message || "Failed to send message",
          });
        }
      },

      // Search users
      searchUsers: async (query) => {
        if (!query.trim()) {
          set({ searchResults: [], searchQuery: "" });
          return;
        }

        try {
          set({ isSearching: true, searchQuery: query, error: null });
          const response = await chatService.searchUsers(query);

          if (response.status === "success") {
            set({
              searchResults: response.data || [],
              isSearching: false,
            });
          } else {
            throw new Error(response.message || "Failed to search users");
          }
        } catch (error) {
          set({
            error: error.message || "Failed to search users",
            isSearching: false,
            searchResults: [],
          });
        }
      },

      // Start new conversation
      startConversation: async (user) => {
        try {
          set({ isLoading: true, error: null });

          // Check if conversation already exists
          const { conversations } = get();
          const existingConv = conversations.find(
            (conv) => conv.participantId === user.id,
          );

          if (existingConv) {
            // Open existing conversation
            get().openConversation(existingConv);
            return;
          }

          // Create new conversation
          const response = await chatService.createConversation(user.id);

          if (response.status === "success") {
            const newConversation = {
              ...response.data,
              participantName: user.name || user.username,
              participantAvatar: user.avatar,
            };

            set({
              conversations: [newConversation, ...conversations],
              currentConversation: newConversation,
              messages: [],
              activeTab: "conversation",
              isLoading: false,
              searchQuery: "",
              searchResults: [],
            });
          } else {
            throw new Error(
              response.message || "Failed to create conversation",
            );
          }
        } catch (error) {
          set({
            error: error.message || "Failed to start conversation",
            isLoading: false,
          });
        }
      },

      // Go back to conversations list
      backToConversations: () =>
        set(
          {
            currentConversation: null,
            messages: [],
            activeTab: "conversations",
            error: null,
          },
          false,
          "backToConversations",
        ),

      // Clear error
      clearError: () => set({ error: null }, false, "clearError"),

      // Refresh unread count
      refreshUnreadCount: async () => {
        try {
          const count = await chatService.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          console.warn("Failed to refresh unread count:", error);
        }
      },
    }),
    {
      name: "chat-store",
    },
  ),
);
