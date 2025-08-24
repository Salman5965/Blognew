
import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cookie,
  Settings,
  Shield,
  BarChart3,
  Target,
  Globe,
  Eye,
  RefreshCw,
  CheckCircle,
  X,
  Mail,
} from "lucide-react";

const Cookies = () => {
  const lastUpdated = "December 1, 2024";
  const [cookieSettings, setCookieSettings] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false,
    preferences: true,
  });

  const handleCookieSettingChange = (type) => {
    if (type === "essential") return; // Essential cookies cannot be disabled

    setCookieSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const saveCookieSettings = () => {
    // In a real app, this would save to localStorage and update actual cookie settings
    localStorage.setItem("cookiePreferences", JSON.stringify(cookieSettings));
    alert("Cookie preferences saved!");
  };

  const cookieTypes = [
    {
      id: "essential",
      title: "Essential Cookies",
      icon: Shield,
      required: true,
      description:
        "These cookies are necessary for the website to function and cannot be switched off.",
      examples: [
        "Authentication and session management",
        "Security features and fraud prevention",
        "Website functionality and navigation",
        "Load balancing and performance",
      ],
      retention: "Session or up to 1 year",
      enabled: cookieSettings.essential,
    },
    {
      id: "analytics",
      title: "Analytics Cookies",
      icon: BarChart3,
      required: false,
      description:
        "These cookies help us understand how visitors interact with our website.",
      examples: [
        "Page views and user behavior tracking",
        "Popular content and feature usage",
        "Performance monitoring and optimization",
        "Error tracking and debugging",
      ],
      retention: "Up to 2 years",
      enabled: cookieSettings.analytics,
    },
    {
      id: "marketing",
      title: "Marketing Cookies",
      icon: Target,
      required: false,
      description:
        "These cookies are used to track visitors across websites for advertising purposes.",
      examples: [
        "Personalized advertisements",
        "Social media integration",
        "Email marketing campaign tracking",
        "Affiliate and partner tracking",
      ],
      retention: "Up to 1 year",
      enabled: cookieSettings.marketing,
    },
    {
      id: "preferences",
      title: "Preference Cookies",
      icon: Settings,
      required: false,
      description:
        "These cookies remember your choices and preferences for a personalized experience.",
      examples: [
        "Theme and display preferences",
        "Language and region settings",
        "Font size and accessibility options",
        "Dashboard and layout customizations",
      ],
      retention: "Up to 1 year",
      enabled: cookieSettings.preferences,
    },
  ];

  const thirdPartyServices = [
    {
      name: "Google Analytics",
      purpose: "Website analytics and user behavior tracking",
      cookies: "_ga, _ga_*, _gid",
      privacy: "https://policies.google.com/privacy",
      optOut: "https://tools.google.com/dlpage/gaoptout",
    },
    {
      name: "Cloudflare",
      purpose: "Content delivery and security protection",
      cookies: "__cflb, __cf_bm, cf_clearance",
      privacy: "https://www.cloudflare.com/privacy/",
      optOut: "Contact support",
    },
    {
      name: "Stripe",
      purpose: "Payment processing and fraud prevention",
      cookies: "__stripe_mid, __stripe_sid",
      privacy: "https://stripe.com/privacy",
      optOut: "Required for payments",
    },
  ];

  return (
    <PageWrapper className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Cookie className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Learn about how we use cookies and similar technologies to improve
            your experience on SilentVoice.
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdated}
          </Badge>
        </div>

        {/* What Are Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cookie className="h-5 w-5 mr-2" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Cookies are small text files that are stored on your computer or
              mobile device when you visit a website. They help websites
              remember information about your visit, which can make it easier to
              visit the site again and make the site more useful to you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">First-Party Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Set directly by SilentVoice
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Third-Party Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Set by external services
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <RefreshCw className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Session vs Persistent</h4>
                <p className="text-sm text-muted-foreground">
                  Temporary or long-term storage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold">Types of Cookies We Use</h2>
          {cookieTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Icon className="h-5 w-5 mr-3 text-primary" />
                      {type.title}
                      {type.required && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Required
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {type.required ? (
                        <span className="text-sm text-muted-foreground">
                          Always Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCookieSettingChange(type.id)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            type.enabled ? "bg-primary" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              type.enabled
                                ? "transform translate-x-7"
                                : "transform translate-x-1"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{type.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      <ul className="text-sm space-y-1">
                        {type.examples.map((example, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Retention Period:</h4>
                      <p className="text-sm text-muted-foreground">
                        {type.retention}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cookie Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              You can manage your cookie preferences below. Please note that
              disabling certain cookies may affect the functionality of our
              website.
            </p>

            <div className="space-y-4 mb-6">
              {cookieTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{type.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {type.required ? (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    ) : (
                      <button
                        onClick={() => handleCookieSettingChange(type.id)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          type.enabled ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            type.enabled
                              ? "transform translate-x-7"
                              : "transform translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={saveCookieSettings}
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCookieSettings({
                    essential: true,
                    analytics: false,
                    marketing: false,
                    preferences: false,
                  })
                }
              >
                <X className="h-4 w-4 mr-2" />
                Reject All Optional
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              We use third-party services that may set their own cookies. Here
              are the main services we use:
            </p>

            <div className="space-y-4">
              {thirdPartyServices.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{service.name}</h4>
                    <div className="flex gap-2">
                      <a
                        href={service.privacy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        Privacy Policy
                      </a>
                      {service.optOut !== "Required for payments" &&
                        service.optOut !== "Contact support" && (
                          <a
                            href={service.optOut}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 px-2 py-1 rounded"
                          >
                            Opt Out
                          </a>
                        )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {service.purpose}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Cookies:</strong> {service.cookies}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Managing Cookies in Your Browser</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You can also control cookies through your browser settings. Here's
              how to access cookie settings in popular browsers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Chrome</h4>
                  <p className="text-sm">
                    Settings → Privacy and security → Cookies
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Firefox</h4>
                  <p className="text-sm">
                    Options → Privacy & Security → Cookies
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Safari</h4>
                  <p className="text-sm">Preferences → Privacy → Cookies</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Edge</h4>
                  <p className="text-sm">Settings → Privacy → Cookies</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Blocking all cookies may prevent some
                parts of our website from working properly. We recommend
                allowing essential cookies at minimum.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Questions About Our Cookie Policy?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have any questions about our use of cookies or this Cookie
              Policy, please contact us:
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

export default Cookies;

//page is good to go