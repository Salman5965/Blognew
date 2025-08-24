import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Shield,
  AlertTriangle,
  Scale,
  Ban,
  CheckCircle,
  Mail,
} from "lucide-react";

const Terms = () => {
  const lastUpdated = "December 1, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <p>
            By accessing and using SilentVoice ("the Service"), you accept and agree
            to be bound by the terms and provision of this agreement. If you do
            not agree to abide by the above, please do not use this service.
          </p>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
            <p className="text-sm">
              <strong>Important:</strong> These terms apply to all users of the
              Service, including users who are also contributors of content,
              information, and other materials or services on the Service.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "service-description",
      title: "Service Description",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p>SilentVoice is a platform that allows users to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Create and publish blog posts and articles</li>
            <li>Read and interact with content from other users</li>
            <li>Comment on and like blog posts</li>
            <li>Build a personal profile and following</li>
            <li>Discover content based on interests and preferences</li>
          </ul>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
            <p className="text-sm">
              <strong>Service Availability:</strong> We strive to maintain 99.9%
              uptime, but we do not guarantee uninterrupted access to the
              Service. Maintenance and updates may temporarily affect
              availability.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "user-accounts",
      title: "User Accounts and Responsibilities",
      icon: Users,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Account Creation</h4>
          <p>
            To use certain features of the Service, you must create an account.
            You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept all risks of unauthorized access to your account</li>
          </ul>

          <h4 className="font-semibold mt-6">Account Responsibilities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg">
              <h5 className="font-medium mb-2 text-green-800 dark:text-green-200">
                ✓ Do
              </h5>
              <ul className="text-sm space-y-1">
                <li>• Keep your login credentials secure</li>
                <li>• Notify us of unauthorized access</li>
                <li>• Use your real name and information</li>
                <li>• Comply with our community guidelines</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
              <h5 className="font-medium mb-2 text-red-800 dark:text-red-200">
                ✗ Don't
              </h5>
              <ul className="text-sm space-y-1">
                <li>• Share your account with others</li>
                <li>• Create multiple accounts</li>
                <li>• Use fake or misleading information</li>
                <li>• Attempt to hack or abuse the system</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "content-guidelines",
      title: "Content Guidelines and Intellectual Property",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">Your Content</h4>
          <p>
            You retain ownership of content you create and post on SilentVoice.
            However, by posting content, you grant us:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              A worldwide, non-exclusive, royalty-free license to use, display,
              and distribute your content
            </li>
            <li>
              The right to modify or adapt your content for technical
              requirements
            </li>
            <li>The right to remove content that violates our guidelines</li>
          </ul>

          <h4 className="font-semibold mt-6">Prohibited Content</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <h5 className="font-medium mb-1 text-red-800 dark:text-red-200">
                  Illegal Content
                </h5>
                <p className="text-sm">
                  Content that promotes illegal activities or violates laws
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <h5 className="font-medium mb-1 text-red-800 dark:text-red-200">
                  Harassment
                </h5>
                <p className="text-sm">
                  Bullying, threats, or targeted harassment of individuals
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <h5 className="font-medium mb-1 text-red-800 dark:text-red-200">
                  Spam
                </h5>
                <p className="text-sm">
                  Repetitive, promotional, or low-quality content
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <h5 className="font-medium mb-1 text-red-800 dark:text-red-200">
                  Copyright Infringement
                </h5>
                <p className="text-sm">
                  Content that violates intellectual property rights
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <h5 className="font-medium mb-1 text-red-800 dark:text-red-200">
                  Misinformation
                </h5>
                <p className="text-sm">
                  Deliberately false or misleading information
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <h5 className="font-medium mb-1 text-red-800 dark:text-red-200">
                  Adult Content
                </h5>
                <p className="text-sm">
                  Explicit or inappropriate content not suitable for all ages
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: Scale,
      content: (
        <div className="space-y-4">
          <p>
            You agree to use SilentVoice responsibly and in accordance with these
            guidelines:
          </p>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Permitted Uses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Creating original, high-quality content</li>
                  <li>Engaging respectfully with other users</li>
                  <li>Sharing knowledge and experiences</li>
                  <li>Building a professional online presence</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Promoting your work or business ethically</li>
                  <li>Collaborating with other creators</li>
                  <li>Providing constructive feedback</li>
                  <li>Using the platform for educational purposes</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Prohibited Uses</h4>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Automated posting or bot activity</li>
                  <li>Attempting to reverse engineer or hack the platform</li>
                  <li>Collecting user data without permission</li>
                  <li>Impersonating other users or entities</li>
                  <li>Interfering with the normal operation of the Service</li>
                  <li>Creating accounts to circumvent suspensions or bans</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "enforcement",
      title: "Enforcement and Violations",
      icon: Ban,
      content: (
        <div className="space-y-4">
          <p>
            We reserve the right to enforce these terms at our discretion.
            Violations may result in:
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Warning
                </h4>
                <p className="text-sm text-muted-foreground">
                  First-time or minor violations may result in a warning and
                  request to modify behavior.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                  Content Removal
                </h4>
                <p className="text-sm text-muted-foreground">
                  Violating content may be removed or hidden from public view.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  Account Suspension
                </h4>
                <p className="text-sm text-muted-foreground">
                  Repeated or serious violations may result in temporary or
                  permanent account suspension.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2">Appeal Process</h4>
            <p className="text-sm">
              If you believe your content was removed or account was suspended
              in error, you may appeal by contacting our support team with
              relevant details and context.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold mb-2">Important Legal Notice</h4>
            <p className="text-sm">
              The following limitations may not apply in all jurisdictions.
              Please consult local laws for your specific situation.
            </p>
          </div>

          <p>To the maximum extent permitted by law:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>SilentVoice is provided "as is" without warranties of any kind</li>
            <li>
              We do not guarantee the accuracy, completeness, or reliability of
              user-generated content
            </li>
            <li>
              We are not liable for any indirect, incidental, or consequential
              damages
            </li>
            <li>
              Our total liability is limited to the amount you paid for the
              Service in the past 12 months
            </li>
          </ul>

          <h4 className="font-semibold mt-6">User Responsibility</h4>
          <p>You acknowledge that:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>You use the Service at your own risk</li>
            <li>You are responsible for your interactions with other users</li>
            <li>You should verify information before relying on it</li>
            <li>
              You agree to indemnify SilentVoice against claims arising from your
              use of the Service
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p>
            We reserve the right to modify these terms at any time. We will
            notify users of significant changes through:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Email notification to registered users</li>
            <li>Prominent notice on the website</li>
            <li>In-app notifications</li>
            <li>Updates to this page with a new "Last Updated" date</li>
          </ul>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
            <p className="text-sm">
              <strong>Continued Use:</strong> Your continued use of the Service
              after any changes constitute acceptance of the new terms. If you
              do not agree with the changes, you should discontinue use of the
              Service.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Scale className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Please read these terms carefully before using our service. They
            govern your use of SilentVoice.
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdated}
          </Badge>
        </div>

        {/* Quick Summary */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Be Respectful</h4>
                <p className="text-muted-foreground">
                  Treat other users with respect and kindness
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Create Original Content</h4>
                <p className="text-muted-foreground">
                  Share your own ideas and respect others' work
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Follow Guidelines</h4>
                <p className="text-muted-foreground">
                  Comply with our community standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Icon className="h-5 w-5 mr-3 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  {section.content}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Questions About These Terms?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please
              contact us:
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

export default Terms;



//good to go