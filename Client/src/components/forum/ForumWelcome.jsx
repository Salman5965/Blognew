import React from "react";
import {
  Users,
  MessageCircle,
  TrendingUp,
  Hash,
  Zap,
  Heart,
  Code,
  HelpCircle,
  Briefcase,
  Coffee,
  Menu,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ForumWelcome = ({
  stats,
  onChannelSelect,
  onToggleSidebar,
  isLoading = false,
}) => {
  const popularChannels = [
    {
      id: "general-chat",
      name: "general-chat",
      description: "General discussions and casual conversations",
      icon: Hash,
      memberCount: 1234,
      messageCount: 8934,
      trending: true,
    },
    {
      id: "frontend",
      name: "frontend",
      description: "React, Vue, Angular discussions",
      icon: Code,
      memberCount: 567,
      messageCount: 4567,
      trending: true,
    },
    {
      id: "help-general",
      name: "help-general",
      description: "General help and questions",
      icon: HelpCircle,
      memberCount: 789,
      messageCount: 3456,
      trending: false,
    },
    {
      id: "random",
      name: "random",
      description: "Random conversations and off-topic",
      icon: Coffee,
      memberCount: 892,
      messageCount: 5678,
      trending: true,
    },
  ];

  const recentActivities = [
    {
      user: "Alex Chen",
      action: "started a discussion in",
      channel: "frontend",
      topic: "React 18 Concurrent Features",
      time: "2 minutes ago",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    },
    {
      user: "Sarah Johnson",
      action: "shared a resource in",
      channel: "help-general",
      topic: "Free JavaScript Learning Resources",
      time: "5 minutes ago",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    },
    {
      user: "Mike Torres",
      action: "answered a question in",
      channel: "backend",
      topic: "Node.js Performance Optimization",
      time: "8 minutes ago",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    },
    {
      user: "Emma Wilson",
      action: "posted in",
      channel: "job-postings",
      topic: "Remote Frontend Developer Position",
      time: "12 minutes ago",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    },
  ];

  const quickActions = [
    {
      title: "Ask for Help",
      description: "Get help from the community",
      icon: HelpCircle,
      channel: "help-general",
      color: "bg-blue-500",
    },
    {
      title: "Share Knowledge",
      description: "Share what you learned",
      icon: Zap,
      channel: "general-chat",
      color: "bg-purple-500",
    },
    {
      title: "Find Jobs",
      description: "Browse job opportunities",
      icon: Briefcase,
      channel: "job-postings",
      color: "bg-green-500",
    },
    {
      title: "Code Review",
      description: "Get your code reviewed",
      icon: Code,
      channel: "code-review",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Welcome to the Community!</h1>
            <p className="text-muted-foreground">
              Connect, learn, and grow with fellow developers
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {(stats?.totalMembers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Members
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="relative">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="text-2xl font-bold">
                  {(stats?.onlineMembers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Online Now</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {(stats?.totalMessages || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Hash className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {stats?.channelsCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Channels</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div
                        className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          onChannelSelect({
                            id: action.channel,
                            name: action.channel,
                            description: action.description,
                            icon: Icon,
                          })
                        }
                      >
                        Get Started
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Popular Channels */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Popular Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Card
                    key={channel.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">#{channel.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {channel.description}
                            </p>
                          </div>
                        </div>
                        {channel.trending && (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{channel.memberCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{channel.messageCount}</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onChannelSelect(channel)}
                        >
                          Join Chat
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4 p-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>
                          {activity.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            {activity.action}{" "}
                          </span>
                          <span className="font-medium">
                            #{activity.channel}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.topic}
                        </p>
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Community Guidelines
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Be respectful and inclusive</p>
                  <p className="text-sm text-muted-foreground">
                    Treat everyone with kindness and respect
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Help others learn and grow</p>
                  <p className="text-sm text-muted-foreground">
                    Share knowledge and support fellow developers
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Code className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Share quality content</p>
                  <p className="text-sm text-muted-foreground">
                    Post relevant, helpful, and constructive content
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Use appropriate channels</p>
                  <p className="text-sm text-muted-foreground">
                    Post in the right channel for your topic
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForumWelcome;
