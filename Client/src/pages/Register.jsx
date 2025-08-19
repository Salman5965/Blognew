import React, { useEffect, useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useForm } from "@/hooks/useForm";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/utils/validators";
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
  Upload,
  User,
  Building,
  Check,
  X,
  Zap,
  Users,
  Star,
  Camera,
  Info,
} from "lucide-react";

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

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState("personal");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({
    question: "",
    answer: 0,
  });

  const fileInputRef = useRef(null);

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptchaQuestion({ question: `${num1} + ${num2}`, answer });
    setCaptchaAnswer("");
  };

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle profile image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfileImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // OAuth signup handlers
  const handleOAuthSignup = (provider) => {
    toast({
      title: "OAuth Registration",
      description: `${provider} signup integration would be implemented here`,
      duration: 3000,
    });
  };

  // Form validation and submission
  const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
      website: "",
    },
    validate: (values) => {
      const errors = {};

      // Step 1 validations
      if (currentStep >= 1) {
        if (!values.firstName.trim()) {
          errors.firstName = "First name is required";
        } else if (values.firstName.length < 2) {
          errors.firstName = "First name must be at least 2 characters";
        }

        if (!values.lastName.trim()) {
          errors.lastName = "Last name is required";
        } else if (values.lastName.length < 2) {
          errors.lastName = "Last name must be at least 2 characters";
        }

        if (!values.username.trim()) {
          errors.username = "Username is required";
        } else {
          const usernameError = validateUsername(values.username);
          if (usernameError) errors.username = usernameError;
        }
      }

      // Step 2 validations
      if (currentStep >= 2) {
        if (!values.email.trim()) {
          errors.email = "Email is required";
        } else {
          const emailError = validateEmail(values.email);
          if (emailError) errors.email = emailError;
        }

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
      }

      // Step 3 validations
      if (currentStep >= 3) {
        if (accountType === "business") {
          if (!values.company.trim()) {
            errors.company = "Company name is required for business accounts";
          }
        }

        if (!agreedToTerms) {
          errors.terms = "You must agree to the Terms & Conditions";
        }

        // Captcha validation
        const userAnswer = parseInt(captchaAnswer);
        if (isNaN(userAnswer) || userAnswer !== captchaQuestion.answer) {
          errors.captcha = "Incorrect captcha answer";
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Prepare registration data
        const registrationData = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          accountType,
          agreedToMarketing,
        };

        // Add business-specific fields
        if (accountType === "business") {
          registrationData.company = values.company.trim();
          if (values.website.trim()) {
            registrationData.website = values.website.trim();
          }
        }

        // Add profile image if uploaded
        if (profileImage) {
          registrationData.profileImage = profileImage;
        }

        await register(registrationData);

        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account.",
          duration: 5000,
        });

        // Redirect to email verification page or login
        navigate(ROUTES.LOGIN, {
          state: {
            message:
              "Account created! Please check your email for verification.",
            email: values.email,
          },
        });
      } catch (error) {
        console.error("Registration error:", error);

        let title = "Registration Failed";
        let description =
          "An error occurred during registration. Please try again.";

        if (error.response?.status === 409) {
          description =
            "An account with this email or username already exists.";
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
  const canProceedToStep2 =
    values.firstName &&
    values.lastName &&
    values.username &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.username;
  const canProceedToStep3 =
    canProceedToStep2 &&
    values.email &&
    values.password &&
    values.confirmPassword &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;
  const canSubmit = canProceedToStep3 && agreedToTerms && !errors.captcha;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding/Benefits */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 via-teal-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <BookOpen className="h-12 w-12 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Join WriteNest</h1>
            <p className="text-xl text-green-100 mb-8">
              Start your writing journey with thousands of creators worldwide
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Publishing</h3>
                <p className="text-green-100">
                  Share your stories with the world in seconds
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Growing Community</h3>
                <p className="text-green-100">
                  10k+ active writers and readers
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Get Discovered</h3>
                <p className="text-green-100">
                  Featured stories reach millions of readers
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <blockquote className="text-green-100 italic mb-4">
              "I published my first story here and got 50k views in a week! The
              community is amazing."
            </blockquote>
            <cite className="text-green-200 text-sm">
              - Alex M., New Author
            </cite>
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
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
                Create your account
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Join our community of passionate writers and readers
              </CardDescription>

              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentStep} of 3</span>
                  <span>{Math.round((currentStep / 3) * 100)}% complete</span>
                </div>
                <Progress value={(currentStep / 3) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Personal Info</span>
                  <span>Account Details</span>
                  <span>Verification</span>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="font-semibold">Tell us about yourself</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll use this to personalize your experience
                      </p>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profileImagePreview} />
                          <AvatarFallback className="text-lg">
                            {values.firstName.charAt(0)}
                            {values.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Optional: Add a profile picture (max 5MB)
                      </p>
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={values.firstName}
                          onChange={(e) =>
                            setValue("firstName", e.target.value)
                          }
                          disabled={isSubmitting}
                          autoFocus
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={values.lastName}
                          onChange={(e) => setValue("lastName", e.target.value)}
                          disabled={isSubmitting}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <Input
                          id="username"
                          placeholder="johndoe"
                          value={values.username}
                          onChange={(e) =>
                            setValue("username", e.target.value.toLowerCase())
                          }
                          disabled={isSubmitting}
                          className="pr-10"
                        />
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {errors.username && (
                        <p className="text-sm text-destructive flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {errors.username}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        This will be your unique identifier. Choose wisely!
                      </p>
                    </div>

                    {/* Account Type */}
                    <div className="space-y-3">
                      <Label>Account Type</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={
                            accountType === "personal" ? "default" : "outline"
                          }
                          className="h-auto p-4 flex flex-col items-center space-y-2"
                          onClick={() => setAccountType("personal")}
                        >
                          <User className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Personal</div>
                            <div className="text-xs opacity-70">
                              For individual writers
                            </div>
                          </div>
                        </Button>

                        <Button
                          type="button"
                          variant={
                            accountType === "business" ? "default" : "outline"
                          }
                          className="h-auto p-4 flex flex-col items-center space-y-2"
                          onClick={() => setAccountType("business")}
                        >
                          <Building className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-semibold">Business</div>
                            <div className="text-xs opacity-70">
                              For organizations
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Account Details */}
                {currentStep === 2 && (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="font-semibold">Account credentials</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a secure email and password
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={values.email}
                          onChange={(e) => setValue("email", e.target.value)}
                          disabled={isSubmitting}
                          className="pr-10"
                          autoFocus
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

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={values.password}
                          onChange={(e) => setValue("password", e.target.value)}
                          disabled={isSubmitting}
                          className="pr-10"
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
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
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

                    {/* Business fields */}
                    {accountType === "business" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            placeholder="Acme Corp"
                            value={values.company}
                            onChange={(e) =>
                              setValue("company", e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                          {errors.company && (
                            <p className="text-sm text-destructive flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {errors.company}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website (Optional)</Label>
                          <Input
                            id="website"
                            type="url"
                            placeholder="https://company.com"
                            value={values.website}
                            onChange={(e) =>
                              setValue("website", e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Step 3: Verification & Terms */}
                {currentStep === 3 && (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="font-semibold">Almost done!</h3>
                      <p className="text-sm text-muted-foreground">
                        Just a few final steps to secure your account
                      </p>
                    </div>

                    {/* Captcha */}
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
                          disabled={isSubmitting}
                          className="w-20"
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateCaptcha}
                          disabled={isSubmitting}
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

                    {/* Terms & Conditions */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={setAgreedToTerms}
                            disabled={isSubmitting}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor="terms"
                              className="text-sm font-normal cursor-pointer leading-5"
                            >
                              I agree to the{" "}
                              <Link
                                to="/terms"
                                className="text-primary hover:underline"
                                target="_blank"
                              >
                                Terms & Conditions
                              </Link>{" "}
                              and{" "}
                              <Link
                                to="/privacy"
                                className="text-primary hover:underline"
                                target="_blank"
                              >
                                Privacy Policy
                              </Link>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Required to create an account
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="marketing"
                            checked={agreedToMarketing}
                            onCheckedChange={setAgreedToMarketing}
                            disabled={isSubmitting}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor="marketing"
                              className="text-sm font-normal cursor-pointer leading-5"
                            >
                              Send me writing tips, feature updates, and
                              community highlights
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Optional - you can unsubscribe anytime
                            </p>
                          </div>
                        </div>
                      </div>

                      {errors.terms && (
                        <p className="text-sm text-destructive flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {errors.terms}
                        </p>
                      )}
                    </div>

                    {/* Email verification notice */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        After creating your account, we'll send a verification
                        email to <strong>{values.email}</strong>. Please check
                        your inbox and spam folder.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-6">
                {/* Navigation buttons */}
                <div className="flex space-x-3 w-full">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={
                        isSubmitting ||
                        (currentStep === 1 && !canProceedToStep2) ||
                        (currentStep === 2 && !canProceedToStep3)
                      }
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1 h-11 text-base font-medium"
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>

                {/* OAuth section (only on first step) */}
                {currentStep === 1 && (
                  <>
                    <div className="relative w-full">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                        or sign up with
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => handleOAuthSignup("Google")}
                        disabled={isSubmitting}
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
                        onClick={() => handleOAuthSignup("GitHub")}
                        disabled={isSubmitting}
                      >
                        <Github className="h-5 w-5" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => handleOAuthSignup("Apple")}
                        disabled={isSubmitting}
                      >
                        <Apple className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}

                {/* Login link */}
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </div>

                {/* Security notice */}
                <div className="text-center text-xs text-muted-foreground pt-4">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Shield className="h-3 w-3" />
                    <span>Your data is protected and encrypted</span>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <span>• GDPR compliant</span>
                    <span>• SOC 2 certified</span>
                    <span>• 99.9% uptime</span>
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

export default Register;
