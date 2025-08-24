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
} from "lucide-react";
import HelpChatbot from "@/components/help/HelpChatbot";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle, count: 12 },
    { id: "getting-started", name: "Getting Started", icon: Zap, count: 2 },
    { id: "writing", name: "Writing & Publishing", icon: Edit, count: 2 },
    { id: "account", name: "Account Management", icon: User, count: 2 },
    { id: "settings", name: "Settings & Privacy", icon: Settings, count: 2 },
    { id: "troubleshooting", name: "Troubleshooting", icon: Shield, count: 2 },
    {
      id: "billing",
      name: "Billing & Subscriptions",
      icon: FileText,
      count: 2,
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
      question: "Is SilentVoice free to use?",
      answer:
        "Yes! SilentVoice offers a free plan that includes basic blogging features, unlimited posts, and community access. We also offer premium plans with advanced features like custom domains, analytics, and priority support.",
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
        "New posts may take a few minutes to appear in search results. Make sure your post is published (not in draft), has relevant tags, and contains good SEO practices like descriptive titles and meta descriptions.",
    },
    {
      id: 11,
      category: "billing",
      question: "How do I upgrade to a premium plan?",
      answer:
        "To upgrade: 1) Go to your Dashboard, 2) Click 'Upgrade' or visit Billing Settings, 3) Choose your plan, 4) Complete payment. Your premium features will be activated immediately.",
    },
    {
      id: 12,
      category: "billing",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from the Billing Settings. Your premium features will remain active until the end of your billing period, then your account will revert to the free plan.",
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

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <PageWrapper className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <HelpCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Help <span className="text-primary">Center</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions, learn how to use SilentVoice
            features, and get the support you need to create amazing content.
          </p>
        </div>

        {/* Additional Resources */}
        <div className="my-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Guide */}
            <Card className="text-center hover:shadow-lg transition-transform hover:scale-105 rounded-xl">
              <CardContent className="h-full flex flex-col justify-between pt-6">
                <Book className="h-12 w-12 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                <div>
                  <h3 className="font-semibold mb-2">User Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive documentation covering all SilentVoice
                    features
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                   onClick={() => navigate("/user-guide")}
                  aria-label="Read User Guide"
                >
                  Read Guide
                </Button>
              </CardContent>
            </Card>

            {/* Writing Blog */}
            <Card className="text-center hover:shadow-lg transition-transform hover:scale-105 rounded-xl">
              <CardContent className="h-full flex flex-col justify-between pt-6">
                <Edit className="h-12 w-12 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                <div>
                  <h3 className="font-semibold mb-2">
                    Test Toutorial 
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Step-by-step tutorial to start your writing journey
                  </p>
                </div>
                <Button variant="outline" size="sm"  onClick={() => navigate("/tutorial")} aria-label="Start Writing">
                  Start Writing
                </Button>
              </CardContent>
            </Card>

            {/* Video Tutorials */}
            <Card className="text-center hover:shadow-lg transition-transform hover:scale-105 rounded-xl">
              <CardContent className="h-full flex flex-col justify-between pt-6">
                <Video className="h-12 w-12 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                <div>
                  <h3 className="font-semibold mb-2">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Easy step-by-step video guides for visual learners
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                   onClick={() => navigate("/watch-tutorials")}
                  aria-label="Watch Tutorials"
                >
                  Watch Tutorials
                </Button>
              </CardContent>
            </Card>

            {/* Community Forum */}
            <Card className="text-center hover:shadow-lg transition-transform hover:scale-105 rounded-xl">
              <CardContent className="h-full flex flex-col justify-between pt-6">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                <div>
                  <h3 className="font-semibold mb-2">Community Forum</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with other users and get community support
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/community")}
                  aria-label="Join Forum"
                >
                  Join Forum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Browse by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                            : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-3" />
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
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
                <CardTitle className="text-lg">Need More Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@SilentVoice.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">
                      Available 24/7
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">
                      Within 24 hours
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-4" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Frequently Asked Questions
                {searchQuery && (
                  <span className="text-lg text-muted-foreground ml-2">
                    ({filteredFaqs.length} results)
                  </span>
                )}
              </h2>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse a different
                    category.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold pr-4">{faq.question}</h3>
                          {expandedFaq === faq.id ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Chatbot */}
      <HelpChatbot />
    </PageWrapper>
  );
};

export default Help;







///
// The page is good to go further extension such as writing tutorial and video tutorial page is not implemented 