// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { useForm } from "@/hooks/useForm";
// import { validateEmail } from "@/utils/validators";
// import { ROUTES } from "@/utils/constant";
// import { useToast } from "@/hooks/use-toast";
// // import OAuthButtons from "@/components/auth/OAuthButtons";
// import {
//   Loader2,
//   Eye,
//   EyeOff,
//   AlertTriangle,
//   Mail,
//   Shield,
// } from "lucide-react";

// export const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isAuthenticated, login } = useAuthContext();
//   const { toast } = useToast();

//   // Simple state management
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   // Redirect target after login
//   const from = location.state?.from?.pathname || ROUTES.FEED;

//   // Check if user is already authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate(from, { replace: true });
//     }
//   }, [isAuthenticated, navigate, from]);

//   // Load remembered login state
//   useEffect(() => {
//     const remembered = localStorage.getItem("rememberLogin");
//     if (remembered === "true") {
//       setRememberMe(true);
//     }
//   }, []);

//   // Simplified form validation and submission
//   const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validate: (values) => {
//       const errors = {};

//       if (!values.email.trim()) {
//         errors.email = "Email or username is required";
//       } else if (values.email.includes("@")) {
//         const emailError = validateEmail(values.email);
//         if (emailError) errors.email = emailError;
//       }

//       if (!values.password) {
//         errors.password = "Password is required";
//       }

//       return errors;
//     },
//     onSubmit: async (values) => {
//       try {
//         const loginData = { ...values, rememberMe };
//         await login(loginData);

//         localStorage.setItem("rememberLogin", rememberMe.toString());

//         toast({
//           title: "Welcome Back!",
//           description: "Login successful.",
//           duration: 3000,
//         });
//       } catch (error) {
//         console.error("Login error:", error);

//         toast({
//           title: "Login Failed",
//           description:
//             "Invalid credentials. Please check your email and password.",
//           variant: "destructive",
//           duration: 5000,
//         });
//       }
//     },
//   });

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4">
//       <div className="w-full max-w-md">
//         <Card className="border-0 shadow-xl">
//           <CardHeader className="space-y-1 pb-6">
//             <CardTitle className="text-2xl font-bold text-center">
//               Welcome back
//             </CardTitle>
//             <CardDescription className="text-center text-muted-foreground">
//               Sign in to your account to continue your writing journey
//             </CardDescription>
//           </CardHeader>

//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               {/* Email/Username input */}
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email or Username</Label>
//                 <div className="relative">
//                   <Input
//                     id="email"
//                     type="text"
//                     placeholder="Enter your email or username"
//                     value={values.email}
//                     onChange={(e) => setValue("email", e.target.value)}
//                     disabled={isSubmitting}
//                     autoComplete="username"
//                     autoFocus
//                     className="pr-10"
//                   />
//                   <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 </div>
//                 {errors.email && (
//                   <p className="text-sm text-destructive flex items-center">
//                     <AlertTriangle className="h-3 w-3 mr-1" />
//                     {errors.email}
//                   </p>
//                 )}
//               </div>

//               {/* Password input */}
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password">Password</Label>
//                   <Link
//                     to={ROUTES.FORGOT_PASSWORD}
//                     className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={values.password}
//                     onChange={(e) => setValue("password", e.target.value)}
//                     disabled={isSubmitting}
//                     autoComplete="current-password"
//                     className="pr-10"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
//                     disabled={isSubmitting}
//                     tabIndex={-1}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-destructive flex items-center">
//                     <AlertTriangle className="h-3 w-3 mr-1" />
//                     {errors.password}
//                   </p>
//                 )}
//               </div>

//               {/* Remember me checkbox */}
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="remember"
//                   checked={rememberMe}
//                   onCheckedChange={setRememberMe}
//                   disabled={isSubmitting}
//                 />
//                 <Label
//                   htmlFor="remember"
//                   className="text-sm font-normal cursor-pointer"
//                 >
//                   Remember me for 30 days
//                 </Label>
//               </div>
//             </CardContent>

//             <CardFooter className="flex flex-col space-y-4 pt-6">
//               {/* Main login button */}
//               <Button
//                 type="submit"
//                 className="w-full h-11 text-base font-medium"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting && (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 )}
//                 {isSubmitting ? "Signing In..." : "Sign In"}
//               </Button>

//               {/* OAuth buttons */}
//               <OAuthButtons disabled={isSubmitting} type="login" />

//               {/* Sign up link */}
//               <div className="text-center text-sm text-muted-foreground">
//                 Don't have an account?{" "}
//                 <Link
//                   to={ROUTES.REGISTER}
//                   className="text-primary hover:underline font-medium"
//                 >
//                   Create one now
//                 </Link>
//               </div>
//             </CardFooter>
//           </form>
//         </Card>
//       </div>
//     </div>
//   );
// };









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

  // OAuth login handlers
  const handleOAuthLogin = (provider) => {
    toast({
      title: "OAuth Login",
      description: `${provider} login integration would be implemented here`,
      duration: 3000,
    });
    // In a real app, redirect to OAuth provider
    // window.location.href = `/auth/${provider.toLowerCase()}`;
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
    <div className="min-h-screen flex justify-center items-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.03] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 hover:bg-card/98">
            <CardHeader className="space-y-4 pb-8 pt-8">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground text-base">
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
              <CardContent className="space-y-6 px-8">
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
                      to="/forgot-password"
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

              <CardFooter className="flex flex-col space-y-6 pt-8 px-8 pb-8">
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

                {/* OAuth divider */}
                <div className="relative w-full">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                    or continue with
                  </span>
                </div>

                {/* OAuth buttons */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => handleOAuthLogin("Google")}
                    disabled={isSubmitting || isLocked}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => handleOAuthLogin("GitHub")}
                    disabled={isSubmitting || isLocked}
                  >
                    <Github className="h-5 w-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => handleOAuthLogin("Apple")}
                    disabled={isSubmitting || isLocked}
                  >
                    <Apple className="h-5 w-5" />
                  </Button>
                </div>

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
