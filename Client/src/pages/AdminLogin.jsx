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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { validateEmail } from "@/utils/validators";
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
} from "lucide-react";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, logout, user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect target after login
  const from = location.state?.from?.pathname || "/admin/dashboard";

  // Check if user is already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.isAdmin) {
        navigate(from, { replace: true });
      } else {
        // Regular user trying to access admin portal
        toast({
          title: "Access Denied",
          description: "You need administrator privileges to access this area.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from, toast]);

  // Form validation
  const validateForm = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = "Email or username is required";
    } else if (values.email.includes("@") && !validateEmail(values.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  // Form hook
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      email: "",
      password: "",
    },
    validateForm,
    async (formData) => {
      setIsLoading(true);
      try {
        const response = await login(formData.email, formData.password, false);

        // Check if the logged-in user is actually an admin
        if (
          response.user &&
          (response.user.role === "admin" || response.user.isAdmin)
        ) {
          toast({
            title: "Welcome Back, Administrator",
            description: "You have successfully logged into the admin portal.",
            duration: 5000,
          });
          navigate(from, { replace: true });
        } else {
          // User is not an admin
          toast({
            title: "Access Denied",
            description: "This account does not have administrator privileges.",
            variant: "destructive",
          });
          // Logout the user since they're not an admin
          await logout();
        }
      } catch (error) {
        console.error("Admin login error:", error);
        toast({
          title: "Login Failed",
          description: error.message || "Invalid administrator credentials.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-purple-200 dark:border-purple-800 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to access the administrator dashboard
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
            >
              <Crown className="h-3 w-3 mr-1" />
              Administrator Access
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                Administrator Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Enter your admin email or username"
                  value={values.email}
                  onChange={handleChange}
                  className="pl-10 border-purple-200 dark:border-purple-800 focus:border-purple-500"
                  disabled={isSubmitting}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.email}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                Administrator Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your admin password"
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
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.password}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In as Administrator
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800">
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                This portal is restricted to authorized administrators only. All
                access attempts are logged and monitored.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Regular user?{" "}
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need admin access? Contact the system administrator.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
