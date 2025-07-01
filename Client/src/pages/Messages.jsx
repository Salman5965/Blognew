import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  MoreHorizontal,
  ArrowLeft,
  Check,
  CheckCheck,
  Plus,
  Heart,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getDisplayName, getInitials } from "@/utils/userUtils";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock conversations data (will be replaced with real API calls)
  const [conversations, setConversations] = useState([
    {
      id: 1,
      user: {
        id: 2,
        username: "sarah_writes",
        firstName: "Sarah",
        lastName: "Johnson",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
        isOnline: true,
      },
      lastMessage: {
        content: "That's a great story idea! 😊",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isRead: false,
      },
      unreadCount: 2,
    },
    {
      id: 2,
      user: {
        id: 3,
        username: "mike_blogger",
        firstName: "Mike",
        lastName: "Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      },
      lastMessage: {
        content: "Thanks for the feedback on my article",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      id: 3,
      user: {
        id: 4,
        username: "emma_writer",
        firstName: "Emma",
        lastName: "Rodriguez",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isOnline: true,
      },
      lastMessage: {
        content: "Would love to collaborate!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: true,
      },
      unreadCount: 0,
    },
  ]);

  // Mock messages for selected chat
  const mockMessages = [
    {
      id: 1,
      content: "Hey! How's your latest blog post coming along?",
      senderId: 2,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "read",
    },
    {
      id: 2,
      content:
        "It's going great! Just finished the first draft. Thanks for asking 😊",
      senderId: user?.id,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: "read",
    },
    {
      id: 3,
      content: "That's awesome! I'd love to read it when you're ready to share",
      senderId: 2,
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      status: "read",
    },
    {
      id: 4,
      content:
        "I have this idea about adding more interactive elements to make it engaging",
      senderId: user?.id,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: "read",
    },
    {
      id: 5,
      content: "That's a great story idea! 😊",
      senderId: 2,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: "delivered",
    },
  ];

  useEffect(() => {
    if (selectedChat) {
      setMessages(mockMessages);
      scrollToBottom();
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: Date.now(),
      content: newMessage.trim(),
      senderId: user?.id,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedChat.id
          ? {
              ...conv,
              lastMessage: {
                content: message.content,
                timestamp: message.timestamp,
                isRead: false,
              },
            }
          : conv,
      ),
    );

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "delivered" } : msg,
        ),
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "read" } : msg,
        ),
      );
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? "now" : `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const formatMessageTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    setShowMobileChat(true);

    // Mark messages as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id
          ? {
              ...conv,
              unreadCount: 0,
              lastMessage: { ...conv.lastMessage, isRead: true },
            }
          : conv,
      ),
    );
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r bg-card flex flex-col",
          showMobileChat && "hidden md:flex",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleChatSelect(conversation)}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50 transition-colors border-b",
                  selectedChat?.id === conversation.id && "bg-muted",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>
                        {getInitials(
                          conversation.user.firstName,
                          conversation.user.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">
                        {getDisplayName(conversation.user)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          "text-sm truncate",
                          conversation.lastMessage.isRead
                            ? "text-muted-foreground"
                            : "text-foreground font-medium",
                        )}
                      >
                        {conversation.lastMessage.content}
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
              </button>
            ))
          )}
        </div>
      </div>

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

                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.user.avatar} />
                    <AvatarFallback>
                      {getInitials(
                        selectedChat.user.firstName,
                        selectedChat.user.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold">
                    {getDisplayName(selectedChat.user)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.user.isOnline
                      ? "Active now"
                      : selectedChat.user.lastSeen
                        ? `Active ${formatTime(selectedChat.user.lastSeen)} ago`
                        : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.senderId === user?.id;
                const prevMessage = messages[index - 1];
                const showAvatar =
                  !prevMessage || prevMessage.senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end gap-2",
                      isOwn ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isOwn && showAvatar && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedChat.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            selectedChat.user.firstName,
                            selectedChat.user.lastName,
                          )}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isOwn && !showAvatar && <div className="w-6" />}

                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                      )}
                    >
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
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {isOwn && getMessageStatus(message.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>

                <div className="flex-1 bg-muted rounded-full flex items-center px-4 py-2">
                  <Input
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    {!newMessage.trim() && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {newMessage.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Heart className="h-5 w-5" />
                  </Button>
                )}
              </div>
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
              <Button onClick={() => navigate("/explore")}>
                Find People to Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
