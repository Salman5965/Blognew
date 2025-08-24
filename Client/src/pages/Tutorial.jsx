
import React, { useState } from 'react';
import { 
  BookOpen, 
  Video, 
  Mic, 
  Edit3, 
  Upload, 
  Eye, 
  Share2, 
  Settings,
  CheckCircle,
  ArrowRight,
  Play,
  FileText,
  Image,
  Tag,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Camera,
  Headphones,
  PenTool,
  Sparkles,
  Target,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TutorialPage = () => {
  const [activeStep, setActiveStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const toggleStep = (stepId) => {
    setActiveStep(activeStep === stepId ? null : stepId);
  };

  const markComplete = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const blogSteps = [
    {
      id: 'blog-1',
      title: 'Getting Started with Your First Blog Post',
      icon: <Edit3 className="w-5 h-5" />,
      duration: '5 minutes',
      difficulty: 'Beginner',
      steps: [
        { icon: <ArrowRight className="w-4 h-4" />, text: 'Navigate to your dashboard and click the "Write" button' },
        { icon: <PenTool className="w-4 h-4" />, text: 'Choose "Blog Post" from the content type selector' },
        { icon: <FileText className="w-4 h-4" />, text: 'Add a compelling title that grabs attention (60 characters max for SEO)' },
        { icon: <Tag className="w-4 h-4" />, text: 'Select your primary category (Technology, Lifestyle, Business, etc.)' }
      ]
    },
    {
      id: 'blog-2',
      title: 'Writing & Formatting Your Content',
      icon: <BookOpen className="w-5 h-5" />,
      duration: '15 minutes',
      difficulty: 'Beginner',
      steps: [
        { icon: <Edit3 className="w-4 h-4" />, text: 'Use the rich text editor - supports Markdown and WYSIWYG modes' },
        { icon: <FileText className="w-4 h-4" />, text: 'Structure with headers: H1 for title, H2 for main sections, H3 for subsections' },
        { icon: <Image className="w-4 h-4" />, text: 'Add images: drag & drop or click insert (max 10MB, 1200x630px recommended)' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'Use formatting: bold, italic, quotes, bullet points, and code blocks' },
        { icon: <Eye className="w-4 h-4" />, text: 'Preview your post to check formatting and readability' }
      ]
    },
    {
      id: 'blog-3',
      title: 'SEO Optimization & Tags',
      icon: <TrendingUp className="w-5 h-5" />,
      duration: '10 minutes',
      difficulty: 'Intermediate',
      steps: [
        { icon: <Tag className="w-4 h-4" />, text: 'Add 3-5 relevant tags (research trending tags in your niche)' },
        { icon: <FileText className="w-4 h-4" />, text: 'Write a compelling meta description (150-160 characters)' },
        { icon: <Globe className="w-4 h-4" />, text: 'Optimize your URL slug (keep it short and descriptive)' },
        { icon: <Image className="w-4 h-4" />, text: 'Add alt text to all images for accessibility and SEO' },
        { icon: <Target className="w-4 h-4" />, text: 'Include focus keywords naturally throughout your content' }
      ]
    },
    {
      id: 'blog-4',
      title: 'Publishing & Promotion',
      icon: <Share2 className="w-5 h-5" />,
      duration: '8 minutes',
      difficulty: 'Beginner',
      steps: [
        { icon: <Calendar className="w-4 h-4" />, text: 'Choose publish now or schedule for optimal timing' },
        { icon: <Share2 className="w-4 h-4" />, text: 'Share on social media using built-in sharing tools' },
        { icon: <Users className="w-4 h-4" />, text: 'Engage with early commenters to boost initial engagement' },
        { icon: <BarChart3 className="w-4 h-4" />, text: 'Monitor analytics: views, engagement, and reader retention' },
        { icon: <MessageSquare className="w-4 h-4" />, text: 'Respond to comments and build community around your content' }
      ]
    }
  ];

  const storySteps = [
    {
      id: 'story-1',
      title: 'Choosing Your Story Format',
      icon: <Video className="w-5 h-5" />,
      duration: '3 minutes',
      difficulty: 'Beginner',
      steps: [
        { icon: <Camera className="w-4 h-4" />, text: 'Video Stories: Perfect for visual experiences, tutorials, vlogs (MP4, MOV, AVI - max 500MB)' },
        { icon: <Headphones className="w-4 h-4" />, text: 'Audio Stories: Great for podcasts, voice narratives, music (MP3, WAV, M4A - max 100MB)' },
        { icon: <FileText className="w-4 h-4" />, text: 'Written Stories: Traditional storytelling, life lessons, fiction (unlimited length)' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'Mixed Media: Combine text, images, audio, and video for rich experiences' }
      ]
    },
    {
      id: 'story-2',
      title: 'Creating Video Stories',
      icon: <Camera className="w-5 h-5" />,
      duration: '20 minutes',
      difficulty: 'Intermediate',
      steps: [
        { icon: <Upload className="w-4 h-4" />, text: 'Click "Share Your Story" and select "Video Story"' },
        { icon: <Video className="w-4 h-4" />, text: 'Upload your video file (recommended: 1080p, 30fps, under 500MB)' },
        { icon: <Image className="w-4 h-4" />, text: 'Create an eye-catching thumbnail (1280x720px, JPG/PNG)' },
        { icon: <FileText className="w-4 h-4" />, text: 'Add engaging title and detailed description with timestamps' },
        { icon: <Tag className="w-4 h-4" />, text: 'Tag appropriately: #LifeLessons #Tutorial #Entertainment #Vlog' },
        { icon: <Settings className="w-4 h-4" />, text: 'Add captions/subtitles for accessibility (SRT file supported)' },
        { icon: <Eye className="w-4 h-4" />, text: 'Preview your story and test video playback' }
      ]
    },
    {
      id: 'story-3',
      title: 'Creating Audio Stories',
      icon: <Headphones className="w-5 h-5" />,
      duration: '15 minutes',
      difficulty: 'Beginner',
      steps: [
        { icon: <Mic className="w-4 h-4" />, text: 'Record or prepare your audio file (clear audio, minimal background noise)' },
        { icon: <Upload className="w-4 h-4" />, text: 'Upload audio file (MP3, WAV, M4A supported, max 100MB)' },
        { icon: <Image className="w-4 h-4" />, text: 'Design a cover image that represents your story theme' },
        { icon: <FileText className="w-4 h-4" />, text: 'Write a compelling description with episode notes or timestamps' },
        { icon: <Tag className="w-4 h-4" />, text: 'Use relevant tags: #Podcast #Story #Motivation #Education' },
        { icon: <Settings className="w-4 h-4" />, text: 'Add chapter markers for longer audio content (optional)' }
      ]
    },
    {
      id: 'story-4',
      title: 'Writing Engaging Stories',
      icon: <PenTool className="w-5 h-5" />,
      duration: '25 minutes',
      difficulty: 'Intermediate',
      steps: [
        { icon: <Lightbulb className="w-4 h-4" />, text: 'Start with a hook - compelling opening that draws readers in' },
        { icon: <FileText className="w-4 h-4" />, text: 'Structure: Beginning (setup), Middle (conflict/lesson), End (resolution)' },
        { icon: <Heart className="w-4 h-4" />, text: 'Make it personal - share emotions, struggles, and genuine insights' },
        { icon: <Image className="w-4 h-4" />, text: 'Add supporting images, quotes, or visual elements' },
        { icon: <Users className="w-4 h-4" />, text: 'Include a call-to-action - ask readers to share their experiences' },
        { icon: <Tag className="w-4 h-4" />, text: 'Tag thoughtfully: #LifeLessons #PersonalGrowth #Inspiration' }
      ]
    },
    {
      id: 'story-5',
      title: 'Publishing & Growing Your Audience',
      icon: <TrendingUp className="w-5 h-5" />,
      duration: '12 minutes',
      difficulty: 'Intermediate',
      steps: [
        { icon: <Share2 className="w-4 h-4" />, text: 'Publish your story and share across your social networks' },
        { icon: <MessageSquare className="w-4 h-4" />, text: 'Engage with comments - respond personally to build connections' },
        { icon: <Users className="w-4 h-4" />, text: 'Follow other storytellers and engage with their content authentically' },
        { icon: <BarChart3 className="w-4 h-4" />, text: 'Monitor story performance: views, engagement, completion rates' },
        { icon: <Globe className="w-4 h-4" />, text: 'Cross-promote: reference stories in blog posts and vice versa' }
      ]
    }
  ];

  const StepCard = ({ step, type }) => {
    const isCompleted = completedSteps.has(step.id);
    const isActive = activeStep === step.id;

    return (
      <Card className={`mb-4 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg ${isActive ? 'ring-2 ring-primary' : ''} ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleStep(step.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${type === 'blog' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {step.duration}
                  </Badge>
                  <Badge variant={step.difficulty === 'Beginner' ? 'default' : 'secondary'} className="text-xs">
                    {step.difficulty}
                  </Badge>
                  {isCompleted && (
                    <Badge variant="default" className="text-xs bg-green-600 dark:bg-green-600">
                      ✓ Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className={`w-5 h-5 transition-transform ${isActive ? 'rotate-90' : ''}`} />
          </div>
        </CardHeader>

        {isActive && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {step.steps.map((substep, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 dark:bg-muted/20 rounded-lg">
                  <div className="mt-0.5 text-primary">
                    {substep.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{substep.text}</p>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                <div className="text-xs text-muted-foreground">
                  {step.steps.length} steps • Estimated time: {step.duration}
                </div>
                <Button 
                  onClick={() => markComplete(step.id)}
                  disabled={isCompleted}
                  size="sm"
                  className={isCompleted ? 'bg-green-600 dark:bg-green-600' : ''}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const ProgressBar = ({ completed, total, type }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">
          {type === 'blog' ? '📝 Blog Tutorial Progress' : '📚 Stories Tutorial Progress'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {completed} of {total} completed
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${type === 'blog' ? 'bg-blue-500' : 'bg-purple-500'}`}
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
    </div>
  );

  const completedBlogSteps = blogSteps.filter(step => completedSteps.has(step.id)).length;
  const completedStorySteps = storySteps.filter(step => completedSteps.has(step.id)).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-primary rounded-xl">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                SilentVoice Tutorials
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master the art of blogging and storytelling on SilentVoice with our comprehensive step-by-step guides
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Interactive tutorials</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span>Community tips</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="blogs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="blogs" className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Blog Tutorials</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Story Tutorials</span>
            </TabsTrigger>
          </TabsList>

          {/* Blog Tutorials */}
          <TabsContent value="blogs" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tutorial Steps */}
              <div className="lg:col-span-2 space-y-6">
                <ProgressBar completed={completedBlogSteps} total={blogSteps.length} type="blog" />
                
                {blogSteps.map((step) => (
                  <StepCard key={step.id} step={step} type="blog" />
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Pro Blogging Tips</span>
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <p>Write for your audience, not search engines. Authentic content performs better long-term.</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <p>Consistency beats perfection. Publish regularly rather than waiting for the "perfect" post.</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <p>Engage with your community. Respond to comments and visit other blogs in your niche.</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <p>Use analytics to understand what resonates with your audience and double down on those topics.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card">
                  <CardHeader>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Quick Stats</span>
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average blog length</span>
                      <span className="font-semibold">1,200 words</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Optimal posting time</span>
                      <span className="font-semibold">9-11 AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Best performing tags</span>
                      <span className="font-semibold">3-5 tags</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement peak</span>
                      <span className="font-semibold">First 48hrs</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Story Tutorials */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tutorial Steps */}
              <div className="lg:col-span-2 space-y-6">
                <ProgressBar completed={completedStorySteps} total={storySteps.length} type="story" />
                
                {storySteps.map((step) => (
                  <StepCard key={step.id} step={step} type="story" />
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span>Storytelling Magic</span>
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <p>Every great story has conflict or challenge. Share your struggles and how you overcame them.</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <p>Use sensory details. Help readers see, hear, and feel what you experienced.</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <p>End with insight or lesson learned. What did this experience teach you?</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <p>Be vulnerable and authentic. Genuine stories create the strongest connections.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card">
                  <CardHeader>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Content Formats</span>
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                      <Video className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">Video Stories</p>
                        <p className="text-xs text-muted-foreground">Visual experiences, tutorials</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                      <Headphones className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Audio Stories</p>
                        <p className="text-xs text-muted-foreground">Podcasts, voice narratives</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Written Stories</p>
                        <p className="text-xs text-muted-foreground">Traditional storytelling</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card">
                  <CardHeader>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>File Limits</span>
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Video files</span>
                      <span className="font-medium">500MB max</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audio files</span>
                      <span className="font-medium">100MB max</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images</span>
                      <span className="font-medium">10MB max</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Written content</span>
                      <span className="font-medium">Unlimited</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Creating?</h2>
              <p className="text-muted-foreground mb-6">
                You now have everything you need to create amazing blogs and stories on SilentVoice. 
                Join thousands of creators sharing their voices with the world!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <Edit3 className="w-5 h-5 mr-2" />
                  Start Writing a Blog
                </Button>
                <Button size="lg" variant="outline">
                  <Video className="w-5 h-5 mr-2" />
                  Share Your Story
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;





// page is ready to go 