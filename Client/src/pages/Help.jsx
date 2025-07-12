import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  FileText,
  Settings,
  User,
  Edit,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  Star,
  ThumbsUp,
  Download,
  Globe,
} from "lucide-react";
import HelpChatbot from "@/components/help/HelpChatbot";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleQuickAction = (action) => {
    switch (action) {
      case "guide":
        setSelectedCategory("getting-started");
        setExpandedFaq(1);
        break;
      case "videos":
        window.open("https://www.youtube.com/@writenest", "_blank");
        break;
      case "contact":
        navigate("/contact");
        break;
      case "docs":
        window.open("/api-docs", "_blank");
        break;
      case "community":
        navigate("/community");
        break;
      case "status":
        window.open("https://status.writenest.com", "_blank");
        break;
      default:
        break;
    }
  };

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle, count: 47 },
    { id: "getting-started", name: "Getting Started", icon: Zap, count: 8 },
    { id: "writing", name: "Writing & Publishing", icon: Edit, count: 12 },
    { id: "account", name: "Account Management", icon: User, count: 9 },
    { id: "settings", name: "Settings & Privacy", icon: Settings, count: 7 },
    { id: "troubleshooting", name: "Troubleshooting", icon: Shield, count: 6 },
    {
      id: "billing",
      name: "Billing & Subscriptions",
      icon: FileText,
      count: 5,
    },
  ];

  const quickActions = [
    {
      icon: Book,
      title: "Getting Started Guide",
      description: "Learn the basics of using our platform",
      action: "guide",
      color: "bg-blue-500",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      action: "videos",
      color: "bg-red-500",
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get in touch with our support team",
      action: "contact",
      color: "bg-green-500",
    },
    {
      icon: FileText,
      title: "API Documentation",
      description: "Browse our comprehensive docs",
      action: "docs",
      color: "bg-purple-500",
    },
    {
      icon: Globe,
      title: "Community Forum",
      description: "Connect with other users",
      action: "community",
      color: "bg-orange-500",
    },
    {
      icon: Star,
      title: "Service Status",
      description: "Check system status and uptime",
      action: "status",
      color: "bg-indigo-500",
    },
  ];

  const quickLinks = [
    {
      title: "Getting Started Guide",
      description: "Complete guide for new users",
      icon: Book,
      link: "/help/getting-started",
      category: "getting-started",
    },
    {
      title: "Writing Your First Blog",
      description: "Step-by-step tutorial",
      icon: Edit,
      link: "/help/first-blog",
      category: "writing",
    },
    {
      title: "Video Tutorials",
      description: "Watch and learn",
      icon: Video,
      action: () => handleQuickAction("videos"),
      category: "getting-started",
    },
    {
      title: "Contact Support",
      description: "Get personalized help",
      icon: MessageCircle,
      action: () => handleQuickAction("contact"),
      category: "all",
    },
  ];

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I create my first blog post?",
      answer:
        "To create your first blog post: 1) Log in to your account, 2) Click 'Create New Post' in your dashboard, 3) Add a compelling title and content, 4) Choose relevant tags and categories, 5) Preview your post, and 6) Click 'Publish' when ready. You can also save as draft to finish later.",
    },
    {
      id: 2,
      category: "getting-started",
      question: "Is BlogHub free to use?",
      answer:
        "Yes! BlogHub offers a free plan that includes basic blogging features, unlimited posts, and community access. We also offer premium plans with advanced features like custom domains, analytics, and priority support.",
    },
    {
      id: 3,
      category: "writing",
      question: "Can I add images and videos to my blog posts?",
      answer:
        "Absolutely! You can add images by clicking the image button in the editor or dragging and dropping files. We support JPEG, PNG, and WebP formats up to 5MB. For videos, you can embed YouTube, Vimeo, or other video platforms using their embed codes.",
    },
    {
      id: 4,
      category: "writing",
      question: "How do I format text in my blog posts?",
      answer:
        "Our editor supports rich text formatting including bold, italic, headers, lists, links, and code blocks. You can use the toolbar or keyboard shortcuts like Ctrl+B for bold, Ctrl+I for italic, and Ctrl+K for links.",
    },
    {
      id: 5,
      category: "account",
      question: "How do I change my username or email?",
      answer:
        "To update your username or email: 1) Go to your Profile Settings, 2) Click 'Edit Profile', 3) Update your information, and 4) Save changes. Note that usernames must be unique and email changes require verification.",
    },
    {
      id: 6,
      category: "account",
      question: "Can I delete my account?",
      answer:
        "Yes, you can delete your account from the Account Settings page. Please note that this action is irreversible and will remove all your posts, comments, and profile data. Consider downloading your data first.",
    },
    {
      id: 7,
      category: "settings",
      question: "How do I change my privacy settings?",
      answer:
        "Privacy settings can be found in your Profile Settings under the 'Privacy' tab. You can control who can see your profile, posts, and contact information. You can also manage email notifications and data sharing preferences.",
    },
    {
      id: 8,
      category: "settings",
      question: "How do I enable two-factor authentication?",
      answer:
        "For enhanced security, go to Account Settings > Security and enable two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy to generate verification codes.",
    },
    {
      id: 9,
      category: "troubleshooting",
      question: "Why can't I upload images?",
      answer:
        "Image upload issues are usually due to: 1) File size over 5MB limit, 2) Unsupported file format (use JPEG, PNG, or WebP), 3) Poor internet connection, or 4) Browser cache issues. Try refreshing the page or clearing your browser cache.",
    },
    {
      id: 10,
      category: "troubleshooting",
      question: "My blog post isn't showing up in search",
      answer:
        "New posts may take a few minutes to appear in search results. Make sure your post is published (not in draft mode) and includes relevant tags. If it's still not appearing after 30 minutes, contact support.",
    },
    {
      id: 11,
      category: "billing",
      question: "How do I upgrade to a premium plan?",
      answer:
        "To upgrade: 1) Go to your Account Settings, 2) Click 'Billing & Plans', 3) Choose your preferred plan, 4) Enter payment details, and 5) Confirm upgrade. Your new features will be available immediately.",
    },
    {
      id: 12,
      category: "billing",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your Account Settings > Billing. You'll continue to have premium access until the end of your current billing period.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const supportContacts = [
    {
      type: "Email Support",
      value: "support@writenest.com",
      description: "General inquiries and support",
      icon: Mail,
      action: () => window.open("mailto:support@writenest.com", "_blank"),
    },
    {
      type: "Live Chat",
      value: "Available 24/7",
      description: "Instant help from our chatbot",
      icon: MessageCircle,
      action: () => {}, // Chatbot is already on the page
    },
    {
      type: "Phone Support",
      value: "+1 (555) 123-4567",
      description: "Premium users only",
      icon: Phone,
      action: () => window.open("tel:+15551234567", "_blank"),
    },
  ];

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, browse our documentation, or get
            in touch with our support team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </div>
                        <Badge
                          variant={
                            selectedCategory === category.id
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {category.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportContacts.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={contact.action}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 text-primary" />
                        <div className="text-left">
                          <div className="font-medium text-sm">
                            {contact.type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contact.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contact.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Frequently Asked Questions
                  <Badge variant="outline" className="ml-2">
                    {filteredFaqs.length} results
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg">
                      <button
                        onClick={() =>
                          setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
                      >
                        <span className="font-medium">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="p-4 pt-0 border-t">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Helpful
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Need more help?
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or browse different categories
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Still need help section */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to
              help you get the most out of BlogHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => handleQuickAction("contact")} size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAction("community")}
                size="lg"
              >
                <Globe className="h-4 w-4 mr-2" />
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Chatbot - positioned absolutely */}
      <HelpChatbot />
    </PageWrapper>
  );
};

export default Help;
