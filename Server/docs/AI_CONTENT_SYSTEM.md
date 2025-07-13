# AI Content Generation System

## Overview

The AI Content Generation system automatically scrapes trending topics from various sources and generates high-quality blog content for the Daily Drip section. It uses OpenAI's GPT models to create engaging, informative articles across multiple categories.

## Features

### 🤖 Automated Content Generation

- **Web Scraping**: Automatically scrapes RSS feeds and news sources
- **AI Writing**: Uses OpenAI GPT to generate original content
- **Quality Scoring**: Intelligent quality assessment for each generated article
- **Multi-Category Support**: Technology, Space, Ocean, Nature, Travel, and News

### 📅 Intelligent Scheduling

- **Daily Generation**: Automatically runs at 6:00 AM UTC daily
- **Auto Publishing**: Publishes high-quality content (75%+ score) hourly
- **Content Cleanup**: Weekly cleanup of old and failed content
- **Health Monitoring**: System health checks every 6 hours

### 🎯 Content Quality Control

- **Quality Scoring**: 0-100% quality assessment based on multiple factors
- **Human Review**: Admin review and editing capabilities
- **Source Verification**: Credibility scoring for content sources
- **Duplicate Prevention**: Prevents processing of already scraped content

### 📊 Management Dashboard

- **Content Overview**: View all generated content with filtering options
- **Analytics**: Performance metrics and category statistics
- **Manual Controls**: Trigger generation and publish content manually
- **Scheduler Status**: Monitor automated tasks and schedules

## Setup Instructions

### 1. Environment Configuration

Add the following variables to your `.env` file:

```env
# OpenAI API Configuration (Required)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000

# Content Generation Settings
AI_CONTENT_QUALITY_THRESHOLD=75
AI_CONTENT_DAILY_LIMIT=50
AI_CONTENT_AUTO_PUBLISH=true

# Optional: Additional API Keys for more content sources
NEWS_API_KEY=your-news-api-key
GUARDIAN_API_KEY=your-guardian-api-key
NYTIMES_API_KEY=your-nytimes-api-key
```

### 2. Database Models

The system automatically creates the following collections:

- `aicontents`: Stores scraped and generated content
- `blogs`: Published articles (existing collection)

### 3. Admin Access

Only users with `admin` role can access the AI Content Manager:

- Navigate to `/dashboard/ai-content`
- Available from Dashboard Quick Actions (for admins)
- Link in Daily Drip admin panel

## API Endpoints

### Content Management

- `GET /api/ai-content` - List AI content with filters
- `GET /api/ai-content/stats` - Get system statistics
- `POST /api/ai-content/generate` - Manually trigger content generation
- `POST /api/ai-content/publish` - Publish selected content
- `PUT /api/ai-content/:id` - Update/review content
- `DELETE /api/ai-content/:id` - Delete content

### Automation

- `POST /api/ai-content/trigger/daily` - Manually trigger daily generation
- `GET /api/ai-content/ready` - Get content ready for publishing

## Content Sources

### RSS Feeds

- **Technology**: TechCrunch, Wired, Ars Technica, O'Reilly Radar
- **Space**: NASA, Space.com, SpaceNews, SpaceX
- **Nature**: Nature.com, National Geographic, Smithsonian, Scientific American
- **Ocean**: NOAA, WHOI, MarineBio, Ocean Conservancy
- **Travel**: Lonely Planet, National Geographic Travel, Condé Nast Traveler
- **News**: BBC, Reuters, AP News, CNN

### API Sources (Optional)

- News API for additional headlines
- Guardian API for in-depth articles
- NY Times API for quality journalism

## Quality Scoring System

Content quality is scored from 0-100% based on:

### Content Quality (50 points)

- **Content Length** (20 points): 500+ words = 20pts, 300+ = 15pts, etc.
- **Title Quality** (15 points): 30-60 characters optimal
- **Excerpt Quality** (15 points): 100-200 characters optimal

### Metadata Quality (25 points)

- **Tags** (10 points): 3-7 relevant tags optimal
- **Keywords** (10 points): 5+ extracted keywords
- **Freshness** (15 points): Newer content scores higher

### Source Credibility (25 points)

- **Credible Sources** (15 points): nasa.gov, nature.com, bbc.com, etc.
- **Educational Domains** (.edu, .gov): 12 points
- **Non-profit Sources** (.org): 8 points
- **Other Sources**: 3 points

## Automation Schedule

### Daily Content Generation

- **When**: 6:00 AM UTC daily
- **What**: Scrapes 3 articles per category (18 total)
- **Process**: Scrape → Generate → Score → Queue for publishing

### Hourly Publishing

- **When**: Every hour
- **What**: Publishes content with 75%+ quality score
- **Limit**: Max 5 articles per batch to avoid spam

### Weekly Cleanup

- **When**: Sunday 3:00 AM UTC
- **What**:
  - Delete failed content older than 7 days
  - Delete rejected content older than 30 days
  - Archive old pending content

### Health Checks

- **When**: Every 6 hours
- **What**: Monitor system health and log issues

## Usage Examples

### Manual Content Generation

```javascript
// Generate content for specific categories
const response = await fetch("/api/ai-content/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    categories: ["technology", "space"],
    limit: 5,
  }),
});
```

### Publishing Content

```javascript
// Publish selected high-quality content
const response = await fetch("/api/ai-content/publish", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    contentIds: ["content-id-1", "content-id-2"],
  }),
});
```

## Monitoring and Maintenance

### System Health Indicators

- ✅ **Healthy**: Regular content generation, high quality scores
- ⚠️ **Warning**: High failure rates, low quality content
- ❌ **Critical**: No content generated, system errors

### Common Issues and Solutions

#### Low Quality Content

- Check source credibility
- Verify OpenAI API responses
- Adjust quality threshold in settings

#### Generation Failures

- Verify OpenAI API key and limits
- Check RSS feed availability
- Monitor server logs for errors

#### Publishing Issues

- Ensure admin user exists
- Check content status and quality scores
- Verify blog creation permissions

## Security Considerations

### API Key Protection

- Store OpenAI API key securely in environment variables
- Never commit API keys to version control
- Monitor API usage and costs

### Content Verification

- All generated content includes source attribution
- Quality scoring prevents low-quality content
- Human review system for content oversight

### Rate Limiting

- Built-in rate limiting for API calls
- Respect source website robots.txt
- Monitor scraping frequency to avoid blocking

## Troubleshooting

### Check System Status

```bash
# View scheduler status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/ai-content/stats
```

### Manual System Reset

```bash
# Restart content scheduler (requires server restart)
# Or trigger manual generation
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/ai-content/trigger/daily
```

### Database Cleanup

```javascript
// Clean up failed content older than 7 days
db.aicontents.deleteMany({
  status: "failed",
  createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
});
```

## Future Enhancements

### Planned Features

- **Image Generation**: AI-generated featured images
- **Social Media Integration**: Auto-posting to social platforms
- **User Personalization**: Content based on user interests
- **Multi-language Support**: Content in multiple languages
- **Advanced Analytics**: Detailed performance tracking

### Integration Opportunities

- **Email Newsletters**: Auto-generate newsletter content
- **SEO Optimization**: Enhanced metadata and keyword optimization
- **Content Series**: Generate related article series
- **Trending Topics**: Real-time trending topic detection

## Support

For questions or issues with the AI Content Generation system:

1. Check server logs for error messages
2. Verify environment configuration
3. Test API endpoints manually
4. Review content quality scores
5. Contact system administrator

## License

This AI Content Generation system is part of the SilentVoice platform and follows the same licensing terms.
