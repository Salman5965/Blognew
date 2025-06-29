import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";

// Validation rules for creating a story
export const validateCreateStory = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .escape(),

  body("content")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long")
    .custom((value) => {
      // Remove HTML tags to check actual content length
      const textContent = value.replace(/<[^>]*>/g, "").trim();
      if (textContent.length < 10) {
        throw new Error(
          "Content must contain at least 10 characters of actual text",
        );
      }
      return true;
    }),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Category can only contain letters, numbers, spaces, and hyphens",
    )
    .toLowerCase(),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error("Cannot have more than 10 tags");
      }

      for (const tag of tags) {
        if (typeof tag !== "string" || tag.trim().length === 0) {
          throw new Error("Each tag must be a non-empty string");
        }
        if (tag.length > 30) {
          throw new Error("Each tag cannot exceed 30 characters");
        }
        if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
          throw new Error(
            "Tags can only contain letters, numbers, spaces, and hyphens",
          );
        }
      }

      // Check for duplicate tags
      const uniqueTags = [
        ...new Set(tags.map((tag) => tag.toLowerCase().trim())),
      ];
      if (uniqueTags.length !== tags.length) {
        throw new Error("Duplicate tags are not allowed");
      }

      return true;
    })
    .customSanitizer((tags) => {
      if (Array.isArray(tags)) {
        return tags.map((tag) => tag.trim().toLowerCase());
      }
      return tags;
    }),

  body("coverImage")
    .optional()
    .isURL()
    .withMessage("Cover image must be a valid URL"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  body("visibility")
    .optional()
    .isIn(["public", "private", "unlisted"])
    .withMessage("Visibility must be public, private, or unlisted"),

  body("allowComments")
    .optional()
    .isBoolean()
    .withMessage("Allow comments must be a boolean"),
];

// Validation rules for updating a story
export const validateUpdateStory = [
  param("id").isMongoId().withMessage("Invalid story ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters")
    .escape(),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long")
    .custom((value) => {
      const textContent = value.replace(/<[^>]*>/g, "").trim();
      if (textContent.length < 10) {
        throw new Error(
          "Content must contain at least 10 characters of actual text",
        );
      }
      return true;
    }),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Category can only contain letters, numbers, spaces, and hyphens",
    )
    .toLowerCase(),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error("Cannot have more than 10 tags");
      }

      for (const tag of tags) {
        if (typeof tag !== "string" || tag.trim().length === 0) {
          throw new Error("Each tag must be a non-empty string");
        }
        if (tag.length > 30) {
          throw new Error("Each tag cannot exceed 30 characters");
        }
        if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
          throw new Error(
            "Tags can only contain letters, numbers, spaces, and hyphens",
          );
        }
      }

      const uniqueTags = [
        ...new Set(tags.map((tag) => tag.toLowerCase().trim())),
      ];
      if (uniqueTags.length !== tags.length) {
        throw new Error("Duplicate tags are not allowed");
      }

      return true;
    })
    .customSanitizer((tags) => {
      if (Array.isArray(tags)) {
        return tags.map((tag) => tag.trim().toLowerCase());
      }
      return tags;
    }),

  body("coverImage")
    .optional()
    .isURL()
    .withMessage("Cover image must be a valid URL"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  body("visibility")
    .optional()
    .isIn(["public", "private", "unlisted"])
    .withMessage("Visibility must be public, private, or unlisted"),

  body("allowComments")
    .optional()
    .isBoolean()
    .withMessage("Allow comments must be a boolean"),
];

// Validation for story query parameters
export const validateStoryQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Category can only contain letters, numbers, spaces, and hyphens",
    ),

  query("tag")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Tag must be between 1 and 30 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage("Tag can only contain letters, numbers, spaces, and hyphens"),

  query("author")
    .optional()
    .isMongoId()
    .withMessage("Author must be a valid user ID"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters")
    .escape(),

  query("sort")
    .optional()
    .isIn(["newest", "oldest", "popular", "title"])
    .withMessage("Sort must be one of: newest, oldest, popular, title"),

  query("status")
    .optional()
    .isIn(["published", "draft"])
    .withMessage("Status must be either published or draft"),
];

// Validation for story ID parameter
export const validateStoryId = [
  param("id").isMongoId().withMessage("Invalid story ID format"),
];

// Custom middleware to handle validation errors
export const handleStoryValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Story validation failed",
      errors: errors.array(),
    });
  }
  next();
};
