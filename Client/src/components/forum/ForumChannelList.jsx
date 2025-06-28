import React, { useState, useEffect } from "react";
import {
  Hash,
  Users,
  Code,
  HelpCircle,
  Briefcase,
  Coffee,
  Gamepad2,
  Music,
  Camera,
  Book,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ForumChannelList = ({
  selectedChannel,
  onChannelSelect,
  searchQuery,
}) => {
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["general", "development"]),
  );
  const [notifications, setNotifications] = useState(true);

  const channelCategories = [
    {
      id: "general",
      name: "General",
      channels: [
        {
          id: "welcome",
          name: "welcome",
          description: "Welcome new members!",
          icon: Users,
          messageCount: 1234,
          onlineCount: 45,
          lastActivity: "2 min ago",
          unread: 3,
        },
        {
          id: "announcements",
          name: "announcements",
          description: "Important updates",
          icon: Hash,
          messageCount: 567,
          onlineCount: 89,
          lastActivity: "5 min ago",
          unread: 0,
          pinned: true,
        },
        {
          id: "general-chat",
          name: "general-chat",
          description: "General discussions",
          icon: Hash,
          messageCount: 8934,
          onlineCount: 123,
          lastActivity: "1 min ago",
          unread: 12,
        },
        {
          id: "introductions",
          name: "introductions",
          description: "Introduce yourself",
          icon: Users,
          messageCount: 2341,
          onlineCount: 34,
          lastActivity: "3 min ago",
          unread: 5,
        },
      ],
    },
    {
      id: "development",
      name: "Development",
      channels: [
        {
          id: "frontend",
          name: "frontend",
          description: "React, Vue, Angular discussions",
          icon: Code,
          messageCount: 4567,
          onlineCount: 67,
          lastActivity: "30 sec ago",
          unread: 8,
        },
        {
          id: "backend",
          name: "backend",
          description: "Node.js, Python, Java",
          icon: Code,
          messageCount: 3456,
          onlineCount: 54,
          lastActivity: "2 min ago",
          unread: 4,
        },
        {
          id: "mobile-dev",
          name: "mobile-dev",
          description: "iOS, Android, React Native",
          icon: Code,
          messageCount: 2345,
          onlineCount: 32,
          lastActivity: "4 min ago",
          unread: 0,
        },
        {
          id: "devops",
          name: "devops",
          description: "CI/CD, Docker, Cloud",
          icon: Code,
          messageCount: 1876,
          onlineCount: 28,
          lastActivity: "6 min ago",
          unread: 2,
        },
      ],
    },
    {
      id: "help",
      name: "Help & Support",
      channels: [
        {
          id: "help-general",
          name: "help-general",
          description: "General help and questions",
          icon: HelpCircle,
          messageCount: 3456,
          onlineCount: 78,
          lastActivity: "1 min ago",
          unread: 15,
        },
        {
          id: "code-review",
          name: "code-review",
          description: "Get your code reviewed",
          icon: Code,
          messageCount: 1234,
          onlineCount: 23,
          lastActivity: "8 min ago",
          unread: 0,
        },
        {
          id: "debugging",
          name: "debugging",
          description: "Debug together",
          icon: Code,
          messageCount: 987,
          onlineCount: 19,
          lastActivity: "12 min ago",
          unread: 1,
        },
      ],
    },
    {
      id: "career",
      name: "Career",
      channels: [
        {
          id: "job-postings",
          name: "job-postings",
          description: "Job opportunities",
          icon: Briefcase,
          messageCount: 567,
          onlineCount: 45,
          lastActivity: "15 min ago",
          unread: 3,
        },
        {
          id: "interviews",
          name: "interviews",
          description: "Interview prep and experiences",
          icon: Briefcase,
          messageCount: 789,
          onlineCount: 23,
          lastActivity: "20 min ago",
          unread: 0,
        },
        {
          id: "freelancing",
          name: "freelancing",
          description: "Freelance discussions",
          icon: Briefcase,
          messageCount: 345,
          onlineCount: 12,
          lastActivity: "25 min ago",
          unread: 2,
        },
      ],
    },
    {
      id: "offtopic",
      name: "Off Topic",
      channels: [
        {
          id: "random",
          name: "random",
          description: "Random conversations",
          icon: Coffee,
          messageCount: 5678,
          onlineCount: 89,
          lastActivity: "30 sec ago",
          unread: 23,
        },
        {
          id: "gaming",
          name: "gaming",
          description: "Gaming discussions",
          icon: Gamepad2,
          messageCount: 2345,
          onlineCount: 34,
          lastActivity: "2 min ago",
          unread: 5,
        },
        {
          id: "music",
          name: "music",
          description: "Share your favorite music",
          icon: Music,
          messageCount: 1234,
          onlineCount: 23,
          lastActivity: "5 min ago",
          unread: 0,
        },
        {
          id: "photography",
          name: "photography",
          description: "Photography and visual arts",
          icon: Camera,
          messageCount: 876,
          onlineCount: 15,
          lastActivity: "10 min ago",
          unread: 1,
        },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = channelCategories
    .map((category) => ({
      ...category,
      channels: category.channels.filter(
        (channel) =>
          channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          channel.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.channels.length > 0 || !searchQuery);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Channels</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                {category.name}
              </span>
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedCategories.has(category.id) && (
              <div className="space-y-1">
                {category.channels.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannel?.id === channel.id;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => onChannelSelect(channel)}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">
                            {channel.name}
                          </span>
                          <div className="flex items-center space-x-1 ml-2">
                            {channel.pinned && (
                              <Pin className="h-3 w-3 text-yellow-500" />
                            )}
                            {channel.unread > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5"
                              >
                                {channel.unread > 99 ? "99+" : channel.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{channel.onlineCount}</span>
                          <span className="mx-1">•</span>
                          <span className="truncate">
                            {channel.lastActivity}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Channel Button */}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Channel
        </Button>
      </div>
    </div>
  );
};

export default ForumChannelList;
