import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Bug,
  Lightbulb,
  Send,
  CheckCircle,
  Wrench,
  Briefcase,
  Twitter,
  Github,
} from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "silentvoice.app@gmail.com",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "not available",
      description: "Mon-Fri from 8am to 6pm",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Gangamma Layout, Bengaluru, Karnataka 560050",
      description: "Our office address",
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Fri: 8am-6pm IST",
      description: "We're here to help",
    },
  ];

  const categories = [
    { value: "general", label: "General Inquiry", icon: MessageCircle },
    { value: "support", label: "Technical Support", icon: HelpCircle },
    { value: "bug", label: "Bug Report", icon: Bug },
    { value: "feature", label: "Feature Request", icon: Lightbulb },
    { value: "business", label: "Business Partnership", icon: Mail },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      toast({
        title: "Message Sent!",
        description:
          "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have a question, suggestion, or just want to say hello? We'd love to
            hear from you. Our team is here to help you make the most of your
            SilentVoice experience.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                  <p className="font-medium mb-1">{info.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Send us a Message
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
            </CardHeader>
            <CardContent>
              {isSubmitted && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your message has been sent successfully! We'll respond
                    within 24 hours.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    rows={2}
                    className="w-full p-3 border border-input rounded-md bg-background resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Response Time and Contact Methods */}
          <div className="space-y-14">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-center">
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 divide-y">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      General Inquiries
                    </span>
                  </div>
                  <span className="text-xs text-primary font-semibold">
                    Responds within 24h
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Technical Support
                    </span>
                  </div>
                  <span className="text-xs text-primary font-semibold">
                    Responds within 12h
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bug Reports</span>
                  </div>
                  <span className="text-xs text-primary font-semibold">
                    Responds within 6h
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Business Inquiries
                    </span>
                  </div>
                  <span className="text-xs text-primary font-semibold">
                    Responds within 48h
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Contact Methods */}

            <Card className="mt-6">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Other Ways to Reach Us
                </h2>
                <div className="space-y-3 divide-y">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Follow us on Twitter
                      </span>
                    </div>
                    <a
                      href="https://twitter.com/SilentVoice"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Follow
                    </a>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Contribute on GitHub
                      </span>
                    </div>
                    <a
                      href="https://github.com/SilentVoice"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Contribute
                    </a>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Browse Help Center
                      </span>
                    </div>
                    <a
                      href="/help"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Browse
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;


//this page is good to go only have to implement the send message functionality