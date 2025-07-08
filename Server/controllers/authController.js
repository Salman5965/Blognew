import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { validationResult } from "express-validator";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      username,
      email,
      password,
      firstName = "",
      lastName = "",
      bio = "",
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      bio,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: user.getSafeUserData(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findByEmailOrUsername(email).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: user.getSafeUserData(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    // Use lean query and select only needed fields for better performance
    const user = await User.findById(req.user.id)
      .select(
        "username email firstName lastName bio avatar socialLinks isEmailVerified role isActive createdAt",
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const allowedUpdates = [
      "firstName",
      "lastName",
      "bio",
      "avatar",
      "socialLinks",
      "preferences",
      "profileVisibility",
      "privacySettings",
      "notificationSettings",
    ];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: user.getSafeUserData(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Password is incorrect",
      });
    }

    // Deactivate account instead of deleting
    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logout successful. Please remove the token from client storage.",
  });
};
