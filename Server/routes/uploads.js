import express from "express";
import { param } from "express-validator";
import {
  uploadAvatar,
  uploadCoverImage,
  uploadBlogCover,
  uploadMultipleImages,
  uploadDocument,
  handleAvatarUpload,
  handleCoverImageUpload,
  handleBlogCoverUpload,
  handleMultipleImagesUpload,
  deleteUploadedFile,
  getFileInfo,
} from "../controllers/uploadController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Validation middleware
const validateFileParams = [
  param("type")
    .isIn(["avatar", "coverImage", "blogCover", "images", "documents"])
    .withMessage("Invalid file type"),
  param("filename")
    .matches(/^[\w\-. ]+$/)
    .withMessage("Invalid filename"),
];

// Apply authentication to all routes
router.use(protect);

// Avatar upload
router.post(
  "/avatar",
  rateLimiter("upload", 10, 60), // 10 uploads per minute
  uploadAvatar,
  handleAvatarUpload,
);

// Cover image upload
router.post(
  "/cover-image",
  rateLimiter("upload", 10, 60),
  uploadCoverImage,
  handleCoverImageUpload,
);

// Blog cover upload
router.post(
  "/blog-cover",
  rateLimiter("upload", 20, 60), // 20 blog covers per minute
  uploadBlogCover,
  handleBlogCoverUpload,
);

// Multiple images upload
router.post(
  "/images",
  rateLimiter("upload", 5, 60), // 5 multiple uploads per minute
  uploadMultipleImages,
  handleMultipleImagesUpload,
);

// Document upload
router.post(
  "/document",
  rateLimiter("upload", 10, 60),
  uploadDocument,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      const fileUrl = `/uploads/document/${req.file.filename}`;

      res.status(200).json({
        status: "success",
        message: "Document uploaded successfully",
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("Handle document upload error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to process document upload",
      });
    }
  },
);

// Get file info
router.get("/info/:type/:filename", validateFileParams, getFileInfo);

// Delete uploaded file
router.delete("/:type/:filename", validateFileParams, deleteUploadedFile);

export default router;
