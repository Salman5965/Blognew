import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/utils/validators";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  Crown,
  Lock,
  Mail,
  User,
  CheckCircle,
  Key,
  UserCheck,
  AlertCircle,
} from "lucide-react";

export const AdminRegister = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminKeyRequired, setAdminKeyRequired] = useState(true);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

  // Check if user is already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.isAdmin) {
        navigate("/dashboard/ai-content", { replace: true });
      } else {
        toast({
          title: "Access Denied",
          description: "You need administrator privileges to access this area.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Check if any admin exists
  useEffect(() => {
    checkExistingAdmins();
  }, []);

  const checkExistingAdmins = async () => {
    try {
      setCheckingAdmins(true);

      // Use full URL to ensure proper routing
      const apiUrl = `${window.location.origin}/api/auth/check-admin-exists`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setAdminKeyRequired(data.adminExists);
        if (data.adminExists) {
          toast({
            title: "Admin Registration Restricted",
            description:
              "Administrator accounts already exist. Contact existing admin for access.",
            variant: "destructive",
          });
          navigate("/admin/login", { replace: true });
        }
      } else {
        // If API doesn't return success, assume admins exist for security
        setAdminKeyRequired(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      // If check fails, assume key is required for security
      setAdminKeyRequired(true);
    } finally {
      setCheckingAdmins(false);
    }
  };

  // Form validation
  const validateForm = (values) => {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = "First name is required";
    }

    if (!values.lastName) {
      errors.lastName = "Last name is required";
    }

    if (!values.username) {
      errors.username = "Username is required";
    } else if (!validateUsername(values.username)) {
      errors.username =
        "Username must be 3-30 characters, letters, numbers, and underscores only";
    }

    if (!values.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(values.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(values.password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Password confirmation is required";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (adminKeyRequired && !values.adminKey) {
      errors.adminKey = "Administrator registration key is required";
    }

    if (!values.justification) {
      errors.justification = "Please provide justification for admin access";
    } else if (values.justification.length < 20) {
      errors.justification = "Justification must be at least 20 characters";
    }

    return errors;
  };

  // Form hook
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminKey: "",
      justification: "",
    },
    validateForm,
    async (formData) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/register-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            adminKey: formData.adminKey,
            justification: formData.justification,
          }),
        });

        const data = await response.json();

        if (data.status === "success") {
          toast({
            title: "Admin Registration Successful",
            description:
              "Your administrator account has been created. You can now sign in.",
            duration: 7000,
          });
          navigate("/admin/login", { replace: true });
        } else {
          throw new Error(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Admin registration error:", error);
        toast({
          title: "Registration Failed",
          description:
            error.message || "Failed to create administrator account.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
  );

  if (checkingAdmins) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-muted-foreground">
              Checking system configuration...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <Card className="w-full max-w-2xl relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-purple-200 dark:border-purple-800 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Administrator Registration
            </CardTitle>
            <CardDescription className="text-base">
              Create a new administrator account for SilentVoice
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
            >
              <Crown className="h-3 w-3 mr-1" />
              Initial Admin Setup
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={values.firstName}
                    onChange={handleChange}
                    className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={values.lastName}
                    onChange={handleChange}
                    className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={values.username}
                  onChange={handleChange}
                  className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                  disabled={isSubmitting}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={values.email}
                  onChange={handleChange}
                  className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Security Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={values.password}
                      onChange={handleChange}
                      className="pr-10 border-purple-200 dark:border-purple-800 focus:border-purple-500"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      className="pr-10 border-purple-200 dark:border-purple-800 focus:border-purple-500"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {adminKeyRequired && (
                <div className="space-y-2">
                  <Label htmlFor="adminKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-purple-600" />
                    Administrator Registration Key
                  </Label>
                  <Input
                    id="adminKey"
                    name="adminKey"
                    type="password"
                    placeholder="Enter administrator registration key"
                    value={values.adminKey}
                    onChange={handleChange}
                    className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                    disabled={isSubmitting}
                  />
                  {errors.adminKey && (
                    <p className="text-sm text-red-500">{errors.adminKey}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Contact your system administrator for the registration key.
                  </p>
                </div>
              )}
            </div>

            {/* Justification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Justification
              </h3>

              <div className="space-y-2">
                <Label htmlFor="justification">
                  Why do you need administrator access?
                </Label>
                <Textarea
                  id="justification"
                  name="justification"
                  placeholder="Provide a detailed justification for requiring administrator privileges..."
                  value={values.justification}
                  onChange={handleChange}
                  className="min-h-[100px] border-purple-200 dark:border-purple-800 focus:border-purple-500"
                  disabled={isSubmitting}
                />
                {errors.justification && (
                  <p className="text-sm text-red-500">{errors.justification}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This information will be logged for security purposes.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Administrator Account...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Administrator Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800">
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                Administrator accounts have full system access. All registration
                attempts are logged and require proper authorization. Only
                create admin accounts when necessary.
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an admin account?{" "}
              <Link
                to="/admin/login"
                className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
              >
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Regular user?{" "}
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
              >
                Use standard login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRegister;
