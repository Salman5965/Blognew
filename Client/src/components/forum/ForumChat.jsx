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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker from "@/components/shared/EmojiPicker";

const ForumChat = ({ channel, onToggleSidebar }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user } = useAuthContext();

  // Mock messages for the channel
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        user: {
          id: "user1",
          name: "Alex Chen",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
          role: "Moderator",
          isOnline: true,
        },
        content: `Welcome to #${channel.name}! 🎉 This is where we discuss ${channel.description.toLowerCase()}. Feel free to ask questions and share your knowledge!`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        reactions: [
          { emoji: "👋", count: 12, users: ["user2", "user3"] },
          { emoji: "🎉", count: 8, users: ["user4"] },
        ],
        isPinned: true,
      },
      {
        id: 2,
        user: {
          id: "user2",
          name: "Sarah Johnson",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
          role: "Developer",
          isOnline: true,
        },
        content:
          "Hey everyone! Just wanted to share this awesome article I found about React performance optimization. Has anyone tried these techniques?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        reactions: [
          { emoji: "👍", count: 5, users: ["user1"] },
          { emoji: "🔥", count: 3, users: ["user3"] },
        ],
      },
      {
        id: 3,
        user: {
          id: "user3",
          name: "Mike Torres",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
          role: "Senior Dev",
          isOnline: false,
        },
        content:
          "Sarah that article is fantastic! I've been using some of those techniques in production and saw a 40% performance improvement. Especially the memo() and useMemo() optimizations.",
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        reactions: [{ emoji: "💯", count: 7, users: ["user1", "user2"] }],
      },
      {
        id: 4,
        user: {
          id: "user4",
          name: "Emma Wilson",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
          role: "Designer",
          isOnline: true,
        },
        content:
          "This is super helpful! I'm working on a React project and was wondering about performance. Does anyone have experience with React.lazy() for code splitting?",
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        reactions: [],
      },
      {
        id: 5,
        user: {
          id: "user1",
          name: "Alex Chen",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
          role: "Moderator",
          isOnline: true,
        },
        content:
          "Emma, React.lazy() is amazing for code splitting! Here's a quick example:\n\n```jsx\nconst LazyComponent = React.lazy(() => import('./Component'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <LazyComponent />\n    </Suspense>\n  );\n}\n```\n\nIt really helps with initial bundle size!",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        reactions: [
          { emoji: "🙌", count: 6, users: ["user4"] },
          { emoji: "❤️", count: 4, users: ["user2", "user3"] },
        ],
      },
      {
        id: 6,
        user: {
          id: "user5",
          name: "David Kim",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
          role: "Student",
          isOnline: true,
        },
        content:
          "Thank you Alex! That's exactly what I needed. Quick question - what's the best way to handle error boundaries with lazy loading?",
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        reactions: [],
      },
    ];
    setMessages(mockMessages);
  }, [channel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        avatar: user.avatar,
        role: "Member",
        isOnline: true,
      },
      content: message,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId, emoji) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
          if (existingReaction) {
            if (existingReaction.users.includes(user.id)) {
              // Remove reaction
              return {
                ...msg,
                reactions: msg.reactions
                  .map((r) =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          count: r.count - 1,
                          users: r.users.filter((u) => u !== user.id),
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
                    ? { ...r, count: r.count + 1, users: [...r.users, user.id] }
                    : r,
                ),
              };
            }
          } else {
            // New reaction
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                { emoji, count: 1, users: [user.id] },
              ],
            };
          }
        }
        return msg;
      }),
    );
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
            <h2 className="font-semibold">{channel.name}</h2>
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
        {messages.map((msg, index) => {
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
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${channel.name}`}
              className="pr-20"
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

          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumChat;
