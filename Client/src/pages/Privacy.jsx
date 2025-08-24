import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Eye,
  Lock,
  UserCheck,
  Database,
  Share2,
  Settings,
  Mail,
} from "lucide-react";

const Privacy = () => {
  const lastUpdated = "December 1, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: (
        <div className="space-y-4">
          <p>
            We collect information you provide directly to us, such as when you:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Create or modify your account</li>
            <li>Post content, comments, or interact with other users</li>
            <li>Contact us for support</li>
            <li>Subscribe to our newsletter or marketing communications</li>
            <li>Participate in surveys or promotional activities</li>
          </ul>

          <h4 className="font-semibold mt-6 mb-3">Types of Information:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium mb-2">Personal Information</h5>
              <ul className="text-sm space-y-1">
                <li>• Name and email address</li>
                <li>• Profile information and bio</li>
                <li>• Social media links</li>
                <li>• Profile picture</li>
              </ul>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium mb-2">Usage Information</h5>
              <ul className="text-sm space-y-1">
                <li>• Blog posts and comments</li>
                <li>• Reading preferences</li>
                <li>• Interaction patterns</li>
                <li>• Device and browser data</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p>We use the information we collect to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Service Provision</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Personalization</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Personalize content and recommendations</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraudulent activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Share2,
      content: (
        <div className="space-y-4">
          <p>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties except in the following circumstances:
          </p>

          <div className="space-y-6">
            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-yellow-600" />
                With Your Consent
              </h4>
              <p className="text-sm">
                We may share your information when you explicitly consent to
                such sharing.
              </p>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Legal Requirements
              </h4>
              <p className="text-sm">
                We may disclose information if required by law or in response to
                valid legal processes.
              </p>
            </div>

            <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-green-600" />
                Service Providers
              </h4>
              <p className="text-sm">
                We may share information with trusted service providers who
                assist us in operating our platform.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p>
            We implement appropriate security measures to protect your personal
            information:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Encryption</h4>
              <p className="text-sm">
                All data is encrypted in transit and at rest using
                industry-standard protocols.
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Access Control</h4>
              <p className="text-sm">
                Strict access controls ensure only authorized personnel can
                access your data.
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Monitoring</h4>
              <p className="text-sm">
                Continuous monitoring helps us detect and respond to security
                threats.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg">
            <p className="text-sm">
              <strong>Important:</strong> While we use reasonable efforts to
              protect your information, no method of transmission over the
              Internet or electronic storage is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          <p>You have several rights regarding your personal information:</p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Access and Portability</h4>
                <p className="text-sm text-muted-foreground">
                  You can access and download your personal data at any time
                  through your account settings.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Correction and Updates</h4>
                <p className="text-sm text-muted-foreground">
                  You can update your personal information through your profile
                  settings or by contacting us.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Deletion</h4>
                <p className="text-sm text-muted-foreground">
                  You can request deletion of your account and associated data.
                  Some information may be retained for legal purposes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Marketing Communications</h4>
                <p className="text-sm text-muted-foreground">
                  You can opt-out of marketing emails by clicking the
                  unsubscribe link or updating your preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <p>
            We use cookies and similar tracking technologies to improve your
            experience:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Essential Cookies</h4>
              <p className="text-sm">
                Required for the website to function properly, including
                authentication and security features.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Analytics Cookies</h4>
              <p className="text-sm">
                Help us understand how users interact with our site to improve
                our services.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Preference Cookies</h4>
              <p className="text-sm">
                Remember your settings and preferences for a personalized
                experience.
              </p>
            </div>
          </div>

          <p className="text-sm">
            You can control cookies through your browser settings. However,
            disabling certain cookies may affect website functionality.
          </p>
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
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdated}
          </Badge>
        </div>

        {/* Quick Summary */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">We collect minimal data</h4>
                <p className="text-muted-foreground">
                  Only what's necessary to provide our services
                </p>
              </div>
              <div className="text-center">
                <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Your data is secure</h4>
                <p className="text-muted-foreground">
                  Protected with industry-standard encryption
                </p>
              </div>
              <div className="text-center">
                <UserCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">You have control</h4>
                <p className="text-muted-foreground">
                  Access, update, or delete your data anytime
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
              Questions About This Policy?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us:
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

export default Privacy;


//good to go