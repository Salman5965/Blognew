import React, { useState, useEffect, useRef } from "react";
import {
<<<<<<< HEAD
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Image,
  ArrowLeft,
  Users,
  Plus,
  Archive,
  Star,
  Trash2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import messageService from "@/services/messageService";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      setShowMobileConversations(false);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        content: newMessage.trim(),
        conversationId: selectedConversation.id,
      };

      const response = await messageService.sendMessage(messageData);

      // Add message to local state immediately for better UX
      const optimisticMessage = {
        id: Date.now(),
        content: newMessage.trim(),
        senderId: user.id,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: user,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: optimisticMessage,
                updatedAt: new Date().toISOString(),
              }
=======
  Search,
  Send,
  Smile,
  ArrowLeft,
  Check,
  CheckCheck,
  Plus,
  Heart,
  Image as ImageIcon,
  Info,
  MoreHorizontal,
  Paperclip,
  Trash2,
  Phone,
  Video,
  Pin,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getDisplayName, getInitials } from "@/utils/userUtils";
import { useToast } from "@/hooks/use-toast";
import messagingService from "@/services/messagingService";
import socketService from "@/services/socketService";
import NewMessageModal from "@/components/messages/NewMessageModal";
import EmojiPicker from "@/components/messages/EmojiPicker";
import FileUpload from "@/components/messages/FileUpload";
import ImageUpload from "@/components/messages/ImageUpload";
import MessageContextMenu from "@/components/messages/MessageContextMenu";
import ConversationContextMenu from "@/components/messages/ConversationContextMenu";

