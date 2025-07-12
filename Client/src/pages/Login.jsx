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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useForm } from "@/hooks/useForm";
import { validateEmail, validatePassword } from "@/utils/validators";
import { ROUTES } from "@/utils/constant";
import { useToast } from "@/hooks/use-toast";
import OAuthButtons from "@/components/auth/OAuthButtons";
import {
  Loader2,
  BookOpen,
  Eye,
  EyeOff,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  Github,
  Mail,
  Apple,
  Shield,
  Zap,
  Users,
  Star,
} from "lucide-react";

// Rate limiting configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds between attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300; // 5 minutes lockout after max attempts

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({
    question: "",
    answer: 0,
  });

  // Refs for rate limiting
  const lastLoginAttempt = useRef(0);
  const isLoginInProgress = useRef(false);
  const countdownInterval = useRef(null);

  // Redirect target after login
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ["+", "-", "*"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let answer;
    let question;

    switch (operation) {
      case "+":
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case "-":
        // Ensure positive result
        const [bigger, smaller] = num1 >= num2 ? [num1, num2] : [num2, num1];
        answer = bigger - smaller;
        question = `${bigger} - ${smaller}`;
        break;
      case "*":
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    setCaptchaQuestion({ question, answer });
    setCaptchaAnswer("");
  };

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

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

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  // Rate limiting countdown
  const startCountdown = (seconds) => {
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

  // Form validation and submission
  const {
    values,
    errors,
    isSubmitting,
    setValue,
    handleSubmit,
    setFieldError,
  } = useForm({
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
      } else if (values.email.length < 3) {
        errors.email = "Username must be at least 3 characters";
      }

      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      // Captcha validation if shown
      if (showCaptcha) {
        const userAnswer = parseInt(captchaAnswer);
        if (isNaN(userAnswer) || userAnswer !== captchaQuestion.answer) {
          errors.captcha = "Incorrect captcha answer";
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      // Check if account is locked
      if (isLocked) {
        toast({
          title: "Account Temporarily Locked",
          description:
            "Too many failed attempts. Please wait before trying again.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Rate limiting check
      const now = Date.now();
      const timeSinceLastAttempt = now - lastLoginAttempt.current;

      if (timeSinceLastAttempt < RATE_LIMIT_DELAY) {
        const waitTime = Math.ceil(
          (RATE_LIMIT_DELAY - timeSinceLastAttempt) / 1000,
        );
        startCountdown(waitTime);
        toast({
          title: "Please Wait",
          description: `Please wait ${waitTime} seconds between login attempts.`,
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

        // Add remember me to login data
        const loginData = {
          ...values,
          rememberMe,
        };

        await login(loginData);

        // Success - reset attempt count and save remember preference
        setAttemptCount(0);
        setIsLocked(false);
        setShowCaptcha(false);

        localStorage.setItem("rememberLogin", rememberMe.toString());

        toast({
          title: "Welcome Back!",
          description: "Login successful. Redirecting to your dashboard...",
          duration: 3000,
        });
      } catch (error) {
        console.error("Login error:", error);

        // Increment attempt count
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        // Show captcha after 2 failed attempts
        if (newAttemptCount >= 2) {
          setShowCaptcha(true);
          generateCaptcha();
        }

        // Lock account after max attempts
        if (newAttemptCount >= MAX_ATTEMPTS) {
          setIsLocked(true);
          startCountdown(LOCKOUT_DURATION);
          toast({
            title: "Account Temporarily Locked",
            description: `Too many failed login attempts. Account locked for ${Math.floor(LOCKOUT_DURATION / 60)} minutes.`,
            variant: "destructive",
            duration: 10000,
          });
          return;
        }

        // Handle specific error types
        let title = "Login Failed";
        let description =
          "Invalid credentials. Please check your email and password.";

        if (error.response?.status === 429) {
          title = "Too Many Attempts";
          description = "Please wait before trying again.";
          startCountdown(30);
        } else if (error.response?.status === 401) {
          description = "Invalid email/username or password.";
        } else if (error.response?.status >= 500) {
          title = "Server Error";
          description =
            "Our servers are experiencing issues. Please try again later.";
        } else if (error.message?.toLowerCase().includes("network")) {
          title = "Connection Error";
          description = "Please check your internet connection.";
        }

        toast({
          title,
          description: `${description} (${MAX_ATTEMPTS - newAttemptCount} attempts remaining)`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        isLoginInProgress.current = false;
      }
    },
  });

  const isRateLimited = rateLimitCountdown > 0;
  const canSubmit = !isSubmitting && !isRateLimited && !isLocked;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Left side - Branding/Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <BookOpen className="h-12 w-12 mb-4" />
            <h1 className="text-4xl font-bold mb-4">SilentVoice</h1>
            <p className="text-xl text-blue-100 mb-8">
              Where your stories find their voice in silence
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Lightning Fast</h3>
                <p className="text-blue-100">
                  Instant publishing and real-time collaboration
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Vibrant Community</h3>
                <p className="text-blue-100">
                  Connect with writers and readers worldwide
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Private</h3>
                <p className="text-blue-100">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-blue-100">4.9/5 from 10k+ writers</span>
            </div>
            <blockquote className="text-blue-100 italic">
              "SilentVoice transformed how I share my stories. The quiet space
              here is incredible!"
            </blockquote>
            <cite className="text-blue-200 text-sm">
              - Sarah J., Bestselling Author
            </cite>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
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
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Sign in to your account to continue your writing journey
              </CardDescription>

              {/* Account status indicators */}
              {attemptCount > 0 && !isLocked && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {attemptCount} failed attempt{attemptCount > 1 ? "s" : ""}.
                    {MAX_ATTEMPTS - attemptCount} remaining before temporary
                    lockout.
                  </AlertDescription>
                </Alert>
              )}

              {isLocked && (
                <Alert variant="destructive" className="mt-4">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Account temporarily locked due to multiple failed attempts.
                    {rateLimitCountdown > 0 &&
                      ` Unlocks in ${Math.floor(rateLimitCountdown / 60)}:${(rateLimitCountdown % 60).toString().padStart(2, "0")}`}
                  </AlertDescription>
                </Alert>
              )}
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

                {/* Captcha (shown after failed attempts) */}
                {showCaptcha && (
                  <div className="space-y-2">
                    <Label htmlFor="captcha">Security Check</Label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="bg-muted p-3 rounded text-center font-mono text-lg border">
                          What is {captchaQuestion.question}?
                        </div>
                      </div>
                      <Input
                        id="captcha"
                        type="number"
                        placeholder="Answer"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        disabled={isSubmitting || isLocked}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCaptcha}
                        disabled={isSubmitting || isLocked}
                      >
                        ↻
                      </Button>
                    </div>
                    {errors.captcha && (
                      <p className="text-sm text-destructive flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.captcha}
                      </p>
                    )}
                  </div>
                )}

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
                  disabled={!canSubmit}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLocked
                    ? rateLimitCountdown > 0
                      ? `Locked (${Math.floor(rateLimitCountdown / 60)}:${(rateLimitCountdown % 60).toString().padStart(2, "0")})`
                      : "Account Locked"
                    : isRateLimited
                      ? `Wait ${rateLimitCountdown}s`
                      : isSubmitting
                        ? "Signing In..."
                        : "Sign In"}
                </Button>

                {/* OAuth buttons */}
                <OAuthButtons
                  disabled={isSubmitting || isLocked}
                  type="login"
                />

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
    </div>
  );
};
