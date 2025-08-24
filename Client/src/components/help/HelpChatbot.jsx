
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
  Settings,
  Download,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Utility function to concatenate class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

const HelpChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userSatisfaction, setUserSatisfaction] = useState(null);
  const [chatRating, setChatRating] = useState(null);
  const messagesEndRef = useRef(null);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const botPersonality = {
    name: "VoiceBot",
    avatar: "🎙️",
    responses: {
      greeting: [
        "Hi there! 👋 I'm VoiceBot, your friendly SilentVoice assistant. I can help you with blogs, stories, and everything in between! How can I assist you today?",
        "Welcome to SilentVoice! I'm here to help you with blogging, storytelling, and all platform features. What would you like to explore?",
        "Hello! I'm VoiceBot, ready to assist you with SilentVoice. Whether it's writing, stories, or technical help - I've got you covered!",
      ],
      help_topics: [
        "I can help you with several things:\n\n📝 **Blog Writing & Publishing**\n- Creating your first blog post\n- Using the rich text editor\n- Publishing and managing posts\n- SEO optimization tips\n\n📚 **Stories Section**\n- Share life lessons & experiences\n- Upload video, audio, or written stories\n- Entertainment content creation\n- Story formatting best practices\n\n👥 **Account & Profile**\n- Setting up your profile\n- Privacy settings\n- Account management\n- Notification preferences\n\n🎯 **Community & Engagement**\n- Joining discussions\n- Following other creators\n- Community guidelines\n- Building your audience\n\n🔧 **Technical Support**\n- Upload troubleshooting\n- Platform navigation\n- Feature questions\n- Performance issues\n\n💡 **Content Strategy**\n- Growing your audience\n- Content planning\n- Engagement tips\n- Analytics insights\n\nWhat would you like to explore?",
      ],
      stories_help: [
        "Great choice! The Stories section is perfect for sharing meaningful content:\n\n📚 **What You Can Share:**\n- Life lessons and personal experiences\n- Educational content and tutorials\n- Entertainment stories and narratives\n- Motivational and inspirational content\n- Creative fiction and storytelling\n\n🎥 **Content Formats Supported:**\n- **Video Stories:** MP4, MOV, AVI (max 500MB)\n- **Audio Stories:** MP3, WAV, M4A (max 100MB)\n- **Written Stories:** Rich text with images\n- **Mixed Media:** Combine text, audio, and visuals\n\n✨ **Creating Your First Story:**\n1. Navigate to Stories section\n2. Click 'Share Your Story'\n3. Choose your format (video/audio/written)\n4. Add engaging title and description\n5. Select appropriate categories and tags\n6. Upload your content or write directly\n7. Add thumbnail for video/audio content\n8. Preview and publish\n\n🎯 **Best Practices:**\n- Keep stories engaging with clear narrative\n- Use compelling thumbnails for media content\n- Add captions/transcripts for accessibility\n- Tag appropriately: #LifeLessons #Entertainment #Education\n- Engage with comments and feedback\n- Cross-promote with your blog posts\n\n📊 **Story Analytics:**\n- View play/read counts\n- Track engagement metrics\n- See audience retention for media\n- Monitor comments and shares\n\nNeed help with any specific aspect of story creation?",
      ],
      writing_help: [
        "Perfect! Here's how to get started with blogging on SilentVoice:\n\n**Creating Your First Blog Post:**\n1. Click the 'Write' button in the top navigation\n2. Add a compelling title that grabs attention\n3. Use our rich text editor with markdown support\n4. Add relevant tags (3-5 works best)\n5. Upload a featured image (recommended: 1200x630px)\n6. Preview your post to check formatting\n7. Schedule or publish immediately\n\n**Blog vs Stories - When to Use What:**\n📝 **Blogs:** For detailed articles, tutorials, opinions, and professional content\n📚 **Stories:** For personal experiences, life lessons, entertainment, and multimedia content\n\n**Pro Blogging Tips:**\n✨ Use headers (H2, H3) to structure your content\n📸 Add alt text to images for accessibility\n🏷️ Research trending tags in your niche\n📊 Use analytics to track performance\n💬 Engage with readers in comments\n🔗 Cross-reference your stories in blog posts\n\n**Editor Features:**\n- Auto-save every 30 seconds\n- Distraction-free writing mode\n- Word count and reading time\n- Collaborative editing\n- Rich media embedding\n- Code syntax highlighting\n\nNeed help with anything specific about blogging or want to learn about stories?",
      ],
      community_help: [
        "The SilentVoice community is amazing! Here's how to get involved:\n\n**Joining Discussions:**\n- Visit the Community Forum (beta.silentvoice.com/community)\n- Browse channels: #general-chat, #frontend, #backend, #design, #help\n- Use the search to find specific topics\n- Join live discussions in #daily-standup\n\n**Following & Connecting:**\n- Follow bloggers and storytellers whose content resonates\n- Like, share, and thoughtfully comment on posts/stories\n- Join writing challenges and storytelling events\n- Use @mentions to connect with other creators\n- Create reading lists and story collections\n\n**Community Guidelines:**\n- Be respectful, inclusive, and constructive\n- Help others learn and grow\n- Share quality, original content\n- Credit sources and collaborators\n- Use appropriate channels for different topics\n- Report spam or inappropriate content\n\n**Community Features:**\n- Weekly writing prompts and story challenges\n- Monthly featured creator spotlight\n- Peer review groups for blogs and stories\n- Live storytelling sessions and workshops\n- Content collaboration opportunities\n\nWant to know more about any specific community aspect?",
      ],
      technical_help: [
        "I'm here to help with technical issues! Here are solutions for common problems:\n\n**Media Upload Issues (Videos/Audio):**\n- **Video:** Max 500MB, formats: MP4, MOV, AVI, WebM\n- **Audio:** Max 100MB, formats: MP3, WAV, M4A, OGG\n- **Images:** Max 10MB, formats: JPEG, PNG, WebP, SVG, GIF\n- Clear browser cache if uploads fail\n- Check stable internet connection\n- Try different browser or incognito mode\n\n**Content Not Appearing?**\n- Ensure content is published (not draft)\n- Add relevant tags and descriptions\n- Wait 5-10 minutes for indexing\n- Check content doesn't violate guidelines\n- Verify email confirmation\n\n**Player/Playback Issues?**\n- Update your browser to latest version\n- Enable hardware acceleration in browser\n- Disable browser extensions temporarily\n- Check if autoplay is blocked\n- Try different browser\n\n**Account & Login Problems?**\n- Use password reset for login issues\n- Check spam folder for verification emails\n- Clear cookies and site data\n- Disable VPN if connection issues\n- Try different device/network\n\n**Editor & Publishing:**\n- Refresh page to restore auto-saved content\n- Use Ctrl+S to manually save\n- Switch between rich text and markdown\n- Enable JavaScript for full functionality\n\n**Performance & Loading:**\n- Clear browser cache and cookies\n- Check internet speed (min 5Mbps recommended)\n- Close unnecessary browser tabs\n- Try different browser\n\n**Still having issues?** Describe your problem in detail and I'll help troubleshoot step by step!",
      ],
      account_help: [
        "Let me help you with account management:\n\n**Profile Setup:**\n- Add a professional profile photo (square, 400x400px recommended)\n- Write a compelling bio (150-300 characters)\n- Add your social media links\n- Set your location and timezone\n- Choose your content categories (blogs/stories)\n\n**Privacy & Security:**\n- Enable two-factor authentication (highly recommended)\n- Review your privacy settings\n- Manage who can contact you\n- Control comment moderation\n- Set content visibility preferences\n\n**Notification Settings:**\n- Email notifications (daily/weekly digests)\n- Browser push notifications\n- Mobile app notifications\n- Comment and mention alerts\n- Story interaction notifications\n- Newsletter subscriptions\n\n**Content Management:**\n- Organize your blogs and stories\n- Create content series and collections\n- Schedule posts and story releases\n- Manage drafts and published content\n\n**Data & Analytics:**\n- View your content performance metrics\n- Download your data (GDPR compliant)\n- Export your posts, stories, and comments\n- Access audience insights and demographics\n\n**Subscription & Features:**\n- Explore premium features\n- Manage content storage limits\n- Access advanced analytics\n- Priority content review\n\nWhat specific account feature would you like help with?",
      ],
      farewell: [
        "You're welcome! 😊 Feel free to come back anytime if you need help with blogs, stories, or anything else. Happy creating on SilentVoice!",
        "Glad I could help! 🎉 Don't hesitate to reach out for more assistance with your content journey. Enjoy sharing your stories and blogs!",
        "My pleasure! 👍 Remember, I'm always here when you need guidance. Have a fantastic day creating amazing content!",
      ],
    },
  };

  const quickReplies = [
    { text: "How do I write a blog post?", action: "writing_help" },
    { text: "Share stories & experiences", action: "stories_help" },
    { text: "Join the community", action: "community_help" },
    { text: "Technical support", action: "technical_help" },
    { text: "Account settings", action: "account_help" },
  ];

  const initialMessage = {
    id: 1,
    type: "bot",
    content: botPersonality.responses.greeting[0],
    timestamp: new Date(),
    quickReplies: quickReplies,
  };

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      1000 + Math.random() * 1500,
    );
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("write") ||
      message.includes("blog") ||
      message.includes("post") ||
      message.includes("publish") ||
      message.includes("editor") ||
      message.includes("article")
    ) {
      return botPersonality.responses.writing_help[0];
    }

    if (
      message.includes("story") ||
      message.includes("stories") ||
      message.includes("experience") ||
      message.includes("lesson") ||
      message.includes("share") ||
      message.includes("video") ||
      message.includes("audio") ||
      message.includes("entertainment") ||
      message.includes("narrative") ||
      message.includes("upload")
    ) {
      return botPersonality.responses.stories_help[0];
    }

    if (
      message.includes("community") ||
      message.includes("forum") ||
      message.includes("follow") ||
      message.includes("discussion") ||
      message.includes("connect")
    ) {
      return botPersonality.responses.community_help[0];
    }

    if (
      message.includes("technical") ||
      message.includes("problem") ||
      message.includes("issue") ||
      message.includes("bug") ||
      message.includes("error") ||
      message.includes("not working") ||
      message.includes("broken") ||
      message.includes("upload") ||
      message.includes("can't") ||
      message.includes("won't")
    ) {
      return botPersonality.responses.technical_help[0];
    }

    if (
      message.includes("account") ||
      message.includes("profile") ||
      message.includes("settings") ||
      message.includes("privacy") ||
      message.includes("password") ||
      message.includes("billing")
    ) {
      return botPersonality.responses.account_help[0];
    }

    if (
      message.includes("thank") ||
      message.includes("bye") ||
      message.includes("goodbye") ||
      message.includes("thanks")
    ) {
      return botPersonality.responses.farewell[
        Math.floor(Math.random() * botPersonality.responses.farewell.length)
      ];
    }

    if (message.includes("help") || message === "" || message.includes("what can you do")) {
      return botPersonality.responses.help_topics[0];
    }

    // Enhanced default response with more intelligence
    return `I understand you're asking about "${userMessage}". Let me help you with that!\n\n${botPersonality.responses.help_topics[0]}\n\n💡 **Quick tip:** Try being more specific with your question, like "How do I share a video story?" or "Why can't I upload audio?" for better assistance!`;
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
            ? [
                { text: "Rate this conversation", action: "rate_conversation" },
                { text: "Start over", action: "restart" },
              ]
            : [
                { text: "Ask another question", action: "continue" },
                { text: "Download transcript", action: "download_transcript" },
                { text: "Start over", action: "restart" },
              ],
      };

      setMessages((prev) => [...prev, botResponse]);
    });
  };

  const handleQuickReply = (reply) => {
    if (reply.action === "restart") {
      setMessages([initialMessage]);
      setChatRating(null);
      setUserSatisfaction(null);
      return;
    }

    if (reply.action === "rate_conversation") {
      const ratingMessage = {
        id: Date.now(),
        type: "bot",
        content: "How would you rate your experience with VoiceBot today? Your feedback helps us improve! 🌟",
        timestamp: new Date(),
        showRating: true,
        quickReplies: [],
      };
      setMessages((prev) => [...prev, ratingMessage]);
      return;
    }

    if (reply.action === "download_transcript") {
      downloadTranscript();
      const downloadMessage = {
        id: Date.now(),
        type: "bot",
        content: "📁 Your chat transcript has been prepared for download! The file contains your complete conversation history with timestamps.\n\nIs there anything else I can help you with?",
        timestamp: new Date(),
        quickReplies: [
          { text: "Ask another question", action: "continue" },
          { text: "Start over", action: "restart" },
        ],
      };
      setMessages((prev) => [...prev, downloadMessage]);
      return;
    }

    handleSendMessage(reply.text);
  };

  const handleRating = (rating) => {
    setChatRating(rating);
    const thankYouMessage = {
      id: Date.now(),
      type: "bot",
      content: `Thank you for the ${rating}-star rating! 🙏 Your feedback helps us improve VoiceBot.\n\n${rating >= 4 
        ? "We're thrilled you had a great experience! Feel free to reach out anytime for help with blogs, stories, or any SilentVoice features." 
        : "We appreciate your feedback and will work to improve. Your input helps us make VoiceBot more helpful for everyone."}\n\nHave a wonderful day creating amazing content!`,
      timestamp: new Date(),
      quickReplies: [
        { text: "Start new conversation", action: "restart" },
      ],
    };
    setMessages((prev) => [...prev, thankYouMessage]);
  };

  const downloadTranscript = () => {
    const transcript = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.type === 'user' ? 'You' : 'VoiceBot'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silentvoice-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
    setChatRating(null);
    setUserSatisfaction(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const confirmClose = () => {
    setIsOpen(false);
    setShowCloseModal(false);
    // Optional: Reset chat when closing
    // resetChat();
  };

  // Close Modal Component (removed - direct close now)
  const CloseModal = () => null;

  if (!isOpen) {
    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50 transition-all hover:scale-110"
          aria-label="Open help chat"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        </Button>
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
          isMinimized ? "w-80 h-16" : `w-96`,
        )}
        style={{
          height: isMinimized ? '64px' : `${screenHeight * 0.9}px`,
          maxHeight: isMinimized ? '64px' : '800px',
          minHeight: isMinimized ? '64px' : '400px'
        }}
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
                      : "Online "}
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
                  title="Start new conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
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
                  onClick={handleClose}
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Close chat"
                  title="Close chat"
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
                        "max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap",
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-4"
                          : "bg-background border shadow-sm mr-4",
                      )}
                    >
                      {message.type === "bot" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{botPersonality.avatar}</span>
                          <span className="font-medium text-sm">
                            {botPersonality.name}
                          </span>
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            AI Assistant
                          </Badge>
                        </div>
                      )}

                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>

                      {/* Rating Component */}
                      {message.showRating && !chatRating && (
                        <div className="flex items-center space-x-1 mt-3 pt-2 border-t">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRating(rating)}
                              className="h-8 w-8 p-0 hover:bg-yellow-100"
                            >
                              <Star className="h-4 w-4 text-yellow-500 hover:fill-yellow-500" />
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Quick Replies */}
                      {message.quickReplies &&
                        message.quickReplies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
                            {message.quickReplies.map((reply, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickReply(reply)}
                                className="text-xs h-7 rounded-full hover:bg-primary/10 transition-colors"
                              >
                                {reply.text}
                              </Button>
                            ))}
                          </div>
                        )}

                      <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                        <span>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.type === "bot" && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(message.content)}
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy message"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-background border shadow-sm rounded-2xl px-4 py-3 mr-4">
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
                    placeholder="Ask about blogs, stories, features... (Press Enter to send)"
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isTyping}
                    size="sm"
                    className="h-10 px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  {chatRating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground">Rated:</span>
                      {[...Array(chatRating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default HelpChatbot;

//this page is good to go 