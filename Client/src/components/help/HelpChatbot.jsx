import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const HelpChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState("initial");
  const messagesEndRef = useRef(null);

  const botPersonality = {
    name: "BlogBot",
    avatar: "🤖",
    responses: {
      greeting: [
        "Hi there! 👋 I'm BlogBot, your friendly BlogHub assistant. How can I help you today?",
        "Welcome to BlogHub! I'm here to help you with any questions you might have. What would you like to know?",
        "Hello! I'm BlogBot, ready to assist you with BlogHub. What can I help you with?",
      ],
      help_topics: [
        "I can help you with several things:\n\n📝 **Writing & Publishing**\n- Creating your first blog post\n- Using the editor\n- Publishing and managing posts\n\n👥 **Account & Profile**\n- Setting up your profile\n- Privacy settings\n- Account management\n\n🎯 **Community**\n- Joining discussions\n- Following other bloggers\n- Community guidelines\n\n🔧 **Technical Support**\n- Troubleshooting issues\n- Feature questions\n- Bug reports\n\nWhat would you like to explore?",
      ],
      writing_help: [
        "Great choice! Here's how to get started with writing on BlogHub:\n\n**Creating Your First Post:**\n1. Click the 'Write' button in the top navigation\n2. Add a compelling title\n3. Use our rich text editor to write your content\n4. Add tags to help others find your post\n5. Preview your post\n6. Hit 'Publish' when ready!\n\n**Pro Tips:**\n✨ Use headers to structure your content\n📸 Add images to make your posts engaging\n🏷️ Use relevant tags for better discoverability\n\nNeed help with anything specific about writing?",
      ],
      community_help: [
        "The BlogHub community is amazing! Here's how to get involved:\n\n**Joining Discussions:**\n- Visit the Community Forum\n- Browse different channels like #general-chat, #frontend, #help\n- Jump into conversations that interest you\n\n**Following & Connecting:**\n- Follow bloggers you find interesting\n- Like and comment on posts you enjoy\n- Share your own insights and experiences\n\n**Community Guidelines:**\n- Be respectful and inclusive\n- Help others learn and grow\n- Share quality, relevant content\n- Use appropriate channels for your topics\n\nWant to know more about any specific aspect?",
      ],
      technical_help: [
        "I'm here to help with technical issues! Common solutions:\n\n**Can't upload images?**\n- Check file size (max 5MB)\n- Use supported formats (JPEG, PNG, WebP)\n- Clear your browser cache\n\n**Posts not showing in search?**\n- Make sure your post is published\n- Add relevant tags and descriptions\n- Wait a few minutes for indexing\n\n**Account issues?**\n- Try logging out and back in\n- Check your email for verification links\n- Clear browser cookies\n\nStill having issues? Describe your problem and I'll help troubleshoot!",
      ],
      farewell: [
        "You're welcome! 😊 Feel free to come back anytime if you need more help. Happy blogging!",
        "Glad I could help! 🎉 Don't hesitate to reach out if you have more questions. Enjoy using BlogHub!",
        "My pleasure! 👍 Remember, I'm always here if you need assistance. Have a great day!",
      ],
    },
  };

  const quickReplies = [
    { text: "How do I write a blog post?", action: "writing_help" },
    { text: "Join the community", action: "community_help" },
    { text: "Technical support", action: "technical_help" },
    { text: "Account settings", action: "account_help" },
    { text: "Contact human support", action: "human_support" },
  ];

  const initialMessage = {
    id: 1,
    type: "bot",
    content: botPersonality.responses.greeting[0],
    timestamp: new Date(),
    quickReplies: quickReplies,
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = (callback) => {
    setIsTyping(true);
    setTimeout(
      () => {
        setIsTyping(false);
        callback();
      },
      1000 + Math.random() * 1000,
    );
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("write") ||
      message.includes("blog") ||
      message.includes("post") ||
      message.includes("publish")
    ) {
      return botPersonality.responses.writing_help[0];
    }

    if (
      message.includes("community") ||
      message.includes("forum") ||
      message.includes("follow") ||
      message.includes("discussion")
    ) {
      return botPersonality.responses.community_help[0];
    }

    if (
      message.includes("technical") ||
      message.includes("problem") ||
      message.includes("issue") ||
      message.includes("bug") ||
      message.includes("error")
    ) {
      return botPersonality.responses.technical_help[0];
    }

    if (
      message.includes("thank") ||
      message.includes("bye") ||
      message.includes("goodbye")
    ) {
      return botPersonality.responses.farewell[
        Math.floor(Math.random() * botPersonality.responses.farewell.length)
      ];
    }

    if (message.includes("help") || message === "") {
      return botPersonality.responses.help_topics[0];
    }

    // Default response with helpful suggestions
    return `I understand you're asking about "${userMessage}". Let me help you with that!\n\n${botPersonality.responses.help_topics[0]}`;
  };

  const handleSendMessage = (messageText = currentMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate bot typing and response
    simulateTyping(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: getBotResponse(messageText),
        timestamp: new Date(),
        quickReplies:
          messageText.toLowerCase().includes("thank") ||
          messageText.toLowerCase().includes("bye")
            ? []
            : [
                { text: "Ask another question", action: "continue" },
                { text: "Contact human support", action: "human_support" },
                { text: "Start over", action: "restart" },
              ],
      };

      setMessages((prev) => [...prev, botResponse]);
    });
  };

  const handleQuickReply = (reply) => {
    if (reply.action === "restart") {
      setMessages([initialMessage]);
      return;
    }

    if (reply.action === "human_support") {
      const humanSupportMessage = {
        id: Date.now(),
        type: "bot",
        content:
          "I'll connect you with our human support team! 👨‍💼\n\nYou can reach them through:\n📧 **Email:** support@bloghub.com\n💬 **Live Chat:** Available 24/7 (look for the chat widget)\n📞 **Response Time:** Usually within 24 hours\n\nThey'll be happy to help with more complex issues!",
        timestamp: new Date(),
        quickReplies: [
          { text: "Ask another question", action: "continue" },
          { text: "Start over", action: "restart" },
        ],
      };
      setMessages((prev) => [...prev, humanSupportMessage]);
      return;
    }

    handleSendMessage(reply.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([initialMessage]);
    setCurrentMessage("");
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        aria-label="Open help chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]",
      )}
    >
      <Card className="h-full flex flex-col shadow-2xl border-2">
        {/* Header */}
        <CardHeader className="p-4 bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-8 w-8 bg-primary-foreground/20">
                  <AvatarFallback className="text-primary text-lg">
                    {botPersonality.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-primary-foreground rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold">{botPersonality.name}</h3>
                <p className="text-xs text-primary-foreground/80">
                  {isTyping
                    ? "Typing..."
                    : "Online • Usually replies instantly"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetChat}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label="Reset chat"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.type === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-4"
                        : "bg-background border mr-4",
                    )}
                  >
                    {message.type === "bot" && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{botPersonality.avatar}</span>
                        <span className="font-medium text-sm">
                          {botPersonality.name}
                        </span>
                      </div>
                    )}

                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Quick Replies */}
                    {message.quickReplies &&
                      message.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.quickReplies.map((reply, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickReply(reply)}
                              className="text-xs h-7 rounded-full"
                            >
                              {reply.text}
                            </Button>
                          ))}
                        </div>
                      )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border rounded-2xl px-4 py-2 mr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{botPersonality.avatar}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim() || isTyping}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center mt-2">
                <Badge variant="outline" className="text-xs">
                  Powered by BlogBot AI • Instant responses
                </Badge>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default HelpChatbot;
