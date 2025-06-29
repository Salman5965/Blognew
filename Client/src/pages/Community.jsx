import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Heart,
  Star,
  ArrowRight,
  Activity,
  UserPlus,
  MessageCircle,
  Eye,
  Crown,
  Medal,
  Trophy,
  Clock,
  Hash,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import communityService from "@/services/communityService";

const Community = () => {
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    totalPosts: 0,
    totalDiscussions: 0,
    dailyActiveUsers: 0,
  });
  const [topMembers, setTopMembers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [featuredDiscussions, setFeaturedDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        const [stats, members, activity, topics, discussions] =
          await Promise.all([
            communityService.getStats(),
            communityService.getTopMembers(),
            communityService.getRecentActivity(),
            communityService.getPopularTopics(),
            communityService.getFeaturedDiscussions(),
          ]);

        setCommunityStats(stats);
        setTopMembers(members);
        setRecentActivity(activity);
        setPopularTopics(topics);
        setFeaturedDiscussions(discussions);
      } catch (error) {
        console.error("Failed to load community data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunityData();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-orange-500" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "post":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Join Our Community</h2>
            <p className="text-muted-foreground">
              Connect with writers, readers, and creators from around the world
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">Sign In to Join</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Community Hub</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Connect, share, and grow with our vibrant community of writers and
              readers
            </p>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(communityStats?.totalMembers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(communityStats?.onlineMembers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(communityStats?.totalPosts || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(communityStats?.totalDiscussions || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Discussions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader
              className="text-center pb-4"
              onClick={() => navigate("/community/forum")}
            >
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Join Discussions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Participate in real-time conversations
              </p>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader
              className="text-center pb-4"
              onClick={() => navigate("/explore")}
            >
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Explore Trending</CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover popular content and authors
              </p>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader
              className="text-center pb-4"
              onClick={() => navigate("/create")}
            >
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Create Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share your stories with the community
              </p>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Discussions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Featured Discussions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : Array.isArray(featuredDiscussions) ? (
                  featuredDiscussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={discussion.author.avatar} />
                        <AvatarFallback>
                          {discussion.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {discussion.title}
                          </h4>
                          {discussion.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {discussion.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by {discussion.author.name}</span>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {discussion.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {discussion.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {discussion.lastActivity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No discussions available</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/community/forum")}
                >
                  View All Discussions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-16 bg-muted rounded-full animate-pulse"
                      ></div>
                    ))
                  ) : Array.isArray(popularTopics) ? (
                    popularTopics.map((topic) => (
                      <Badge
                        key={topic.id}
                        variant="secondary"
                        className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                      >
                        #{topic.name}
                        <span className="ml-1 text-xs opacity-70">
                          {topic.count}
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No topics available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Community Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 animate-pulse"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="h-2 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                ) : Array.isArray(topMembers) ? (
                  topMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex items-center space-x-1">
                        {getRankIcon(index + 1)}
                        <span className="text-xs font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.points} points
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground text-sm">
                    No contributors available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2 animate-pulse"
                    >
                      <div className="w-4 h-4 bg-muted rounded mt-0.5"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                ) : Array.isArray(recentActivity) ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-2"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 text-xs">
                        <p className="text-foreground">
                          <span className="font-medium">
                            {activity.user.name}
                          </span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground text-sm">
                    No recent activity
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Forum CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Join the Forum</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with community members in real-time discussions
                </p>
                <Button
                  onClick={() => navigate("/community/forum")}
                  className="w-full"
                >
                  Enter Forum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
