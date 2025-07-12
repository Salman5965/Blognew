import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import oauthService from "@/services/oauthService";
import { Github, Apple } from "lucide-react";

const OAuthButtons = ({ disabled = false, type = "login" }) => {
  const [availableProviders, setAvailableProviders] = useState([]);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAvailableProviders();
  }, []);

  const checkAvailableProviders = async () => {
    try {
      setChecking(true);
      const providers = await oauthService.getAvailableProviders();
      setAvailableProviders(providers);
    } catch (error) {
      console.warn("Failed to check OAuth providers:", error);
      // If check fails, assume no providers are available
      setAvailableProviders([]);
    } finally {
      setChecking(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      switch (provider) {
        case "google":
          await oauthService.loginWithGoogle();
          break;
        case "github":
          await oauthService.loginWithGitHub();
          break;
        case "apple":
          await oauthService.loginWithApple();
          break;
        default:
          throw new Error(`Unsupported OAuth provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      toast({
        title: "Authentication Error",
        description: `Failed to ${type} with ${provider}. Please try again or use email/password.`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Don't render anything while checking or if no providers available
  if (checking) {
    return null; // Or a loading skeleton
  }

  if (availableProviders.length === 0) {
    return null;
  }

  const renderProviderButton = (provider) => {
    const providerConfig = {
      google: {
        icon: (
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
        ),
        name: "Google",
      },
      github: {
        icon: <Github className="h-5 w-5" />,
        name: "GitHub",
      },
      apple: {
        icon: <Apple className="h-5 w-5" />,
        name: "Apple",
      },
    };

    const config = providerConfig[provider];
    if (!config) return null;

    return (
      <Button
        key={provider}
        type="button"
        variant="outline"
        className="h-11"
        onClick={() => handleOAuthLogin(provider)}
        disabled={disabled}
        title={`${type === "login" ? "Sign in" : "Sign up"} with ${config.name}`}
      >
        {config.icon}
      </Button>
    );
  };

  return (
    <>
      {/* OAuth divider */}
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      {/* OAuth buttons */}
      <div
        className={`grid gap-3 w-full ${
          availableProviders.length === 1
            ? "grid-cols-1"
            : availableProviders.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        }`}
      >
        {availableProviders.map(renderProviderButton)}
      </div>
    </>
  );
};

export default OAuthButtons;
