import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeContext";
import { useForm } from "@/hooks/useForm";
import { validatePassword } from "@/utils/validators";
import { ROUTES } from "@/utils/constant";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  BookOpen,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Shield,
  ArrowLeft,
} from "lucide-react";
import apiService from "@/services/api";

// Password strength checker
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = "Very Weak";
  let color = "text-red-500";

  if (score >= 5) {
    strength = "Very Strong";
    color = "text-green-500";
  } else if (score >= 4) {
    strength = "Strong";
    color = "text-green-400";
  } else if (score >= 3) {
    strength = "Medium";
    color = "text-yellow-500";
  } else if (score >= 2) {
    strength = "Weak";
    color = "text-orange-500";
  }

  return { checks, score, strength, color, percentage: (score / 5) * 100 };
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  const token = searchParams.get("token");

  // Check if token exists and is valid format
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or missing a token.",
        variant: "destructive",
        duration: 5000,
      });
    } else {
      setTokenValid(true);
    }
  }, [token, toast]);

  const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.password) {
        errors.password = "Password is required";
      } else {
        const passwordStrength = checkPasswordStrength(values.password);
        if (passwordStrength.score < 3) {
          errors.password =
            "Password is too weak. Please include uppercase, lowercase, numbers, and symbols.";
        }
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        const response = await apiService.post("/auth/reset-password", {
          token,
          newPassword: values.password,
        });

        if (response.status === "success") {
          setResetSuccess(true);
          toast({
            title: "Password Reset Successful",
            description: "Your password has been updated successfully.",
            duration: 5000,
          });
        } else {
          throw new Error(response.message || "Failed to reset password");
        }
      } catch (error) {
        console.error("Reset password error:", error);

        let title = "Reset Failed";
        let description = "Failed to reset your password. Please try again.";

        if (error.response?.status === 400) {
          description =
            "Invalid or expired reset token. Please request a new password reset.";
        } else if (error.response?.status === 429) {
          title = "Too Many Attempts";
          description = "Please wait before trying again.";
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

  const passwordStrength = values.password
    ? checkPasswordStrength(values.password)
    : null;

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">
              Invalid Reset Link
            </CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link to={ROUTES.FORGOT_PASSWORD}>Request New Reset Link</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to={ROUTES.LOGIN}>Back to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Password Reset Successfully!
            </CardTitle>
            <CardDescription>
              Your password has been updated. You can now sign in with your new
              password.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link to={ROUTES.LOGIN}>Sign In Now</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-purple-600 via-pink-600 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <BookOpen className="h-12 w-12 mb-4" />
            <h1 className="text-4xl font-bold mb-4">SilentVoice</h1>
            <p className="text-xl text-purple-100 mb-8">
              Create a new password and get back to sharing your stories
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Encrypted</h3>
                <p className="text-purple-100">
                  Your new password is encrypted and secure
                </p>
              </div>
            </div>
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
                Create New Password
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Enter a strong password to secure your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={values.password}
                      onChange={(e) => setValue("password", e.target.value)}
                      disabled={isSubmitting}
                      className="pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {values.password && passwordStrength && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Password strength:
                        </span>
                        <span className={passwordStrength.color}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.percentage}
                        className="h-2"
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div
                          className={`flex items-center space-x-1 ${passwordStrength.checks.length ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {passwordStrength.checks.length ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>8+ characters</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordStrength.checks.uppercase ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {passwordStrength.checks.uppercase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>Uppercase</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordStrength.checks.lowercase ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {passwordStrength.checks.lowercase ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>Lowercase</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordStrength.checks.number ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {passwordStrength.checks.number ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>Number</span>
                        </div>
                        <div
                          className={`flex items-center space-x-1 ${passwordStrength.checks.symbol ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {passwordStrength.checks.symbol ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>Symbol</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-sm text-destructive flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={values.confirmPassword}
                      onChange={(e) =>
                        setValue("confirmPassword", e.target.value)
                      }
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {values.confirmPassword &&
                    values.password === values.confirmPassword && (
                      <p className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Passwords match
                      </p>
                    )}
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    After resetting your password, you'll be signed out of all
                    devices for security purposes.
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
                  {isSubmitting ? "Updating Password..." : "Update Password"}
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


//this is a new file