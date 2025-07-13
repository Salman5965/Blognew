import cron from "node-cron";
import AIContent from "../models/AIContent.js";
import aiContentService from "./aiContentService.js";
import User from "../models/User.js";

class ContentScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Initialize all scheduled jobs
   */
  init() {
    console.log("Initializing Content Scheduler...");

    // Daily content generation at 6:00 AM UTC
    this.scheduleDailyGeneration();

    // Publish scheduled content every hour
    this.scheduleContentPublishing();

    // Cleanup old content weekly at 3:00 AM Sunday UTC
    this.scheduleContentCleanup();

    // Health check and stats update every 6 hours
    this.scheduleHealthCheck();

    this.isRunning = true;
    console.log("Content Scheduler initialized successfully");
  }

  /**
   * Schedule daily content generation
   */
  scheduleDailyGeneration() {
    // Run daily at 6:00 AM UTC (customize based on your timezone)
    const job = cron.schedule(
      "0 6 * * *",
      async () => {
        console.log("Starting scheduled daily content generation...");

        try {
          const results = await aiContentService.generateDailyContent();

          console.log("Scheduled daily content generation completed:", results);

          // Log results for monitoring
          this.logGenerationResults(results);
        } catch (error) {
          console.error("Error in scheduled daily content generation:", error);
          this.logError("Daily Generation", error);
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      },
    );

    this.jobs.push({
      name: "Daily Content Generation",
      job: job,
      schedule: "0 6 * * *",
    });

    job.start();
    console.log("Daily content generation scheduled for 6:00 AM UTC");
  }

  /**
   * Schedule automatic publishing of ready content
   */
  scheduleContentPublishing() {
    // Check for ready content every hour
    const job = cron.schedule(
      "0 * * * *",
      async () => {
        console.log("Checking for content ready to publish...");

        try {
          // Get content scheduled for publishing
          const readyContent = await AIContent.getReadyForPublishing();

          if (readyContent.length === 0) {
            console.log("No content ready for publishing");
            return;
          }

          // Get admin user for publishing
          const adminUser = await User.findOne({ role: "admin" }).select("_id");
          if (!adminUser) {
            console.error("No admin user found for publishing content");
            return;
          }

          // Publish content in batches to avoid overwhelming the system
          const batchSize = 5;
          const batches = this.chunkArray(readyContent, batchSize);

          let totalPublished = 0;

          for (const batch of batches) {
            try {
              const contentIds = batch.map((content) => content._id);
              const publishedBlogs = await aiContentService.publishContent(
                contentIds,
                adminUser._id,
              );
              totalPublished += publishedBlogs.length;

              console.log(
                `Published batch of ${publishedBlogs.length} articles`,
              );

              // Small delay between batches
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (batchError) {
              console.error("Error publishing batch:", batchError);
            }
          }

          console.log(
            `Automatic publishing completed: ${totalPublished} articles published`,
          );
        } catch (error) {
          console.error("Error in scheduled content publishing:", error);
          this.logError("Content Publishing", error);
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      },
    );

    this.jobs.push({
      name: "Content Publishing",
      job: job,
      schedule: "0 * * * *",
    });

    job.start();
    console.log("Content publishing scheduled for every hour");
  }

  /**
   * Schedule cleanup of old and failed content
   */
  scheduleContentCleanup() {
    // Run weekly on Sunday at 3:00 AM UTC
    const job = cron.schedule(
      "0 3 * * 0",
      async () => {
        console.log("Starting scheduled content cleanup...");

        try {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          // Delete failed content older than 7 days
          const deletedFailed = await AIContent.deleteMany({
            status: "failed",
            createdAt: { $lt: sevenDaysAgo },
          });

          // Delete rejected content older than 30 days
          const deletedRejected = await AIContent.deleteMany({
            status: "rejected",
            createdAt: { $lt: thirtyDaysAgo },
          });

          // Archive old pending content (convert to failed)
          const archivedPending = await AIContent.updateMany(
            {
              status: "pending",
              createdAt: { $lt: sevenDaysAgo },
            },
            {
              status: "failed",
              error: "Archived due to age",
            },
          );

          console.log(`Content cleanup completed:
          - Deleted failed: ${deletedFailed.deletedCount}
          - Deleted rejected: ${deletedRejected.deletedCount}
          - Archived pending: ${archivedPending.modifiedCount}`);
        } catch (error) {
          console.error("Error in scheduled content cleanup:", error);
          this.logError("Content Cleanup", error);
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      },
    );

    this.jobs.push({
      name: "Content Cleanup",
      job: job,
      schedule: "0 3 * * 0",
    });

    job.start();
    console.log("Content cleanup scheduled for 3:00 AM UTC every Sunday");
  }

  /**
   * Schedule health checks and statistics updates
   */
  scheduleHealthCheck() {
    // Run every 6 hours
    const job = cron.schedule(
      "0 */6 * * *",
      async () => {
        console.log("Running scheduled health check...");

        try {
          const stats = await aiContentService.getContentStats();

          // Log important metrics
          console.log(`Health Check - Content Stats:
          - Total Content: ${stats.totalContent}
          - Published Content: ${stats.publishedContent}
          - Recent High-Quality: ${stats.recentContent.length}`);

          // Check for issues
          const issues = await this.checkForIssues(stats);
          if (issues.length > 0) {
            console.warn("Health Check Issues Detected:", issues);
          }
        } catch (error) {
          console.error("Error in scheduled health check:", error);
          this.logError("Health Check", error);
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      },
    );

    this.jobs.push({
      name: "Health Check",
      job: job,
      schedule: "0 */6 * * *",
    });

    job.start();
    console.log("Health checks scheduled for every 6 hours");
  }

  /**
   * Check for potential issues in the content system
   */
  async checkForIssues(stats) {
    const issues = [];

    try {
      // Check if content generation is failing
      const recentFailures = await AIContent.countDocuments({
        status: "failed",
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (recentFailures > 10) {
        issues.push(
          `High failure rate: ${recentFailures} failed content items in last 24 hours`,
        );
      }

      // Check if no content was generated recently
      const recentGenerated = await AIContent.countDocuments({
        status: "generated",
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (recentGenerated === 0) {
        issues.push("No new content generated in the last 24 hours");
      }

      // Check for low quality content
      const lowQualityContent = await AIContent.countDocuments({
        status: "generated",
        qualityScore: { $lt: 50 },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (lowQualityContent > recentGenerated * 0.5) {
        issues.push(
          `High percentage of low-quality content: ${lowQualityContent}/${recentGenerated}`,
        );
      }

      // Check for pending content that's been stuck
      const stuckPending = await AIContent.countDocuments({
        status: "pending",
        createdAt: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours old
      });

      if (stuckPending > 0) {
        issues.push(
          `${stuckPending} content items stuck in pending status for over 6 hours`,
        );
      }
    } catch (error) {
      issues.push(`Error checking system health: ${error.message}`);
    }

    return issues;
  }

  /**
   * Utility function to chunk array into smaller arrays
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Log generation results for monitoring
   */
  logGenerationResults(results) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Daily Generation Results:`, {
      scraped: results.scraped,
      generated: results.generated,
      published: results.published,
      errors: results.errors.length,
    });

    if (results.errors.length > 0) {
      console.warn("Generation Errors:", results.errors);
    }
  }

  /**
   * Log errors for monitoring
   */
  logError(operation, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${operation} Error:`, {
      message: error.message,
      stack: error.stack,
    });
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: this.jobs.map((job) => ({
        name: job.name,
        schedule: job.schedule,
        running: job.job.running,
      })),
    };
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log("Stopping Content Scheduler...");

    this.jobs.forEach((jobInfo) => {
      jobInfo.job.stop();
      console.log(`Stopped job: ${jobInfo.name}`);
    });

    this.isRunning = false;
    console.log("Content Scheduler stopped");
  }

  /**
   * Restart all scheduled jobs
   */
  restart() {
    console.log("Restarting Content Scheduler...");
    this.stop();
    this.jobs = [];
    this.init();
  }

  /**
   * Manually trigger content generation (for testing)
   */
  async triggerManualGeneration() {
    console.log("Manual content generation triggered...");
    try {
      const results = await aiContentService.generateDailyContent();
      console.log("Manual generation completed:", results);
      return results;
    } catch (error) {
      console.error("Manual generation failed:", error);
      throw error;
    }
  }
}

export default new ContentScheduler();
