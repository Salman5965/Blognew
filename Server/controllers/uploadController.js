import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads", file.fieldname);

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

// File filter for different types
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        ),
        false,
      );
    }
  };
};

// Image upload configuration
const imageFilter = createFileFilter([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Document upload configuration
const documentFilter = createFileFilter([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const documentUpload = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Avatar upload
export const uploadAvatar = (req, res, next) => {
  imageUpload.single("avatar")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Avatar upload failed",
      });
    }
    next();
  });
};

// Cover image upload
export const uploadCoverImage = (req, res, next) => {
  imageUpload.single("coverImage")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Cover image upload failed",
      });
    }
    next();
  });
};

// Blog cover image upload
export const uploadBlogCover = (req, res, next) => {
  imageUpload.single("blogCover")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Blog cover upload failed",
      });
    }
    next();
  });
};

// Multiple images upload
export const uploadMultipleImages = (req, res, next) => {
  imageUpload.array("images", 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Images upload failed",
      });
    }
    next();
  });
};

// Document upload
export const uploadDocument = (req, res, next) => {
  documentUpload.single("document")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Document upload failed",
      });
    }
    next();
  });
};

// Handle avatar upload response
export const handleAvatarUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/avatar/${req.file.filename}`;

    // Update user avatar in database
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { avatar: fileUrl });

    res.status(200).json({
      status: "success",
      message: "Avatar uploaded successfully",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Handle avatar upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process avatar upload",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Handle cover image upload response
export const handleCoverImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/coverImage/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      message: "Cover image uploaded successfully",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Handle cover image upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process cover image upload",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Handle blog cover upload response
export const handleBlogCoverUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/blogCover/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      message: "Blog cover uploaded successfully",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Handle blog cover upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process blog cover upload",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Handle multiple images upload response
export const handleMultipleImagesUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded",
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    res.status(200).json({
      status: "success",
      message: "Images uploaded successfully",
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
    });
  } catch (error) {
    console.error("Handle multiple images upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process images upload",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete uploaded file
export const deleteUploadedFile = async (req, res) => {
  try {
    const { filename, type } = req.params;

    // Validate file type
    const allowedTypes = [
      "avatar",
      "coverImage",
      "blogCover",
      "images",
      "documents",
    ];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid file type",
      });
    }

    const filePath = path.join(__dirname, "../uploads", type, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);

      res.status(200).json({
        status: "success",
        message: "File deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete file",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get file info
export const getFileInfo = async (req, res) => {
  try {
    const { filename, type } = req.params;

    const filePath = path.join(__dirname, "../uploads", type, filename);

    try {
      const stats = await fs.stat(filePath);

      res.status(200).json({
        status: "success",
        data: {
          filename,
          type,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${type}/${filename}`,
        },
      });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("Get file info error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get file info",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Clean up old files (utility function)
export const cleanupOldFiles = async (daysOld = 30) => {
  try {
    const uploadsDir = path.join(__dirname, "../uploads");
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const processDirectory = async (dirPath) => {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          await processDirectory(itemPath);
        } else {
          const stats = await fs.stat(itemPath);
          if (stats.mtime < cutoffDate) {
            await fs.unlink(itemPath);
            console.log(`Deleted old file: ${itemPath}`);
          }
        }
      }
    };

    await processDirectory(uploadsDir);
    console.log(`Cleanup completed for files older than ${daysOld} days`);
  } catch (error) {
    console.error("File cleanup error:", error);
  }
};
