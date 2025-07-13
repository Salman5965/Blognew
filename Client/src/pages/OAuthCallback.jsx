import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token");
      const provider = searchParams.get("provider");
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "Authentication Failed",
          description: `OAuth authentication with ${provider} failed. Please try again.`,
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token received. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        // Store token and get user data
        localStorage.setItem("authToken", token);

        // Get user data using the token
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();

          // Update auth context
          login(null, null, true, { user: userData.user, token });

          toast({
            title: "Welcome!",
            description: `Successfully signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          });

          // Redirect to dashboard or intended page
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          throw new Error("Failed to get user data");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login, toast]);

  const provider = searchParams.get("provider");
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            {error ? (
              <>
                <XCircle className="h-16 w-16 text-destructive" />
                <h2 className="text-2xl font-bold text-destructive">
                  Authentication Failed
                </h2>
                <p className="text-muted-foreground">
                  There was an error authenticating with {provider}. Redirecting
                  back to login...
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <h2 className="text-2xl font-bold">Completing Sign In</h2>
                <p className="text-muted-foreground">
                  Please wait while we complete your {provider}{" "}
                  authentication...
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
