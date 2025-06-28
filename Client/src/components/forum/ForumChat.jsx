import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Hash,
  Users,
  Pin,
  Search,
  Menu,
  Heart,
  MessageCircle,
  Share,
  Flag,
  Reply,
  Edit,
  Trash2,
  User,
  Code,
  Image as ImageIcon,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker from "@/components/shared/EmojiPicker";
import socketService from "@/services/socketService";
import forumService from "@/services/forumService";

const ForumChat = ({ channel, onToggleSidebar }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuthContext();

  // Initialize real-time chat functionality
  useEffect(() => {
    if (!channel || !user) return;

    setIsLoading(true);

    // Connect to socket if not connected
    if (!socketService.connected) {
      socketService.connect();
    }

    // Load initial messages
    const loadMessages = async () => {
      try {
        const data = await forumService.getChannelMessages(
          channel.id || channel._id,
        );
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Join the channel
    socketService.joinChannel(channel.id || channel._id);

    // Socket event listeners
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleMessageReaction = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId || msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg,
        ),
      );
    };

    const handleUserTyping = (data) => {
      if (
        data.userId !== user.id &&
        data.channelId === (channel.id || channel._id)
      ) {
        setTypingUsers((prev) =>
          prev.includes(data.username) ? prev : [...prev, data.username],
        );
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.channelId === (channel.id || channel._id)) {
        setTypingUsers((prev) =>
          prev.filter((username) => username !== data.username),
        );
      }
    };

    const handleConnectionStatus = (status) => {
      setSocketConnected(status === "connected");
    };

    // Register socket listeners
    socketService.on("new_message", handleNewMessage);
    socketService.on("message_reaction", handleMessageReaction);
    socketService.on("user_typing", handleUserTyping);
    socketService.on("user_stopped_typing", handleUserStoppedTyping);
    socketService.on("connectionStatusChanged", handleConnectionStatus);

    // Check initial connection status
    setSocketConnected(socketService.connected);

    // Cleanup
    return () => {
      socketService.off("new_message", handleNewMessage);
      socketService.off("message_reaction", handleMessageReaction);
      socketService.off("user_typing", handleUserTyping);
      socketService.off("user_stopped_typing", handleUserStoppedTyping);
      socketService.off("connectionStatusChanged", handleConnectionStatus);
      socketService.leaveChannel(channel.id || channel._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [channel, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !socketConnected) return;

    const messageData = {
      content: message,
      type: "text",
      channelId: channel.id || channel._id,
    };

    try {
      // Send via socket for real-time
      socketService.sendMessage(channel.id || channel._id, messageData);

      // Also send via API for persistence
      await forumService.sendMessage(channel.id || channel._id, messageData);

      // Clear message input
      setMessage("");
      setShowEmojiPicker(false);

      // Stop typing indicator
      socketService.stopTyping(channel.id || channel._id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Fallback: add message locally if socket/API fails
      const fallbackMessage = {
        id: Date.now(),
        user: {
          id: user.id || user._id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username ||
            "User",
          avatar: user.avatar,
          role: "Member",
          isOnline: true,
        },
        content: message,
        timestamp: new Date(),
        reactions: [],
        isLocal: true, // Mark as local message
      };

      setMessages((prev) => [...prev, fallbackMessage]);
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!socketConnected) return;

    // Start typing indicator
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(channel.id || channel._id);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(channel.id || channel._id);
    }, 2000);

    // Stop typing immediately if message is empty
    if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
      socketService.stopTyping(channel.id || channel._id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      // Send reaction via socket for real-time update
      socketService.addReaction(messageId, emoji);

      // Also send via API for persistence
      await forumService.addReaction(messageId, emoji);
    } catch (error) {
      console.error("Failed to add reaction:", error);

      // Fallback: update locally
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId || msg._id === messageId) {
            const userId = user.id || user._id;
            const existingReaction = msg.reactions?.find(
              (r) => r.emoji === emoji,
            );

            if (existingReaction) {
              if (existingReaction.users.includes(userId)) {
                // Remove reaction
                return {
                  ...msg,
                  reactions: msg.reactions
                    .map((r) =>
                      r.emoji === emoji
                        ? {
                            ...r,
                            count: r.count - 1,
                            users: r.users.filter((u) => u !== userId),
                          }
                        : r,
                    )
                    .filter((r) => r.count > 0),
                };
              } else {
                // Add reaction
                return {
                  ...msg,
                  reactions: msg.reactions.map((r) =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          count: r.count + 1,
                          users: [...r.users, userId],
                        }
                      : r,
                  ),
                };
              }
            } else {
              // New reaction
              return {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  { emoji, count: 1, users: [userId] },
                ],
              };
            }
          }
          return msg;
        }),
      );
    }
  };

  const formatMessageContent = (content) => {
    // Simple code block formatting
    if (content.includes("```")) {
      const parts = content.split("```");
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre
              key={index}
              className="bg-muted p-3 rounded-md my-2 overflow-x-auto"
            >
              <code className="text-sm">{part}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    return content;
  };

  const Icon = channel.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold">{channel.name}</h2>
              {socketConnected ? (
                <Wifi className="h-4 w-4 text-green-500" title="Connected" />
              ) : (
                <WifiOff
                  className="h-4 w-4 text-red-500"
                  title="Disconnected"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {channel.description}
            </p>
          </div>
          {channel.pinned && <Pin className="h-4 w-4 text-yellow-500" />}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Loading messages...
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading &&
          messages.map((msg, index) => {
            const showAvatar =
              index === 0 || messages[index - 1].user.id !== msg.user.id;
            const timeDiff =
              index > 0 ? msg.timestamp - messages[index - 1].timestamp : 0;
            const showTimestamp = timeDiff > 5 * 60 * 1000; // 5 minutes

            return (
              <div key={msg.id} className="group">
                {showTimestamp && (
                  <div className="text-center text-xs text-muted-foreground my-4">
                    {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                  </div>
                )}

                <div className={`flex space-x-3 ${!showAvatar ? "ml-12" : ""}`}>
                  {showAvatar && (
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.user.avatar} />
                        <AvatarFallback>
                          {msg.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {msg.user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {msg.user.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {msg.user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(msg.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                        {msg.isPinned && (
                          <Pin className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    )}

                    <div className="text-sm leading-relaxed">
                      {formatMessageContent(msg.content)}
                    </div>

                    {/* Reactions */}
                    {msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => addReaction(msg.id, reaction.emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                              reaction.users.includes(user.id)
                                ? "bg-primary/20 text-primary"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addReaction(msg.id, "👍")}
                        className="h-6 w-6 p-0"
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Reply className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Share className="h-3 w-3" />
                      </Button>
                      {msg.user.id === user.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              <div
                className="w-2 h-2 bg-current rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 bg-current rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <span>
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${channel.name}`}
              className="pr-20"
              disabled={!socketConnected}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !socketConnected}
            title={
              !socketConnected
                ? "Disconnected - cannot send messages"
                : "Send message"
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumChat;
