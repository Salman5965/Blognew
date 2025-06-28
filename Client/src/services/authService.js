import { LOCAL_STORAGE_KEYS } from "@/utils/constant";
import apiService from "./api";

class AuthService {
  async login(credentials) {
    try {
      const response = await apiService.post("/auth/login", credentials);

      if (response.data && response.data.user && response.data.token) {
        const { user, token } = response.data;
        this.setAuthData(user, token);
        return { user, token };
      }

      throw new Error(response.message || "Login failed");
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await apiService.post("/auth/register", userData);

      if (response.data && response.data.user && response.data.token) {
        const { user, token } = response.data;
        this.setAuthData(user, token);
        return { user, token };
      }

      throw new Error(response.message || "Registration failed");
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      // Continue logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser() {
    const response = await apiService.get("/auth/profile");

    if (response.status === "success") {
      return response.data.user;
    }

    throw new Error(response.message || "Failed to get current user");
  }

  async updateProfile(userData) {
    const response = await apiService.put("/auth/profile", userData);

    if (response.status === "success") {
      this.updateStoredUser(response.data.user);
      return response.data.user;
    }

    throw new Error(response.message || "Failed to update profile");
  }

  async changePassword(currentPassword, newPassword) {
    const response = await apiService.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to change password");
    }
  }

  async forgotPassword(email) {
    const response = await apiService.post("/auth/forgot-password", { email });

    if (!response.success) {
      throw new Error(response.message || "Failed to send reset email");
    }
  }

  async resetPassword(token, newPassword) {
    const response = await apiService.post("/auth/reset-password", {
      token,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to reset password");
    }
  }

  setAuthData(user, token) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    apiService.setAuthToken(token);
  }

  clearAuthData() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
    apiService.clearAuthToken();
  }

  updateStoredUser(user) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  getStoredUser() {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  getStoredToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }

  isAuthenticated() {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}

export const authService = new AuthService();
export default authService;
