import OpenAI from "openai";
import axios from "axios";
import * as cheerio from "cheerio";
import Parser from "rss-parser";
import AIContent from "../models/AIContent.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";

class AIContentService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.rssParser = new Parser();

    // News sources configuration
    this.newsSources = {
      technology: [
        "https://feeds.feedburner.com/oreilly/radar",
        "https://techcrunch.com/feed/",
        "https://www.wired.com/feed/",
        "https://feeds.arstechnica.com/arstechnica/index",
      ],
      space: [
        "https://www.nasa.gov/rss/dyn/breaking_news.rss",
        "https://www.space.com/feeds/news",
        "https://spacenews.com/feed/",
        "https://www.spacex.com/updates/index.xml",
      ],
      nature: [
        "https://www.nature.com/nature.rss",
        "https://www.nationalgeographic.com/news/rss/",
        "https://www.smithsonianmag.com/rss/latest_articles/",
        "https://www.scientificamerican.com/rss/xml/news.xml",
      ],
      ocean: [
        "https://www.noaa.gov/rss/news.xml",
        "https://www.whoi.edu/rss/news/",
        "https://marinebio.org/feed/",
        "https://oceanconservancy.org/feed/",
      ],
      travel: [
        "https://www.lonelyplanet.com/rss/news.xml",
        "https://www.nationalgeographic.com/travel/rss/",
        "https://www.cntraveler.com/rss",
        "https://feeds.feedburner.com/TravelAndLeisure-News",
      ],
      news: [
        "https://feeds.bbci.co.uk/news/rss.xml",
        "https://feeds.reuters.com/reuters/topNews",
        "https://feeds.feedburner.com/ap-topnews",
        "https://rss.cnn.com/rss/edition.rss",
      ],
    };

    // API endpoints for additional content sources
    this.apiSources = {
      newsApi: "https://newsapi.org/v2/top-headlines",
      guardian: "https://content.guardianapis.com/search",
      nytimes: "https://api.nytimes.com/svc/topstories/v2",
    };
  }

  /**
   * Scrape content from RSS feeds for a specific category
   */
  async scrapeRSSFeeds(category, limit = 10) {
    const feeds = this.newsSources[category] || [];
    const scrapedContent = [];

    for (const feedUrl of feeds) {
      try {
        console.log(`Scraping RSS feed: ${feedUrl}`);
        const feed = await this.rssParser.parseURL(feedUrl);

        const items = feed.items.slice(0, Math.ceil(limit / feeds.length));

        for (const item of items) {
          // Check if content already exists
          const existing = await AIContent.findOne({
            sourceUrl: item.link,
          });

          if (!existing) {
            const content = await this.extractContentFromUrl(item.link);

            if (content) {
              scrapedContent.push({
                sourceUrl: item.link,
                sourceType: "rss",
                originalTitle: item.title || "Untitled",
                originalContent:
                  content.text || item.contentSnippet || item.content || "",
                category: category,
                keywords: content.keywords || [],
                metadata: {
                  sourcePublishDate: item.pubDate
                    ? new Date(item.pubDate)
                    : new Date(),
                  authorName: item.creator || item.author || "Unknown",
                  sourceWebsite: new URL(item.link).hostname,
                  wordCount: content.text
                    ? content.text.split(/\s+/).length
                    : 0,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error scraping RSS feed ${feedUrl}:`, error.message);
      }
    }

    return scrapedContent;
  }

  /**
   * Extract content from a URL using web scraping
   */
  async extractContentFromUrl(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SilentVoice-Bot/1.0)",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $("script, style, nav, footer, aside, .advertisement, .ad").remove();

      // Try to find main content
      let content = "";
      const contentSelectors = [
        "article",
        "[role='main']",
        ".content",
        ".post-content",
        ".entry-content",
        ".article-content",
        "main",
        ".story-body",
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }

      // Fallback to body content
      if (!content) {
        content = $("body").text().trim();
      }

      // Extract keywords from meta tags
      const keywords = [];
      $('meta[name="keywords"]').each((i, elem) => {
        const keywordContent = $(elem).attr("content");
        if (keywordContent) {
          keywords.push(...keywordContent.split(",").map((k) => k.trim()));
        }
      });

      // Extract keywords from title and headings
      const title = $("title").text() || "";
      $("h1, h2, h3").each((i, elem) => {
        const heading = $(elem).text().trim();
        if (heading) {
          keywords.push(heading);
        }
      });

      return {
        text: content.substring(0, 3000), // Limit content length
        keywords: [...new Set(keywords)].slice(0, 10), // Remove duplicates and limit
        title: title,
      };
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Generate AI content using OpenAI
   */
  async generateContent(originalContent, category, title, keywords = []) {
    try {
      const keywordText =
        keywords.length > 0 ? `Keywords: ${keywords.join(", ")}` : "";

      const prompt = `
Create an engaging, informative blog post for "Daily Drip" based on this ${category} content.

Original Title: ${title}
Original Content: ${originalContent}
${keywordText}

Requirements:
1. Write a compelling, unique title (30-60 characters)
2. Create original content (400-800 words) that:
   - Explains the topic in an accessible way
   - Adds valuable insights and context
   - Uses an engaging, conversational tone
   - Includes relevant examples or analogies
   - Concludes with thought-provoking questions or takeaways
3. Write a compelling excerpt (100-200 characters)
4. Suggest 3-5 relevant tags

Format your response as JSON:
{
  "title": "Generated title here",
  "content": "Generated content here",
  "excerpt": "Generated excerpt here",
  "tags": ["tag1", "tag2", "tag3"]
}

Focus on making the content educational, inspiring, and perfect for daily reading.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert content writer who creates engaging, informative blog posts for a daily inspiration platform. Write in a clear, accessible style that educates and inspires readers.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;

      try {
        const generatedContent = JSON.parse(responseText);
        return {
          title: generatedContent.title || title,
          content: generatedContent.content || "",
          excerpt: generatedContent.excerpt || "",
          tags: generatedContent.tags || [],
        };
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Fallback: extract content manually
        return this.extractContentFromResponse(responseText, title);
      }
    } catch (error) {
      console.error("Error generating AI content:", error.message);
      throw new Error(`AI content generation failed: ${error.message}`);
    }
  }

  /**
   * Fallback method to extract content from non-JSON AI response
   */
  extractContentFromResponse(responseText, fallbackTitle) {
    const lines = responseText.split("\n").filter((line) => line.trim());

    let title = fallbackTitle;
    let content = "";
    let excerpt = "";
    let tags = [];

    // Try to extract structured content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toLowerCase().includes("title:")) {
        title = line
          .replace(/title:/i, "")
          .trim()
          .replace(/"/g, "");
      } else if (line.toLowerCase().includes("content:")) {
        // Collect content lines
        for (let j = i + 1; j < lines.length; j++) {
          if (
            lines[j].toLowerCase().includes("excerpt:") ||
            lines[j].toLowerCase().includes("tags:")
          ) {
            break;
          }
          content += lines[j] + "\n";
        }
      } else if (line.toLowerCase().includes("excerpt:")) {
        excerpt = line
          .replace(/excerpt:/i, "")
          .trim()
          .replace(/"/g, "");
      } else if (line.toLowerCase().includes("tags:")) {
        const tagLine = line.replace(/tags:/i, "").trim();
        tags = tagLine.split(",").map((tag) => tag.trim().replace(/"/g, ""));
      }
    }

    // If structured extraction failed, use the whole response as content
    if (!content) {
      content = responseText;
    }

    return {
      title: title || fallbackTitle,
      content: content.trim(),
      excerpt: excerpt || content.substring(0, 150) + "...",
      tags: tags.length > 0 ? tags : ["daily-drip", "news"],
    };
  }

  /**
   * Process scraped content and generate AI content
   */
  async processScrapedContent(scrapedItems) {
    const processedContent = [];

    for (const item of scrapedItems) {
      try {
        console.log(`Processing: ${item.originalTitle}`);

        // Save to database first
        const aiContent = new AIContent(item);
        await aiContent.save();

        // Generate AI content
        const generated = await this.generateContent(
          item.originalContent,
          item.category,
          item.originalTitle,
          item.keywords,
        );

        // Update with generated content
        aiContent.generatedTitle = generated.title;
        aiContent.generatedContent = generated.content;
        aiContent.generatedExcerpt = generated.excerpt;
        aiContent.generatedTags = generated.tags;
        aiContent.status = "generated";

        // Calculate read time
        const wordCount = generated.content.split(/\s+/).length;
        aiContent.metadata.readTime = Math.ceil(wordCount / 200) || 1;

        await aiContent.save();

        processedContent.push(aiContent);

        // Add small delay to respect API limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing content: ${item.originalTitle}`, error);

        // Update status to failed if it was saved
        try {
          await AIContent.findOneAndUpdate(
            { sourceUrl: item.sourceUrl },
            {
              status: "failed",
              error: error.message,
            },
          );
        } catch (updateError) {
          console.error("Error updating failed status:", updateError);
        }
      }
    }

    return processedContent;
  }

  /**
   * Publish AI-generated content as blog posts
   */
  async publishContent(aiContentIds, adminUserId) {
    const publishedBlogs = [];

    for (const contentId of aiContentIds) {
      try {
        const aiContent = await AIContent.findById(contentId);

        if (!aiContent || aiContent.status !== "generated") {
          console.log(
            `Skipping content ${contentId}: not ready for publishing`,
          );
          continue;
        }

        // Create blog post
        const blogData = {
          title: aiContent.generatedTitle,
          content: aiContent.generatedContent,
          excerpt: aiContent.generatedExcerpt,
          author: adminUserId,
          tags: [...aiContent.generatedTags, "daily-drip", "ai-generated"],
          category: "daily-drip",
          status: "published",
          readTime: aiContent.metadata?.readTime || 1,
          isDailyDrip: true,
        };

        const blog = new Blog(blogData);
        await blog.save();

        // Update AI content status
        aiContent.status = "published";
        aiContent.publishedBlogId = blog._id;
        aiContent.publishedAt = new Date();
        await aiContent.save();

        publishedBlogs.push(blog);

        console.log(`Published blog: ${blog.title}`);
      } catch (error) {
        console.error(`Error publishing content ${contentId}:`, error);

        // Update status to failed
        await AIContent.findByIdAndUpdate(contentId, {
          status: "failed",
          error: error.message,
        });
      }
    }

    return publishedBlogs;
  }

  /**
   * Schedule content for future publishing
   */
  async scheduleContent(aiContentId, publishDateTime) {
    try {
      const aiContent = await AIContent.findByIdAndUpdate(
        aiContentId,
        {
          scheduledPublishAt: publishDateTime,
        },
        { new: true },
      );

      return aiContent;
    } catch (error) {
      console.error("Error scheduling content:", error);
      throw error;
    }
  }

  /**
   * Get content analytics and stats
   */
  async getContentStats() {
    try {
      const stats = await AIContent.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const categoryStats = await AIContent.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgQualityScore: { $avg: "$qualityScore" },
          },
        },
      ]);

      const recentContent = await AIContent.find({
        status: "generated",
        qualityScore: { $gte: 70 },
      })
        .sort({ qualityScore: -1, createdAt: -1 })
        .limit(10);

      return {
        statusStats: stats,
        categoryStats: categoryStats,
        recentContent: recentContent,
        totalContent: await AIContent.countDocuments(),
        publishedContent: await AIContent.countDocuments({
          status: "published",
        }),
      };
    } catch (error) {
      console.error("Error getting content stats:", error);
      throw error;
    }
  }

  /**
   * Main method to scrape and generate content for all categories
   */
  async generateDailyContent() {
    console.log("Starting daily content generation...");

    const results = {
      scraped: 0,
      generated: 0,
      published: 0,
      errors: [],
    };

    try {
      // Get admin user for publishing
      const adminUser = await User.findOne({ role: "admin" }).select("_id");
      if (!adminUser) {
        throw new Error("No admin user found for publishing content");
      }

      const categories = [
        "technology",
        "space",
        "nature",
        "ocean",
        "travel",
        "news",
      ];

      for (const category of categories) {
        try {
          console.log(`Processing category: ${category}`);

          // Scrape content for this category
          const scrapedContent = await this.scrapeRSSFeeds(category, 3);
          results.scraped += scrapedContent.length;

          if (scrapedContent.length > 0) {
            // Process and generate AI content
            const processedContent =
              await this.processScrapedContent(scrapedContent);
            results.generated += processedContent.length;

            // Publish high-quality content
            const highQualityContent = processedContent
              .filter((content) => content.qualityScore >= 75)
              .slice(0, 1); // Limit to 1 post per category per day

            if (highQualityContent.length > 0) {
              const published = await this.publishContent(
                highQualityContent.map((c) => c._id),
                adminUser._id,
              );
              results.published += published.length;
            }
          }

          // Add delay between categories
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (categoryError) {
          console.error(
            `Error processing category ${category}:`,
            categoryError,
          );
          results.errors.push(`${category}: ${categoryError.message}`);
        }
      }

      console.log("Daily content generation completed:", results);
      return results;
    } catch (error) {
      console.error("Error in daily content generation:", error);
      results.errors.push(error.message);
      return results;
    }
  }
}

export default new AIContentService();
