import { validationResult } from "express-validator";
import AIContent from "../models/AIContent.js";
import aiContentService from "../services/aiContentService.js";
import User from "../models/User.js";

/**
 * Get AI content statistics and overview
 */
export const getAIContentStats = async (req, res) => {
  try {
    const stats = await aiContentService.getContentStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting AI content stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI content statistics",
      error: error.message,
    });
  }
};

/**
 * Get AI-generated content with pagination and filters
 */
export const getAIContent = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      minQualityScore,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (minQualityScore)
      query.qualityScore = { $gte: parseInt(minQualityScore) };

    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;

    const skip = (page - 1) * limit;

    const content = await AIContent.find(query)
      .populate("publishedBlogId", "title slug views likes")
      .populate("reviewedBy", "firstName lastName username")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await AIContent.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        content,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error getting AI content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI content",
      error: error.message,
    });
  }
};

/**
 * Get specific AI content by ID
 */
export const getAIContentById = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await AIContent.findById(contentId)
      .populate("publishedBlogId")
      .populate("reviewedBy", "firstName lastName username");

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "AI content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error getting AI content by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI content",
      error: error.message,
    });
  }
};

/**
 * Manually trigger content generation for specific categories
 */
export const generateContent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { categories, limit = 5 } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Categories array is required",
      });
    }

    const results = {
      scraped: 0,
      generated: 0,
      errors: [],
    };

    for (const category of categories) {
      try {
        console.log(`Generating content for category: ${category}`);

        // Scrape content for this category
        const scrapedContent = await aiContentService.scrapeRSSFeeds(
          category,
          limit,
        );
        results.scraped += scrapedContent.length;

        if (scrapedContent.length > 0) {
          // Process and generate AI content
          const processedContent =
            await aiContentService.processScrapedContent(scrapedContent);
          results.generated += processedContent.length;
        }
      } catch (categoryError) {
        console.error(`Error processing category ${category}:`, categoryError);
        results.errors.push(`${category}: ${categoryError.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Content generation completed",
      data: results,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate content",
      error: error.message,
    });
  }
};

/**
 * Publish selected AI-generated content
 */
export const publishContent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { contentIds } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content IDs array is required",
      });
    }

    // Verify all content exists and is ready for publishing
    const contentToPublish = await AIContent.find({
      _id: { $in: contentIds },
      status: "generated",
    });

    if (contentToPublish.length !== contentIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some content is not ready for publishing or does not exist",
      });
    }

    // Publish content
    const publishedBlogs = await aiContentService.publishContent(
      contentIds,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: `Successfully published ${publishedBlogs.length} blog posts`,
      data: {
        publishedCount: publishedBlogs.length,
        publishedBlogs: publishedBlogs.map((blog) => ({
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
        })),
      },
    });
  } catch (error) {
    console.error("Error publishing content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish content",
      error: error.message,
    });
  }
};

/**
 * Schedule content for future publishing
 */
export const scheduleContent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { contentId } = req.params;
    const { publishDateTime } = req.body;

    const publishDate = new Date(publishDateTime);
    if (publishDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Publish date must be in the future",
      });
    }

    const scheduledContent = await aiContentService.scheduleContent(
      contentId,
      publishDate,
    );

    if (!scheduledContent) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Content scheduled successfully",
      data: scheduledContent,
    });
  } catch (error) {
    console.error("Error scheduling content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule content",
      error: error.message,
    });
  }
};

/**
 * Update AI content status or review
 */
export const updateContent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { contentId } = req.params;
    const {
      status,
      reviewNotes,
      generatedTitle,
      generatedContent,
      generatedExcerpt,
      generatedTags,
    } = req.body;

    const updateData = {};

    if (status) updateData.status = status;
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
      updateData.humanReviewed = true;
      updateData.reviewedBy = req.user._id;
    }

    // Allow editing of generated content
    if (generatedTitle) updateData.generatedTitle = generatedTitle;
    if (generatedContent) updateData.generatedContent = generatedContent;
    if (generatedExcerpt) updateData.generatedExcerpt = generatedExcerpt;
    if (generatedTags) updateData.generatedTags = generatedTags;

    const updatedContent = await AIContent.findByIdAndUpdate(
      contentId,
      updateData,
      { new: true },
    ).populate("reviewedBy", "firstName lastName username");

    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error.message,
    });
  }
};

/**
 * Delete AI content
 */
export const deleteContent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { contentId } = req.params;

    const deletedContent = await AIContent.findByIdAndDelete(contentId);

    if (!deletedContent) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message,
    });
  }
};

/**
 * Trigger daily content generation (manual trigger)
 */
export const triggerDailyGeneration = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    console.log(
      "Manual trigger for daily content generation initiated by:",
      req.user.username,
    );

    // Run the daily content generation
    const results = await aiContentService.generateDailyContent();

    res.status(200).json({
      success: true,
      message: "Daily content generation completed",
      data: results,
    });
  } catch (error) {
    console.error("Error triggering daily generation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger daily content generation",
      error: error.message,
    });
  }
};

/**
 * Get content ready for publishing
 */
export const getReadyContent = async (req, res) => {
  try {
    const readyContent = await AIContent.getReadyForPublishing();

    res.status(200).json({
      success: true,
      data: readyContent,
    });
  } catch (error) {
    console.error("Error getting ready content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get ready content",
      error: error.message,
    });
  }
};
