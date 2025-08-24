
import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Download,
  Trash2,
  Edit,
  Eye,
  Lock,
  CheckCircle,
  Mail,
  FileText,
  User,
  Database,
  Settings,
  Clock,
  Scale,
} from "lucide-react";

const Gdpr = () => {
  const [selectedRight, setSelectedRight] = useState(null);
  const [requestForm, setRequestForm] = useState({
    type: "",
    email: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rights = [
    {
      id: "access",
      title: "Right of Access",
      icon: Eye,
      description:
        "You have the right to request copies of your personal data. We may charge a small fee for this service.",
      details: [
        "Request a copy of all personal data we hold about you",
        "Receive information about how your data is processed",
        "Get details about data sharing with third parties",
        "Understand the legal basis for processing your data",
      ],
      actionLabel: "Request Data Access",
    },
    {
      id: "rectification",
      title: "Right to Rectification",
      icon: Edit,
      description:
        "You have the right to request that we correct any information you believe is inaccurate or incomplete.",
      details: [
        "Correct inaccurate personal information",
        "Complete incomplete personal data",
        "Update outdated information",
        "Verify the accuracy of your data",
      ],
      actionLabel: "Request Data Correction",
    },
    {
      id: "erasure",
      title: "Right to Erasure",
      icon: Trash2,
      description:
        "You have the right to request that we erase your personal data, under certain conditions.",
      details: [
        "Delete your personal data when no longer necessary",
        "Remove data processed unlawfully",
        "Erase data when you withdraw consent",
        "Delete data when you object to processing",
      ],
      actionLabel: "Request Data Deletion",
    },
    {
      id: "portability",
      title: "Right to Data Portability",
      icon: Download,
      description:
        "You have the right to request that we transfer the data to another organization, or directly to you.",
      details: [
        "Receive your data in a structured, machine-readable format",
        "Transfer data to another service provider",
        "Move your data when technically feasible",
        "Export your content and profile information",
      ],
      actionLabel: "Request Data Export",
    },
    {
      id: "restriction",
      title: "Right to Restrict Processing",
      icon: Lock,
      description:
        "You have the right to request that we restrict the processing of your personal data.",
      details: [
        "Limit how we use your data while verifying accuracy",
        "Restrict processing when data is no longer needed",
        "Pause processing when you've objected to it",
        "Maintain data without active processing",
      ],
      actionLabel: "Request Processing Restriction",
    },
    {
      id: "objection",
      title: "Right to Object",
      icon: Shield,
      description:
        "You have the right to object to our processing of your personal data, under certain conditions.",
      details: [
        "Object to processing for direct marketing",
        "Stop processing for legitimate interests",
        "Opt out of profiling and automated decision-making",
        "Withdraw consent for specific processing activities",
      ],
      actionLabel: "Object to Processing",
    },
  ];

  const handleRightSelect = (rightId) => {
    const right = rights.find((r) => r.id === rightId);
    setSelectedRight(right);
    setRequestForm({
      ...requestForm,
      type: right.title,
    });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(
        `Your ${requestForm.type} request has been submitted. We'll respond within 30 days.`,
      );
      setRequestForm({ type: "", email: "", description: "" });
      setSelectedRight(null);
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dataCategories = [
    {
      category: "Account Information",
      icon: User,
      data: [
        "Name",
        "Email address",
        "Username",
        "Password (encrypted)",
        "Profile picture",
      ],
    },
    {
      category: "Content Data",
      icon: FileText,
      data: [
        "Blog posts",
        "Comments",
        "Likes and reactions",
        "Saved articles",
        "Draft content",
      ],
    },
    {
      category: "Usage Data",
      icon: Database,
      data: [
        "Login timestamps",
        "Page views",
        "Feature usage",
        "Search queries",
        "Device information",
      ],
    },
    {
      category: "Communication Data",
      icon: Mail,
      data: [
        "Support tickets",
        "Email communications",
        "Newsletter subscriptions",
        "Notification preferences",
      ],
    },
  ];

  const legalBases = [
    {
      basis: "Consent",
      icon: CheckCircle,
      description: "You have explicitly agreed to the processing",
      examples: [
        "Newsletter subscriptions",
        "Marketing communications",
        "Optional features",
      ],
    },
    {
      basis: "Contract",
      icon: FileText,
      description: "Processing is necessary to provide our service",
      examples: ["Account creation", "Blog publishing", "Payment processing"],
    },
    {
      basis: "Legitimate Interest",
      icon: Shield,
      description:
        "We have a valid business reason that doesn't override your rights",
      examples: [
        "Security monitoring",
        "Service improvement",
        "Fraud prevention",
      ],
    },
    {
      basis: "Legal Obligation",
      icon: Scale,
      description: "We are required by law to process the data",
      examples: ["Tax records", "Legal compliance", "Court orders"],
    },
  ];

  return (
    <PageWrapper className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            GDPR Compliance
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your data protection rights under the General Data Protection
            Regulation
          </p>
          <Badge variant="outline" className="text-sm">
            Regulation (EU) 2016/679
          </Badge>
        </div>

        {/* Overview */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>What is GDPR?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The General Data Protection Regulation (GDPR) is a comprehensive
              data protection law that gives individuals control over their
              personal data. It applies to all companies that process personal
              data of EU residents.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Enhanced Rights</h4>
                <p className="text-sm text-muted-foreground">
                  Stronger data protection rights for individuals
                </p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Data Security</h4>
                <p className="text-sm text-muted-foreground">
                  Mandatory security measures and breach notifications
                </p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Accountability</h4>
                <p className="text-sm text-muted-foreground">
                  Organizations must demonstrate compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Rights Under GDPR</h2>
            <div className="space-y-4 mb-8">
              {rights.map((right) => {
                const Icon = right.icon;
                return (
                  <Card
                    key={right.id}
                    className={`cursor-pointer transition-all ${
                      selectedRight?.id === right.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleRightSelect(right.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg">
                        <Icon className="h-5 w-5 mr-3 text-primary" />
                        {right.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {right.description}
                      </p>
                      {selectedRight?.id === right.id && (
                        <div className="mt-3 pt-3 border-t">
                          <h4 className="font-semibold mb-2 text-sm">
                            This includes:
                          </h4>
                          <ul className="text-sm space-y-1">
                            {right.details.map((detail, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Request Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Exercise Your Rights</h2>

            {selectedRight ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {React.createElement(selectedRight.icon, {
                      className: "h-5 w-5 mr-2",
                    })}
                    {selectedRight.actionLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={requestForm.email}
                        onChange={(e) =>
                          setRequestForm({
                            ...requestForm,
                            email: e.target.value,
                          })
                        }
                        required
                        placeholder="your.email@example.com"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must match the email address associated with your
                        account
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Additional Details</Label>
                      <textarea
                        id="description"
                        value={requestForm.description}
                        onChange={(e) =>
                          setRequestForm({
                            ...requestForm,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full p-2 border border-input rounded-md bg-background"
                        placeholder="Please provide any additional details about your request..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        We will respond to your request within 30 days. You may
                        be asked to verify your identity before we process your
                        request.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          "Submit Request"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedRight(null)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Select a Right to Exercise
                    </h3>
                    <p className="text-muted-foreground">
                      Click on any of the rights listed on the left to start
                      your request
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Data We Collect */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Data We Collect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="h-5 w-5 mr-2" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.data.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start text-sm"
                        >
                          <span className="text-primary mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Legal Basis */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            Legal Basis for Processing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalBases.map((basis, index) => {
              const Icon = basis.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="h-5 w-5 mr-2" />
                      {basis.basis}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {basis.description}
                    </p>
                    <h4 className="font-semibold mb-2 text-sm">Examples:</h4>
                    <ul className="space-y-1">
                      {basis.examples.map((example, exampleIndex) => (
                        <li
                          key={exampleIndex}
                          className="flex items-start text-sm"
                        >
                          <span className="text-primary mr-2">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Data Protection Officer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have any questions about your data protection rights or how
              we handle your personal data, please contact our Data Protection
              Officer:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong> silentvoice.app@gmail.com
              </p>
              <p>
                <strong>Address:</strong> Gangamma Layout, Bengaluru, Karnataka 560050
              </p>
              <p>
                <strong>Phone:</strong> Not Available
              </p>
            </div>
            <div className="mt-6">
              <a
                href="/contact"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-semibold transition-colors inline-block"
              >
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Gdpr;



//good to go