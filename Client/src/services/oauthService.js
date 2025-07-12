import { API_BASE_URL } from "@/utils/constant";

class OAuthService {
  // Google OAuth
  async loginWithGoogle() {
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error("Google OAuth error:", error);
      throw new Error("Failed to initiate Google authentication");
    }
  }

  // GitHub OAuth
  async loginWithGitHub() {
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${API_BASE_URL}/auth/github`;
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      throw new Error("Failed to initiate GitHub authentication");
    }
  }

  // Apple OAuth (requires Apple ID setup)
  async loginWithApple() {
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${API_BASE_URL}/auth/apple`;
    } catch (error) {
      console.error("Apple OAuth error:", error);
      throw new Error("Failed to initiate Apple authentication");
    }
  }

  // Handle OAuth callback (for client-side processing if needed)
  async handleOAuthCallback(provider, code, state) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/${provider}/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OAuth authentication failed");
      }

      return data;
    } catch (error) {
      console.error(`${provider} OAuth callback error:`, error);
      throw error;
    }
  }

  // Check if OAuth provider is available
  async checkProviderAvailability(provider) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/providers/${provider}`,
      );
      const data = await response.json();
      return data.available === true;
    } catch (error) {
      console.warn(`Could not check ${provider} availability:`, error);
      return false;
    }
  }

  // Get available OAuth providers
  async getAvailableProviders() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/providers`);
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.warn("Could not fetch available providers:", error);
      return [];
    }
  }
}

export const oauthService = new OAuthService();
export default oauthService;