const Messages = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const typingTimeoutRef = useRef(null);

  // Check if we need to open conversation with specific user
  const userIdToMessage = searchParams.get("user");

  // Socket.IO connection and real-time event handling
  useEffect(() => {
    loadConversations();

    // Connect to Socket.IO when user is authenticated
    if (user) {
      const socket = socketService.connect();

      // Set up status change handler
      const handleConnectionStatus = (status) => {
        if (
          status === "no-auth" ||
          status === "error" ||
          status === "disabled"
        ) {
          console.warn(
            "⚠️ Real-time messaging unavailable, using polling fallback",
          );
          // Set up polling fallback for when Socket.IO fails
          startPollingFallback();
        }
      };

      socketService.on("connectionStatusChanged", handleConnectionStatus);

      if (socket) {
        // Join user's conversation rooms
        socket.emit("join_conversations");

        // Listen for new messages
        socket.on("newMessage", (data) => {
          const { message, conversationId } = data;

          // Update messages if this is the current conversation
          if (
            selectedChat &&
            (selectedChat.id === conversationId ||
              selectedChat._id === conversationId)
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some(
                (m) => (m.id || m._id) === (message.id || message._id),
              );
              if (!exists) {
                return [...prev, message];
              }
              return prev;
            });

            // Mark as read if conversation is open
            messagingService.markAsRead(conversationId);
          }

          // Update conversation list with new last message
          setConversations((prev) =>
            prev.map((conv) => {
              if ((conv.id || conv._id) === conversationId) {
                const isCurrentChat =
                  selectedChat &&
                  (selectedChat.id || selectedChat._id) === conversationId;
                return {
                  ...conv,
                  lastMessage: {
                    content: message.content,
                    createdAt: message.createdAt,
                    sender: message.sender._id,
                  },
                  unreadCount: isCurrentChat ? 0 : (conv.unreadCount || 0) + 1,
                };
              }
              return conv;
            }),
          );
        });

        // Listen for message status updates
        socket.on("messageRead", (data) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if ((msg.id || msg._id) === data.messageId) {
                return {
                  ...msg,
                  readBy: [
                    ...(msg.readBy || []),
                    { user: data.readBy, readAt: data.readAt },
                  ],
                };
              }
              return msg;
            }),
          );
        });

        // Listen for typing indicators
        socket.on("user_typing", (data) => {
          if (
            selectedChat &&
            data.conversationId === (selectedChat.id || selectedChat._id)
          ) {
            // Show typing indicator (implement this UI state)
            console.log(`${data.username} is typing...`);
          }
        });

        socket.on("user_stopped_typing", (data) => {
          if (
            selectedChat &&
            data.conversationId === (selectedChat.id || selectedChat._id)
          ) {
            // Hide typing indicator
            console.log(`User stopped typing`);
          }
        });

        // Listen for online status changes
        socket.on("user_status_changed", (data) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            if (data.status === "online") {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });

          // Update conversation list with online status
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.participantId === data.userId) {
                return { ...conv, isOnline: data.status === "online" };
              }
              return conv;
            }),
          );
        });

        // Request current online status for conversation participants
        const participantIds = conversations
          .map((conv) => conv.participantId)
          .filter(Boolean);
        if (participantIds.length > 0) {
          socket.emit("get_online_status", participantIds);
        }

        // Listen for online status response
        socket.on("online_status_response", (onlineUserIds) => {
          setOnlineUsers(new Set(onlineUserIds));
        });

        return () => {
          socket.off("newMessage");
          socket.off("messageRead");
          socket.off("user_typing");
          socket.off("user_stopped_typing");
          socket.off("user_status_changed");
          socket.off("online_status_response");
          socketService.off("connectionStatusChanged", handleConnectionStatus);
        };
      }
    }
  }, [user, selectedChat]);

  // Polling fallback when Socket.IO is not available
  const startPollingFallback = () => {
    console.log("📡 Starting polling fallback for real-time features");

    const pollingInterval = setInterval(() => {
      if (selectedChat) {
        const conversationId = selectedChat.id || selectedChat._id;
        if (conversationId && !isSending) {
          // Silently refresh messages
          loadMessages(conversationId, true);
        }
      }
      // Refresh conversations list for new message indicators
      loadConversations(true);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollingInterval);
  };

  useEffect(() => {
    if (userIdToMessage && conversations.length > 0) {
      handleDirectMessage(userIdToMessage);
    }
  }, [userIdToMessage, conversations]);

  useEffect(() => {
    if (selectedChat) {
      const conversationId = selectedChat.id || selectedChat._id;
      if (conversationId) {
        loadMessages(conversationId);

        // Join the conversation room for real-time updates
        const socket = socketService.socket;
        if (socket && socket.connected) {
          socket.emit("join_conversation", conversationId);
        }
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    // Only scroll if new messages were added and user is near bottom
    if (
      messages.length > lastMessageCountRef.current &&
      lastMessageCountRef.current > 0
    ) {
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          150; // Increased threshold to be less aggressive
        if (isNearBottom) {
          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  // Get real online status from Socket.IO
  useEffect(() => {
    if (socketService.connected) {
      // Request initial online status
      conversations.forEach((conv) => {
        if (conv.isOnline) {
          setOnlineUsers((prev) => new Set([...prev, conv.participantId]));
        }
      });
    }
  }, [conversations, socketService.connected]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await messagingService.getConversations();

      // Ensure all conversations have both id and _id fields and remove duplicates
      const normalizedConversations = (data.conversations || []).map(
        (conv) => ({
          ...conv,
          id: conv.id || conv._id,
          _id: conv._id || conv.id,
        }),
      );

      // Remove duplicates based on ID
      const uniqueConversations = normalizedConversations.filter(
        (conv, index, arr) =>
          arr.findIndex((c) => c.id === conv.id || c._id === conv._id) ===
          index,
      );

      setConversations(uniqueConversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    if (!conversationId) {
      console.error("Cannot load messages: conversationId is required");
      return;
    }

    try {
      if (!silent) setIsLoadingMessages(true);
      const data = await messagingService.getMessages(conversationId);
      setMessages(data.messages || []);

      // Mark conversation as read
      await messagingService.markAsRead(conversationId);

      // Update conversation unread count locally
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId || conv._id === conversationId
            ? { ...conv, unreadCount: 0 }
>>>>>>> origin/main
            : conv,
        ),
      );
    } catch (error) {
<<<<<<< HEAD
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
=======
      console.error("Failed to load messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  const handleDirectMessage = async (userId) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv) =>
          conv.participantId === userId ||
          conv.participants?.some((p) => p._id === userId || p.id === userId),
      );

      if (existingConversation) {
        setSelectedChat(existingConversation);
        setShowMobileChat(true);
        return;
      }

      // Create new conversation
      const data = await messagingService.createConversation(userId);
      const newConversation = data.conversation;

      // Get user details for the conversation
      const userData = await messagingService.getUserById(userId);

      const formattedConversation = {
        ...newConversation,
        id: newConversation._id,
        participantName: getDisplayName(userData),
        participantAvatar: userData.avatar,
        participantId: userData._id,
        isOnline: userData.isOnline,
        lastMessage: null,
        unreadCount: 0,
      };

      setConversations((prev) => {
        // Remove any existing conversation with the same ID to prevent duplicates
        const filtered = prev.filter(
          (conv) =>
            conv.id !== formattedConversation.id &&
            conv._id !== formattedConversation.id &&
            conv.id !== formattedConversation._id &&
            conv._id !== formattedConversation._id,
        );
        return [formattedConversation, ...filtered];
      });
      setSelectedChat(formattedConversation);
      setShowMobileChat(true);

      // Clear the URL parameter
      navigate("/messages", { replace: true });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const users = await messagingService.searchUsers(searchQuery, 8);
      setSearchResults(users);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    const content = newMessage.trim();

    if (editingMessage) {
      // Handle message editing
      await handleEditMessageContent(content);
    } else {
      // Handle new message
      setNewMessage("");
      await handleSendMessageContent(content);
    }
  };

  const handleEditMessageContent = async (content) => {
    if (!editingMessage) return;

    const messageId = editingMessage.id || editingMessage._id;

    // Optimistically update message in UI
    setMessages((prev) =>
      prev.map((msg) =>
        (msg.id || msg._id) === messageId
          ? { ...msg, content, isEdited: true }
          : msg,
      ),
    );

    setNewMessage("");
    setEditingMessage(null);

    try {
      await messagingService.editMessage(messageId, content);

      toast({
        title: "Message edited",
        description: "Message was updated successfully",
      });
    } catch (error) {
      console.error("Failed to edit message:", error);

      // Restore original message on error
      setMessages((prev) =>
        prev.map((msg) =>
          (msg.id || msg._id) === messageId ? { ...editingMessage } : msg,
        ),
      );

      toast({
        title: "Error",
        description: "Failed to edit message. Please try again.",
        variant: "destructive",
      });
>>>>>>> origin/main
    }
  };

  const scrollToBottom = () => {
<<<<<<< HEAD
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
=======
    if (messagesContainerRef.current) {
      // Scroll within the messages container only, not the entire page
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
>>>>>>> origin/main
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
<<<<<<< HEAD
      sendMessage();
=======
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (selectedChat && socketService.connected) {
      const conversationId = selectedChat.id || selectedChat._id;

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing start
      socketService.socket.emit("typing_start", conversationId);

      // Stop typing after 1 second of no input
      typingTimeoutRef.current = setTimeout(() => {
        socketService.socket.emit("typing_stop", conversationId);
      }, 1000);
>>>>>>> origin/main
    }
  };

  const formatTime = (timestamp) => {
<<<<<<< HEAD
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
=======
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? "now" : `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
>>>>>>> origin/main
    } else {
      return date.toLocaleDateString();
    }
  };

<<<<<<< HEAD
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="h-screen bg-background flex">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 border-r bg-card flex flex-col",
          !showMobileConversations && "hidden md:flex",
=======
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStatus = (message) => {
    if (message.status === "sending") {
      return (
        <div className="h-3 w-3 rounded-full bg-muted-foreground animate-pulse" />
      );
    }

    if (message.sender?._id === user._id) {
      // Only show status for own messages
      if (message.readBy && message.readBy.length > 1) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      } else if (message.deliveredTo && message.deliveredTo.length > 0) {
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      } else {
        return <Check className="h-3 w-3 text-muted-foreground" />;
      }
    }

    return null;
  };

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  const handleStartNewChat = async (user) => {
    try {
      await handleDirectMessage(user._id || user.id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Failed to start new chat:", error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  const handleFileSelect = async (file, type) => {
    if (!selectedChat) return;

    try {
      setUploadingFile(true);

      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB

      let fileMessage;
      switch (type) {
        case "document":
          fileMessage = `📄 Document: ${fileName} (${fileSize}MB)`;
          break;
        case "archive":
          fileMessage = `🗂️ Archive: ${fileName} (${fileSize}MB)`;
          break;
        default:
          fileMessage = `📎 File: ${fileName} (${fileSize}MB)`;
      }

      await handleSendMessageContent(fileMessage);

      toast({
        title: "File sent",
        description: "File sent successfully",
      });
    } catch (error) {
      console.error("Failed to send file:", error);
      toast({
        title: "Error",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleImageSelect = async (file) => {
    if (!selectedChat) return;

    try {
      setUploadingFile(true);

      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB

      const imageMessage = `🖼️ Image: ${fileName} (${fileSize}MB)`;

      await handleSendMessageContent(imageMessage);

      toast({
        title: "Image sent",
        description: "Image sent successfully",
      });
    } catch (error) {
      console.error("Failed to send image:", error);
      toast({
        title: "Error",
        description: "Failed to send image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendMessageContent = async (content) => {
    if (!content.trim() || !selectedChat || isSending) return;

    const conversationId = selectedChat.id || selectedChat._id;
    if (!conversationId) {
      console.error("Cannot send message: conversation ID is missing");
      toast({
        title: "Error",
        description: "Invalid conversation. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);

      // Optimistically add message to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: content.trim(),
        sender: { _id: user._id, username: user.username },
        createdAt: new Date().toISOString(),
        status: "sending",
        replyTo: replyToMessage,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      const messageContent = content.trim();

      // Send message to backend
      const data = await messagingService.sendMessage(
        conversationId,
        messageContent,
      );

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...data.message, status: "sent" }
            : msg,
        ),
      );

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId || conv._id === conversationId
            ? {
                ...conv,
                lastMessage: {
                  content: messageContent,
                  createdAt: new Date().toISOString(),
                  sender: user._id,
                },
              }
            : conv,
        ),
      );

      // Clear reply state
      setReplyToMessage(null);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id),
      );

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (message) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    // Optimistically remove message from UI
    const messageId = message.id || message._id;
    setMessages((prev) =>
      prev.filter((msg) => (msg.id || msg._id) !== messageId),
    );

    try {
      await messagingService.deleteMessage(messageId);

      toast({
        title: "Message deleted",
        description: "Message was deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete message:", error);

      // Restore message on error
      setMessages((prev) => {
        const updated = [...prev];
        const index = prev.findIndex(
          (msg) => new Date(msg.createdAt) > new Date(message.createdAt),
        );
        if (index === -1) {
          updated.push(message);
        } else {
          updated.splice(index, 0, message);
        }
        return updated;
      });

      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    // Focus on input after state update
    setTimeout(() => {
      const input = document.querySelector(
        'input[placeholder*="Edit message"]',
      );
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 100);
  };

  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
  };

  const handleReactToMessage = (messageId, emoji) => {
    // For now, just show a toast
    toast({
      title: "Reaction sent",
      description: `Reacted with ${emoji}`,
    });
  };

  const handleDeleteConversation = async (conversation) => {
    try {
      // Add API call here when backend supports it
      setConversations((prev) =>
        prev.filter(
          (conv) =>
            (conv.id || conv._id) !== (conversation.id || conversation._id),
        ),
      );

      if (
        selectedChat &&
        (selectedChat.id || selectedChat._id) ===
          (conversation.id || conversation._id)
      ) {
        setSelectedChat(null);
        setShowMobileChat(false);
      }

      toast({
        title: "Conversation deleted",
        description: "Conversation was deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMuteConversation = async (conversation) => {
    try {
      setConversations((prev) =>
        prev.map((conv) =>
          (conv.id || conv._id) === (conversation.id || conversation._id)
            ? { ...conv, isMuted: !conv.isMuted }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to mute conversation:", error);
    }
  };

  const handlePinConversation = async (conversation) => {
    try {
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          (conv.id || conv._id) === (conversation.id || conversation._id)
            ? { ...conv, isPinned: !conv.isPinned }
            : conv,
        );

        // Sort: pinned first, then by last message date
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
          );
        });
      });
    } catch (error) {
      console.error("Failed to pin conversation:", error);
    }
  };

  const handleArchiveConversation = async (conversation) => {
    try {
      setConversations((prev) =>
        prev.map((conv) =>
          (conv.id || conv._id) === (conversation.id || conversation._id)
            ? { ...conv, isArchived: !conv.isArchived }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to archive conversation:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.participantName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-4rem)] bg-background flex">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r bg-card flex flex-col",
          showMobileChat && "hidden md:flex",
>>>>>>> origin/main
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
<<<<<<< HEAD
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
=======
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowNewMessageModal(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
>>>>>>> origin/main
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
<<<<<<< HEAD
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
=======
              placeholder="Search conversations or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-0"
>>>>>>> origin/main
            />
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="border-b bg-muted/20 p-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
              People
            </h3>
            {searchResults.slice(0, 3).map((user, index) => (
              <button
                key={`search-user-${user._id || user.id || index}`}
                onClick={() => handleStartNewChat(user)}
                className="w-full p-2 text-left hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {getDisplayName(user)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

>>>>>>> origin/main
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
<<<<<<< HEAD
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-pulse"
                >
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
=======
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
>>>>>>> origin/main
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
<<<<<<< HEAD
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">
                Start a conversation by messaging someone!
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p) => p.id !== user?.id,
              );
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors border-b",
                    isSelected && "bg-muted",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback>
                          {otherParticipant?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {otherParticipant?.isOnline && (
=======
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <p>
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Start messaging someone!"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <div
                key={`conversation-${conversation.id || conversation._id}-${index}`}
                className={cn(
                  "group w-full border-b hover:bg-muted/50 transition-colors relative",
                  selectedChat?.id === conversation.id && "bg-muted",
                )}
              >
                <div
                  onClick={() => handleChatSelect(conversation)}
                  className="w-full p-4 text-left cursor-pointer"
                  onDoubleClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-3">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/users/${conversation.participantId}`);
                      }}
                      className="relative hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.participantAvatar} />
                        <AvatarFallback>
                          {conversation.participantName?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(conversation.participantId) && (
>>>>>>> origin/main
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
<<<<<<< HEAD
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {otherParticipant?.name || "Unknown User"}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
=======
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {conversation.isPinned && (
                            <Pin className="h-3 w-3 text-muted-foreground" />
                          )}
                          {conversation.isMuted && (
                            <VolumeX className="h-3 w-3 text-muted-foreground" />
                          )}
                          <h3 className="font-medium truncate">
                            {conversation.participantName || "Unknown User"}
                          </h3>
                        </div>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm truncate",
                            conversation.unreadCount > 0
                              ? "text-foreground font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {conversation.lastMessage?.content ||
                            "Start a conversation"}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversation Context Menu */}
                <div className="absolute top-2 right-2">
                  <ConversationContextMenu
                    conversation={conversation}
                    onDelete={handleDeleteConversation}
                    onMute={handleMuteConversation}
                    onPin={handlePinConversation}
                    onArchive={handleArchiveConversation}
                  />
                </div>
              </div>
            ))
>>>>>>> origin/main
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Messages Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          showMobileConversations && "hidden md:flex",
        )}
      >
        {selectedConversation ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setShowMobileConversations(true)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  {(() => {
                    const otherParticipant =
                      selectedConversation.participants.find(
                        (p) => p.id !== user?.id,
                      );
                    return (
                      <>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>
                            {otherParticipant?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold">
                            {otherParticipant?.name || "Unknown User"}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {otherParticipant?.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
=======
      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          !showMobileChat && "hidden md:flex",
        )}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <button
                  onClick={() =>
                    navigate(`/users/${selectedChat.participantId}`)
                  }
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChat.participantAvatar} />
                      <AvatarFallback>
                        {selectedChat.participantName?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(selectedChat.participantId) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="text-left">
                    <h2 className="font-semibold">
                      {selectedChat.participantName || "Unknown User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {onlineUsers.has(selectedChat.participantId)
                        ? "Active now"
                        : "Offline"}
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() =>
                    toast({
                      title: "Voice call",
                      description: "Voice call feature coming soon!",
                    })
                  }
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() =>
                    toast({
                      title: "Video call",
                      description: "Video call feature coming soon!",
                    })
                  }
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
>>>>>>> origin/main
              </div>
            </div>

            {/* Messages */}
<<<<<<< HEAD
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isOwn ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
=======
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-12rem)]"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender?._id === user._id;
                  const prevMessage = messages[index - 1];
                  const showAvatar =
                    !prevMessage ||
                    prevMessage.sender?._id !== message.sender?._id;

                  return (
                    <div
                      key={`message-${message.id || message._id || index}`}
                      className={cn(
                        "group flex items-end gap-2",
                        isOwn ? "justify-end" : "justify-start",
                      )}
                    >
                      {!isOwn && showAvatar && (
                        <button
                          onClick={() =>
                            navigate(`/users/${selectedChat.participantId}`)
                          }
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedChat.participantAvatar} />
                            <AvatarFallback className="text-xs">
                              {selectedChat.participantName?.[0]?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      )}
                      {!isOwn && !showAvatar && <div className="w-6" />}

                      <div className="flex items-center gap-1">
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words relative",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md",
                          )}
                        >
                          {/* Reply indicator */}
                          {message.replyTo && (
                            <div
                              className={cn(
                                "text-xs opacity-70 mb-1 p-2 rounded border-l-2",
                                isOwn
                                  ? "border-primary-foreground/30"
                                  : "border-muted-foreground/30",
                              )}
                            >
                              Replying to:{" "}
                              {message.replyTo.content?.substring(0, 50)}...
                            </div>
                          )}

                          <p className="text-sm">{message.content}</p>
                          <div
                            className={cn(
                              "flex items-center justify-end mt-1 gap-1",
                              isOwn
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground",
                            )}
                          >
                            <span className="text-xs">
                              {formatMessageTime(message.createdAt)}
                              {message.isEdited && (
                                <span className="ml-1 opacity-70">
                                  (edited)
                                </span>
                              )}
                            </span>
                            {getMessageStatus(message)}
                          </div>
                        </div>

                        {/* Message actions */}
                        <MessageContextMenu
                          message={message}
                          isOwn={isOwn}
                          onDelete={handleDeleteMessage}
                          onEdit={handleEditMessage}
                          onReply={handleReplyToMessage}
                          onReact={handleReactToMessage}
                        />
                      </div>
                    </div>
                  );
                })
              )}
