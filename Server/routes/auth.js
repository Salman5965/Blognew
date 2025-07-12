import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Get available OAuth providers
router.get("/providers", (req, res) => {
  try {
    // For now, return empty array since OAuth is not implemented on backend
    // When implementing OAuth, check environment variables for each provider
    const providers = [];

    // Example of how to check if providers are configured:
    // if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    //   providers.push("google");
    // }
    // if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    //   providers.push("github");
    // }
    // if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    //   providers.push("apple");
    // }

    res.json({
      status: "success",
      providers,
      message: "OAuth providers not configured yet",
    });
  } catch (error) {
    console.error("Error checking OAuth providers:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check OAuth provider availability",
    });
  }
});

// Check specific provider availability
router.get("/providers/:provider", (req, res) => {
  try {
    const { provider } = req.params;

    // For now, all providers are unavailable since OAuth is not implemented
    const available = false;

    // When implementing OAuth, check specific provider configuration:
    // let available = false;
    // switch (provider.toLowerCase()) {
    //   case "google":
    //     available = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    //     break;
    //   case "github":
    //     available = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
    //     break;
    //   case "apple":
    //     available = !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET);
    //     break;
    //   default:
    //     available = false;
    // }

    res.json({
      status: "success",
      provider,
      available,
      message: available ? "Provider is configured" : "Provider not configured",
    });
  } catch (error) {
    console.error(`Error checking ${req.params.provider} provider:`, error);
    res.status(500).json({
      status: "error",
      message: "Failed to check provider availability",
    });
  }
});

// Placeholder OAuth routes (to be implemented when OAuth is configured)
router.get("/google", (req, res) => {
  res.status(501).json({
    status: "error",
    message: "Google OAuth not implemented yet",
  });
});

router.get("/github", (req, res) => {
  res.status(501).json({
    status: "error",
    message: "GitHub OAuth not implemented yet",
  });
});

router.get("/apple", (req, res) => {
  res.status(501).json({
    status: "error",
    message: "Apple OAuth not implemented yet",
  });
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks

    if (user) {
      // Generate password reset token
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      // In a real implementation, you would:
      // 1. Save the reset token to the database with expiration
      // 2. Send an email with the reset link
      // 3. The reset link would be: /reset-password?token=resetToken

      console.log(`Password reset requested for: ${email}`);
      console.log(`Reset token (for testing): ${resetToken}`);

      // TODO: Send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, resetToken);
    }

    res.json({
      status: "success",
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process password reset request",
    });
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Token and new password are required",
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      // Optionally, increment a password version to invalidate old sessions
      passwordVersion: (user.passwordVersion || 0) + 1,
    });

    res.json({
      status: "success",
      message: "Password has been reset successfully",
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token",
      });
    }

    console.error("Reset password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Find user by email or username (including password for comparison)
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check password
    if (!user.password) {
      console.error("User found but password field is missing:", user.email);
      return res.status(500).json({
        status: "error",
        message: "User account configuration error",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? "30d" : "7d";
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiry,
    });

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      accountType = "personal",
      company,
      website,
      agreedToMarketing = false,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "All required fields must be provided",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User with this email or username already exists",
      });
    }

    // Create user (let the pre-save hook handle password hashing)
    const userData = {
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: password, // Don't hash here, let the model do it
      accountType,
      agreedToMarketing,
      profile: {
        bio: "",
        location: "",
        website: website || "",
        socialLinks: {},
      },
    };

    if (accountType === "business" && company) {
      userData.company = company;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed",
    });
  }
});

// Debug endpoint to check users (temporary)
router.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("email username firstName lastName")
      .limit(10);
    res.json({
      status: "success",
      count: users.length,
      users: users.map((u) => ({
        email: u.email,
        username: u.username,
        name: `${u.firstName} ${u.lastName}`.trim(),
      })),
    });
  } catch (error) {
    console.error("Debug users error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get users",
    });
  }
});

// Create test user for debugging
router.post("/debug/create-test-user", async (req, res) => {
  try {
    // Delete existing test user if exists
    await User.deleteOne({ email: "testuser@silentvoice.com" });

    const testUserData = {
      firstName: "Test",
      lastName: "User",
      username: "abcduser",
      email: "abcd@gmail.com",
      password: "test123456",
    };

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: testUserData.email.toLowerCase() },
        { username: testUserData.username.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.json({
        status: "info",
        message: "Test user already exists",
        credentials: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
    }

    // Create user (let the pre-save hook handle password hashing)
    const user = new User({
      firstName: testUserData.firstName,
      lastName: testUserData.lastName,
      username: testUserData.username.toLowerCase(),
      email: testUserData.email.toLowerCase(),
      password: testUserData.password, // Don't hash here, let the model do it
    });

    await user.save();

    res.json({
      status: "success",
      message: "Test user created successfully",
      credentials: {
        email: testUserData.email,
        password: testUserData.password,
      },
    });
  } catch (error) {
    console.error("Create test user error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create test user",
      error: error.message,
    });
  }
});

// Test password verification endpoint
router.post("/debug/test-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return res.json({
        status: "error",
        message: "User not found",
      });
    }

    // Test direct password comparison
    const isValid = await bcrypt.compare(password, user.password);

    // Also test if password was hashed correctly
    const testHash = await bcrypt.hash(password, 12);
    const testComparison = await bcrypt.compare(password, testHash);

    res.json({
      status: "success",
      email: user.email,
      passwordProvided: password,
      storedPasswordLength: user.password.length,
      storedPasswordPrefix: user.password.substring(0, 10),
      isValidComparison: isValid,
      testHashComparison: testComparison,
      bcryptWorking: testComparison,
    });
  } catch (error) {
    console.error("Test password error:", error);
    res.status(500).json({
      status: "error",
      message: "Password test failed",
      error: error.message,
    });
  }
});

// Get current user profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get user profile",
    });
  }
});

export default router;
