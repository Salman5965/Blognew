import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
  User,
  Edit,
  Settings,
  Share2,
  BarChart3,
  Shield,
  CreditCard,
  Users,
  Smartphone,
  Globe,
  Zap,
  Heart,
  MessageSquare,
  Tag,
  Image,
  Video,
  Code,
  Palette,
  Bell,
  Lock,
  Download,
  Upload,
  Eye,
  Archive,
  Trash2,
  Star,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

const UserGuide = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [expandedTopics, setExpandedTopics] = useState(new Set(["getting-started"]));
  const [readingProgress, setReadingProgress] = useState(0);

  // Navigation sections
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Zap,
      topics: [
        { id: "account-setup", title: "Account Setup & Profile" },
        { id: "first-steps", title: "First Steps Guide" },
        { id: "dashboard-overview", title: "Dashboard Overview" },
        { id: "basic-navigation", title: "Basic Navigation" },
      ]
    },
    {
      id: "writing-publishing",
      title: "Writing & Publishing",
      icon: Edit,
      topics: [
        { id: "creating-posts", title: "Creating Your First Post" },
        { id: "editor-features", title: "Editor Features & Tools" },
        { id: "formatting-content", title: "Formatting & Styling" },
        { id: "media-management", title: "Adding Images & Videos" },
        { id: "publishing-options", title: "Publishing & Scheduling" },
        { id: "seo-optimization", title: "SEO & Optimization" },
      ]
    },
    {
      id: "content-management",
      title: "Content Management",
      icon: Archive,
      topics: [
        { id: "organizing-posts", title: "Organizing Your Posts" },
        { id: "categories-tags", title: "Categories & Tags" },
        { id: "drafts-revisions", title: "Drafts & Revisions" },
        { id: "content-scheduling", title: "Content Scheduling" },
        { id: "bulk-actions", title: "Bulk Actions" },
      ]
    },
    {
      id: "engagement",
      title: "Community & Engagement",
      icon: Users,
      topics: [
        { id: "following-followers", title: "Following & Followers" },
        { id: "comments-interaction", title: "Comments & Interactions" },
        { id: "social-sharing", title: "Social Media Integration" },
        { id: "community-features", title: "Community Features" },
        { id: "networking", title: "Networking Tips" },
      ]
    },
    {
      id: "analytics",
      title: "Analytics & Insights",
      icon: BarChart3,
      topics: [
        { id: "performance-metrics", title: "Performance Metrics" },
        { id: "audience-insights", title: "Audience Insights" },
        { id: "engagement-analytics", title: "Engagement Analytics" },
        { id: "growth-tracking", title: "Growth Tracking" },
        { id: "reporting", title: "Reports & Exports" },
      ]
    },
    {
      id: "customization",
      title: "Customization",
      icon: Palette,
      topics: [
        { id: "profile-customization", title: "Profile Customization" },
        { id: "theme-settings", title: "Theme & Appearance" },
        { id: "layout-options", title: "Layout Options" },
        { id: "custom-branding", title: "Custom Branding" },
      ]
    },
    {
      id: "settings-privacy",
      title: "Settings & Privacy",
      icon: Settings,
      topics: [
        { id: "account-settings", title: "Account Settings" },
        { id: "privacy-controls", title: "Privacy Controls" },
        { id: "notification-settings", title: "Notification Settings" },
        { id: "security-features", title: "Security Features" },
        { id: "data-management", title: "Data Management" },
      ]
    },
    {
      id: "premium-features",
      title: "Premium Features",
      icon: Star,
      topics: [
        { id: "subscription-plans", title: "Subscription Plans" },
        { id: "premium-tools", title: "Premium Writing Tools" },
        { id: "advanced-analytics", title: "Advanced Analytics" },
        { id: "priority-support", title: "Priority Support" },
        { id: "custom-domains", title: "Custom Domains" },
      ]
    },
  ];

  // Content for each topic
  const content = {
    "account-setup": {
      title: "Account Setup & Profile",
      icon: User,
      content: [
        {
          type: "overview",
          title: "Getting Your Account Ready",
          content: "Setting up your SilentVoice account properly is the foundation of your blogging journey. A well-configured profile helps you connect with your audience and establishes your online presence."
        },
        {
          type: "steps",
          title: "Account Setup Steps",
          items: [
            "Sign up with your email or social media account",
            "Verify your email address through the confirmation link",
            "Complete your profile with a professional photo and bio",
            "Choose a memorable username that reflects your brand",
            "Set your content preferences and interests",
            "Configure your privacy and notification settings"
          ]
        },
        {
          type: "tip",
          title: "Pro Tip",
          content: "Use a professional headshot and write a compelling bio that clearly explains who you are and what readers can expect from your content."
        },
        {
          type: "warning",
          title: "Important Note",
          content: "Your username cannot be changed after account creation, so choose carefully. It will be part of your profile URL."
        }
      ]
    },
    "first-steps": {
      title: "First Steps Guide",
      icon: Lightbulb,
      content: [
        {
          type: "overview",
          title: "Your First 24 Hours on SilentVoice",
          content: "Welcome to SilentVoice! This guide will help you get started and make the most of your first day on the platform."
        },
        {
          type: "checklist",
          title: "First Day Checklist",
          items: [
            "Complete your profile setup",
            "Follow 5-10 writers in your niche",
            "Read and engage with 3-5 posts",
            "Create your first draft",
            "Explore the dashboard features",
            "Join relevant community discussions"
          ]
        },
        {
          type: "info",
          title: "Quick Start Video",
          content: "Watch our 5-minute quick start video to see SilentVoice in action and learn the basics."
        }
      ]
    },
    "dashboard-overview": {
      title: "Dashboard Overview",
      icon: BarChart3,
      content: [
        {
          type: "overview",
          title: "Your Command Center",
          content: "The dashboard is your home base on SilentVoice. Here's everything you need to know about navigating and using it effectively."
        },
        {
          type: "features",
          title: "Dashboard Sections",
          items: [
            {
              name: "Recent Activity",
              description: "See your latest posts, comments, and engagement metrics"
            },
            {
              name: "Draft Posts",
              description: "Quick access to your unpublished content"
            },
            {
              name: "Performance Stats",
              description: "Overview of your content performance"
            },
            {
              name: "Community Feed",
              description: "Latest posts from writers you follow"
            },
            {
              name: "Quick Actions",
              description: "Fast access to create new content or manage settings"
            }
          ]
        }
      ]
    },
    "creating-posts": {
      title: "Creating Your First Post",
      icon: Edit,
      content: [
        {
          type: "overview",
          title: "Crafting Compelling Content",
          content: "Creating your first post on SilentVoice is simple yet powerful. Our editor provides everything you need to write, format, and publish engaging content."
        },
        {
          type: "steps",
          title: "Writing Process",
          items: [
            "Click 'New Post' from your dashboard",
            "Add a compelling headline that grabs attention",
            "Write your content using our rich text editor",
            "Add relevant images, videos, or media",
            "Choose appropriate tags and categories",
            "Preview your post before publishing",
            "Publish immediately or schedule for later"
          ]
        },
        {
          type: "tip",
          title: "Writing Tips",
          content: "Start with an engaging hook, use short paragraphs for readability, and always include a clear call-to-action at the end."
        }
      ]
    },
    "editor-features": {
      title: "Editor Features & Tools",
      icon: Code,
      content: [
        {
          type: "overview",
          title: "Powerful Writing Tools",
          content: "SilentVoice's editor combines simplicity with powerful features to help you create professional-looking content."
        },
        {
          type: "features",
          title: "Editor Features",
          items: [
            {
              name: "Rich Text Formatting",
              description: "Bold, italic, underline, strikethrough, and more"
            },
            {
              name: "Heading Styles",
              description: "H1 through H6 headings for proper content structure"
            },
            {
              name: "Lists & Quotes",
              description: "Bullet points, numbered lists, and blockquotes"
            },
            {
              name: "Code Blocks",
              description: "Syntax highlighting for code snippets"
            },
            {
              name: "Media Insertion",
              description: "Drag-and-drop images, videos, and files"
            },
            {
              name: "Link Management",
              description: "Easy link insertion with preview and editing"
            }
          ]
        },
        {
          type: "shortcuts",
          title: "Keyboard Shortcuts",
          items: [
            "Ctrl/Cmd + B: Bold text",
            "Ctrl/Cmd + I: Italic text",
            "Ctrl/Cmd + K: Insert link",
            "Ctrl/Cmd + S: Save draft",
            "Ctrl/Cmd + Enter: Publish post"
          ]
        }
      ]
    },
    "privacy-controls": {
      title: "Privacy Controls",
      icon: Lock,
      content: [
        {
          type: "overview",
          title: "Control Your Privacy",
          content: "SilentVoice gives you complete control over your privacy and data. Configure these settings to match your comfort level."
        },
        {
          type: "settings",
          title: "Privacy Settings",
          items: [
            {
              name: "Profile Visibility",
              description: "Choose who can see your profile and posts"
            },
            {
              name: "Contact Information",
              description: "Control who can see your email and contact details"
            },
            {
              name: "Activity Tracking",
              description: "Manage what activities are visible to others"
            },
            {
              name: "Data Collection",
              description: "Control what data we collect and how it's used"
            },
            {
              name: "Third-party Integration",
              description: "Manage connections with external services"
            }
          ]
        },
        {
          type: "warning",
          title: "Privacy Best Practices",
          content: "Regular review your privacy settings, use strong passwords, and be cautious about sharing personal information in your posts."
        }
      ]
    },
    "premium-tools": {
      title: "Premium Writing Tools",
      icon: Star,
      content: [
        {
          type: "overview",
          title: "Unlock Advanced Features",
          content: "Premium subscribers get access to powerful tools designed to enhance your writing and grow your audience."
        },
        {
          type: "features",
          title: "Premium Tools",
          items: [
            {
              name: "AI Writing Assistant",
              description: "Get suggestions for improving your content and style"
            },
            {
              name: "Advanced Editor",
              description: "Additional formatting options and custom styles"
            },
            {
              name: "SEO Optimizer",
              description: "Built-in tools to optimize your content for search engines"
            },
            {
              name: "Content Calendar",
              description: "Plan and schedule your content strategy"
            },
            {
              name: "Custom Themes",
              description: "Personalize your blog's appearance with custom themes"
            },
            {
              name: "Priority Support",
              description: "Get faster response times from our support team"
            }
          ]
        }
      ]
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleTopicClick = (topicId) => {
    setActiveSection(topicId);
    // Smooth scroll to content
    const element = document.getElementById('guide-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate reading progress based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(Math.max(scrollPercent, 0), 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'overview':
        return (
          <div key={index} className="mb-8">
            <div className="flex items-start space-x-3 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">{block.title}</h3>
                <p className="text-blue-800 leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );

      case 'steps':
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
            <div className="space-y-3">
              {block.items.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {stepIndex + 1}
                  </div>
                  <p className="text-muted-foreground pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
            <div className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
            <div className="grid gap-4">
              {block.items.map((feature, featureIndex) => (
                <div key={featureIndex} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{feature.name}</h4>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="space-y-2">
                {block.items.map((shortcut, shortcutIndex) => (
                  <div key={shortcutIndex} className="flex justify-between items-center">
                    <span className="font-mono text-sm bg-background px-2 py-1 rounded">
                      {shortcut.split(':')[0]}
                    </span>
                    <span className="text-muted-foreground">
                      {shortcut.split(':')[1].trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
            <div className="space-y-4">
              {block.items.map((setting, settingIndex) => (
                <div key={settingIndex} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Settings className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">{setting.name}</h4>
                    <p className="text-muted-foreground text-sm">{setting.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'tip':
        return (
          <div key={index} className="mb-8">
            <div className="flex items-start space-x-3 p-6 bg-green-50 border border-green-200 rounded-lg">
              <Lightbulb className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">{block.title}</h3>
                <p className="text-green-800 leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );

      case 'warning':
        return (
          <div key={index} className="mb-8">
            <div className="flex items-start space-x-3 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">{block.title}</h3>
                <p className="text-yellow-800 leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div key={index} className="mb-8">
            <div className="flex items-start space-x-3 p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <Video className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">{block.title}</h3>
                <p className="text-purple-800 leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentContent = content[activeSection];

  return (
    <PageWrapper className="py-8">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            User <span className="text-primary">Guide</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive documentation covering all SilentVoice features and capabilities. 
            Master the platform and unlock your content creation potential.
          </p>
        </header>

        {/* Search Section */}
        <section className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search the user guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 focus:border-primary/50"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Table of Contents
                </CardTitle>
                <div className="mt-2">
                  <Progress value={readingProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reading Progress: {Math.round(readingProgress)}%
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-96 overflow-y-auto">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedTopics.has(section.id);
                    
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors duration-200"
                        >
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-3" />
                            <span className="text-sm font-medium">{section.title}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-6 space-y-1">
                            {section.topics.map((topic) => (
                              <button
                                key={topic.id}
                                onClick={() => handleTopicClick(topic.id)}
                                className={`w-full text-left p-2 text-sm hover:bg-muted/50 transition-colors duration-200 rounded ${
                                  activeSection === topic.id 
                                    ? "bg-primary/10 text-primary font-medium" 
                                    : "text-muted-foreground"
                                }`}
                              >
                                {topic.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/help">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Visit Help Center
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/community">
                    <Users className="h-4 w-4 mr-2" />
                    Join Community
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/contact">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3" id="guide-content">
            {currentContent ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {React.createElement(currentContent.icon, { 
                      className: "h-8 w-8 text-primary" 
                    })}
                    <div>
                      <CardTitle className="text-2xl">{currentContent.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Learn everything about this feature
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  {currentContent.content.map((block, index) => 
                    renderContentBlock(block, index)
                  )}
                  
                  {/* Navigation Footer */}
                  <div className="flex justify-between items-center mt-12 pt-8 border-t">
                    <Button variant="outline" onClick={() => navigate('/help')}>
                      ← Back to Help Center
                    </Button>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Was this helpful?
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-1" />
                          Yes
                        </Button>
                        <Button size="sm" variant="outline">
                          No
                        </Button>
                      </div>
                    </div>
                    <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      ↑ Back to Top
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to the User Guide</h3>
                  <p className="text-muted-foreground">
                    Select a topic from the sidebar to get started learning about SilentVoice features.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>

        {/* Related Resources */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 group">
              <CardContent className="pt-6 text-center">
                <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch step-by-step video guides for visual learning
                </p>
                <div className="flex items-center justify-center text-primary font-medium text-sm group-hover:gap-2 transition-all duration-200">
                  Watch Videos
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 group">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">FAQ</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find quick answers to frequently asked questions
                </p>
                <div className="flex items-center justify-center text-primary font-medium text-sm group-hover:gap-2 transition-all duration-200">
                  Browse FAQ
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 group">
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community Forum</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with other users and get community support
                </p>
                <div className="flex items-center justify-center text-primary font-medium text-sm group-hover:gap-2 transition-all duration-200">
                  Join Discussion
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Download Guide */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-purple-100 border-primary/20">
            <CardContent className="text-center py-12">
              <Download className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Download Complete Guide</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get the complete SilentVoice User Guide as a PDF for offline reading. 
                Perfect for reference when you're away from your computer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF Guide
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share This Guide
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: August 2025 • 127 pages • Free for all users
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageWrapper>
  );
};

export default UserGuide;


//need so many changes but can be pushed