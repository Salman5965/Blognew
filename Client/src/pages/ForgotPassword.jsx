<<<<<<< HEAD
=======

>>>>>>> refs/remotes/origin/main
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
    <div className="min-h-screen flex justify-center items-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.03] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 hover:bg-card/98">
            <CardHeader className="space-y-4 pb-8 pt-8">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {emailSent ? "Check your email" : "Reset your password"}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground text-base">
                {emailSent
                  ? `We've sent password reset instructions to ${sentEmail}`
                  : "Enter your email address and we'll send you a link to reset your password"}
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-8">
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

                <CardFooter className="flex flex-col space-y-6 pt-8 px-8 pb-8">
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
              <CardContent className="space-y-6 px-8 pb-8">
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
  );
};

export default ForgotPassword;