>>>>>>> origin/main
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
<<<<<<< HEAD
              <div className="flex items-end space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">
                Welcome to Messages
              </h2>
              <p className="text-muted-foreground">
                Select a conversation to start messaging
              </p>
=======
              {/* Reply/Edit indicator */}
              {replyToMessage && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Replying to</p>
                    <p className="text-sm truncate">{replyToMessage.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setReplyToMessage(null)}
                  >
                    ×
                  </Button>
                </div>
              )}

              {editingMessage && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Editing message
                    </p>
                    <p className="text-sm truncate">{editingMessage.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage("");
                    }}
                  >
                    ×
                  </Button>
                </div>
              )}

              <div className="flex items-end gap-3">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  disabled={uploadingFile || isSending}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    className="rounded-full cursor-pointer hover:bg-muted flex items-center justify-center h-8 w-8"
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </div>
                </FileUpload>

                <div className="flex-1 bg-muted rounded-full flex items-center px-4 py-2">
                  <Input
                    placeholder={
                      editingMessage ? "Edit message..." : "Message..."
                    }
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    disabled={isSending || uploadingFile}
                    className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 ml-2">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    {!newMessage.trim() && !uploadingFile && (
                      <ImageUpload
                        onImageSelect={handleImageSelect}
                        disabled={uploadingFile || isSending}
                      />
                    )}
                  </div>
                </div>

                {newMessage.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || uploadingFile}
                    size="icon"
                    className="rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleSendMessageContent("❤️")}
                    disabled={isSending || uploadingFile}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {uploadingFile && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                  Uploading file...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center bg-muted/20">
            <div className="max-w-md px-8">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your Messages</h2>
              <p className="text-muted-foreground mb-6">
                Send private messages to fellow writers, share ideas, and build
                meaningful connections.
              </p>
              <Button onClick={() => setShowNewMessageModal(true)}>
                Message
              </Button>
>>>>>>> origin/main
            </div>
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

      <NewMessageModal
        open={showNewMessageModal}
        onOpenChange={setShowNewMessageModal}
        onStartConversation={handleDirectMessage}
      />
>>>>>>> origin/main
    </div>
  );
};

export default Messages;
