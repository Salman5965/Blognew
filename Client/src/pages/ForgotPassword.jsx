import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { useForm } from "@/hooks/useForm";
import { validateEmail } from "@/utils/validators";
import { ROUTES } from "@/utils/constant";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  BookOpen,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  Mail,
  ArrowLeft,
  Shield,
  Clock,
} from "lucide-react";
import apiService from "@/services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
    initialValues: {
      email: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.email.trim()) {
        errors.email = "Email is required";
      } else {
        const emailError = validateEmail(values.email);
        if (emailError) errors.email = emailError;
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Call forgot password API
        const response = await apiService.post("/auth/forgot-password", {
          email: values.email.trim(),
        });

        if (response.status === "success") {
          setEmailSent(true);
          setSentEmail(values.email);

          toast({
            title: "Reset Email Sent",
            description: "Check your inbox for password reset instructions.",
            duration: 5000,
          });
        } else {
          throw new Error(response.message || "Failed to send reset email");
        }
      } catch (error) {
        console.error("Forgot password error:", error);

        let title = "Request Failed";
        let description = "Unable to send reset email. Please try again.";

        if (error.response?.status === 404) {
          description = "No account found with this email address.";
        } else if (error.response?.status === 429) {
          title = "Too Many Requests";
          description = "Please wait before requesting another reset email.";
        } else if (error.response?.status >= 500) {
          title = "Server Error";
          description =
            "Our servers are experiencing issues. Please try again later.";
        } else if (error.message) {
          description = error.message;
        }

        toast({
          title,
          description,
          variant: "destructive",
          duration: 5000,
        });
      }
    },
  });

  const handleResendEmail = async () => {
    if (!sentEmail) return;

    try {
      const response = await apiService.post("/auth/forgot-password", {
        email: sentEmail,
      });

      if (response.status === "success") {
        toast({
          title: "Email Resent",
          description: "Check your inbox for the new reset email.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Unable to resend email. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <BookOpen className="h-12 w-12 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Password Reset</h1>
            <p className="text-xl text-indigo-100 mb-8">
              Don't worry, it happens to the best of us. Let's get you back to
              writing!
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Process</h3>
                <p className="text-indigo-100">
                  Your security is our top priority
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Recovery</h3>
                <p className="text-indigo-100">
                  Back to writing in just a few clicks
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-indigo-100 text-sm">
              💡 <strong>Tip:</strong> Use a password manager to generate and
              store secure passwords for all your accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Reset form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Theme toggle */}
          <div className="flex justify-between items-center mb-8">
            <div className="lg:hidden">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-auto"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                {emailSent ? "Check your email" : "Reset your password"}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                {emailSent
                  ? `We've sent password reset instructions to ${sentEmail}`
                  : "Enter your email address and we'll send you a link to reset your password"}
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={values.email}
                        onChange={(e) => setValue("email", e.target.value)}
                        disabled={isSubmitting}
                        autoComplete="email"
                        autoFocus
                        className="pr-10"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      For security reasons, we'll only send reset instructions
                      to registered email addresses.
                    </AlertDescription>
                  </Alert>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                  </Button>

                  <div className="text-center">
                    <Link
                      to={ROUTES.LOGIN}
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to sign in
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Email sent successfully!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    We've sent password reset instructions to your email. The
                    link will expire in 1 hour for security.
                  </p>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Don't see the email?</strong> Check your spam folder
                    or try resending.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full"
                  >
                    Resend Email
                  </Button>

                  <div className="text-center">
                    <Link
                      to={ROUTES.LOGIN}
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to sign in
                    </Link>
                  </div>
                </div>

                {/* Email client quick links */}
                <div className="pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Quick access to your email:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a
                        href="https://gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Gmail
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a
                        href="https://outlook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Outlook
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a
                        href="https://yahoo.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Yahoo
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Help section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Still having trouble?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
