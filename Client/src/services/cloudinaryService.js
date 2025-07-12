// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "profile_images";

class CloudinaryService {
  constructor() {
    this.baseUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;
  }

  /**
   * Upload image to Cloudinary
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} Upload response with secure_url
   */
  async uploadImage(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Additional options
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      if (options.transformation) {
        formData.append(
          "transformation",
          JSON.stringify(options.transformation),
        );
      }

      // Default transformations for profile images
      if (!options.transformation) {
        formData.append(
          "transformation",
          JSON.stringify([
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", format: "auto" },
          ]),
        );
      }

      const response = await fetch(`${this.baseUrl}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload profile image with optimizations
   * @param {File} file - The profile image file
   * @param {string} userId - User ID for folder organization
   * @returns {Promise} Upload response
   */
  async uploadProfileImage(file, userId) {
    return this.uploadImage(file, {
      folder: `users/${userId}/profile`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto:good", format: "auto" },
      ],
    });
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - The public ID of the image to delete
   * @returns {Promise} Deletion response
   */
  async deleteImage(publicId) {
    try {
      // Note: Deletion requires server-side implementation with API secret
      // This is a placeholder for the frontend
      console.warn("Image deletion should be handled server-side for security");
      return { success: true };
    } catch (error) {
      console.error("Cloudinary deletion error:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Generate optimized image URL
   * @param {string} publicId - The public ID of the image
   * @param {Object} transformations - Transformation options
   * @returns {string} Optimized image URL
   */
  generateImageUrl(publicId, transformations = {}) {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    let transformString = "";
    if (Object.keys(transformations).length > 0) {
      const transforms = [];

      if (transformations.width) transforms.push(`w_${transformations.width}`);
      if (transformations.height)
        transforms.push(`h_${transformations.height}`);
      if (transformations.crop) transforms.push(`c_${transformations.crop}`);
      if (transformations.quality)
        transforms.push(`q_${transformations.quality}`);
      if (transformations.format)
        transforms.push(`f_${transformations.format}`);

      transformString = transforms.join(",") + "/";
    }

    return `${baseUrl}/${transformString}${publicId}`;
  }

  /**
   * Validate image file
   * @param {File} file - The file to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateImageFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
      minWidth = 100,
      minHeight = 100,
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      );
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
    }

    // For image dimension validation, we'd need to create an image object
    // This is simplified validation
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
