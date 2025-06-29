import React, { useEffect, useState, useRef } from "react";
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
import { useAuthContext } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { validateEmail, validatePassword } from "@/utils/validators";
import { ROUTES } from "@/utils/constant";
import { Loader2, BookOpen, Eye, EyeOff } from "lucide-react";

// Import toast hook — adjust path if needed
import { useToast } from "@/hooks/use-toast";

const RATE_LIMIT_DELAY = 1000; // 1 second between login attempts

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const lastLoginAttempt = useRef(0);
  const isLoginInProgress = useRef(false);
  const countdownInterval = useRef(null);

  // Toast trigger
  const { toast } = useToast();

  // Redirect target after login
  const from =
    (location.state && location.state.from && location.state.from.pathname) ||
    ROUTES.DASHBOARD;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  const startRateLimitCountdown = (seconds) => {
    setRateLimitCountdown(seconds);
    countdownInterval.current = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetRateLimit = () => {
    lastLoginAttempt.current = 0;
    setRateLimitCountdown(0);
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    toast({
      title: "Rate limit reset",
      description: "You can now try logging in again",
      duration: 2000,
    });
  };

  const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};

      const emailError = validateEmail(values.email);
      if (emailError) errors.email = emailError;

      const passwordError = validatePassword(values.password);
      if (passwordError) errors.password = passwordError;

      return errors;
    },
    onSubmit: async (values) => {
      // Rate limiting check
      const now = Date.now();
      const timeSinceLastAttempt = now - lastLoginAttempt.current;

      if (timeSinceLastAttempt < RATE_LIMIT_DELAY) {
        const waitTime = Math.ceil(
          (RATE_LIMIT_DELAY - timeSinceLastAttempt) / 1000,
        );
        startRateLimitCountdown(waitTime);
        toast({
          title: "Please wait",
          description: `Too many login attempts. Please wait ${waitTime} second${waitTime !== 1 ? "s" : ""} before trying again.`,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Prevent concurrent requests
      if (isLoginInProgress.current) {
        return;
      }

      try {
        isLoginInProgress.current = true;
        lastLoginAttempt.current = now;

        console.log("Attempting login with:", { email: values.email }); // Debug log
        await login(values); // Make sure login throws error on failure!

        // Clear rate limiting on successful login
        lastLoginAttempt.current = 0;
        setRateLimitCountdown(0);
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
          variant: "default",
          duration: 3000,
        });
      } catch (error) {
        console.error("Login error:", error); // Debug log

        // Handle specific error types
        let title = "Login failed";
        let description =
          "Invalid credentials. Please check your email and password.";
        let shouldStartCountdown = false;

        if (
          error.message?.includes("Too many login attempts") ||
          error.response?.status === 429
        ) {
          title = "Too many attempts";
          description =
            "You've made too many login attempts. Please wait a moment before trying again.";
          shouldStartCountdown = true;

          // Start a shorter countdown for server-side rate limiting
          startRateLimitCountdown(30); // 30 seconds for server rate limiting
        } else if (error.response?.status === 401) {
          description =
            "Invalid email or password. Please check your credentials.";
        } else if (error.response?.status >= 500) {
          title = "Server error";
          description =
            "Our servers are experiencing issues. Please try again later.";
        } else if (error.isNetworkError || !error.response) {
          title = "Connection error";
          description =
            "Unable to connect to our servers. Please check your internet connection.";
        } else if (error.message) {
          description = error.message;
        }

        toast({
          title,
          description,
          variant: "destructive",
          duration: shouldStartCountdown ? 8000 : 5000,
        });
      } finally {
        isLoginInProgress.current = false;
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={(e) => setValue("email", e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
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
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || rateLimitCountdown > 0}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {rateLimitCountdown > 0
                ? `Wait ${rateLimitCountdown}s`
                : isSubmitting
                  ? "Signing In..."
                  : "Sign In"}
            </Button>

            {/* Rate limit info and reset */}
            {rateLimitCountdown > 0 && (
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Too many attempts. Please wait {rateLimitCountdown} seconds.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetRateLimit}
                  className="text-xs h-8"
                >
                  Reset and try again
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
