import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { validateEmail } from "@/utils/validators";
import { ROUTES } from "@/utils/constant";
import { useToast } from "@/hooks/use-toast";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { Loader2, Eye, EyeOff, AlertTriangle, Mail } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthContext();
  const { toast } = useToast();

  // Simple state management
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect target after login
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Load remembered login state
  useEffect(() => {
    const remembered = localStorage.getItem("rememberLogin");
    if (remembered === "true") {
      setRememberMe(true);
    }
  }, []);

  // Simplified form validation and submission
  const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.email.trim()) {
        errors.email = "Email or username is required";
      } else if (values.email.includes("@")) {
        const emailError = validateEmail(values.email);
        if (emailError) errors.email = emailError;
      }

      if (!values.password) {
        errors.password = "Password is required";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        const loginData = { ...values, rememberMe };
        await login(loginData);

        localStorage.setItem("rememberLogin", rememberMe.toString());

        toast({
          title: "Welcome Back!",
          description: "Login successful.",
          duration: 3000,
        });
      } catch (error) {
        console.error("Login error:", error);

        toast({
          title: "Login Failed",
          description:
            "Invalid credentials. Please check your email and password.",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your account to continue your writing journey
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email/Username input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email or Username</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email or username"
                    value={values.email}
                    onChange={(e) => setValue("email", e.target.value)}
                    disabled={isSubmitting || isLocked}
                    autoComplete="username"
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

              {/* Password input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={(e) => setValue("password", e.target.value)}
                    disabled={isSubmitting || isLocked}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    disabled={isSubmitting || isLocked}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  disabled={isSubmitting || isLocked}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              {/* Main login button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>

              {/* OAuth buttons */}
              <OAuthButtons disabled={isSubmitting || isLocked} type="login" />

              {/* Sign up link */}
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to={ROUTES.REGISTER}
                  className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  Create one now
                </Link>
              </div>

              {/* Security notice */}
              <div className="text-center text-xs text-muted-foreground pt-4">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Shield className="h-3 w-3" />
                  <span>Protected by enterprise-grade security</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <span>• 256-bit SSL encryption</span>
                  <span>• SOC 2 compliant</span>
                  <span>• GDPR ready</span>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
