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
  Loader2,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import forumService from "@/services/forumService";

const ForumChannelList = ({
  selectedChannel,
  onChannelSelect,
  searchQuery,
}) => {
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["general", "development"]),
  );
  const [notifications, setNotifications] = useState(true);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load channels from API
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoading(true);
        const response = await forumService.getChannels();
        setChannels(response.channels || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load channels:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, []);

  // Helper functions
  const getChannelIcon = (channelName) => {
    if (channelName.includes("welcome") || channelName.includes("intro"))
      return Users;
    if (channelName.includes("dev") || channelName.includes("code"))
      return Code;
    if (channelName.includes("help") || channelName.includes("support"))
      return HelpCircle;
    if (channelName.includes("job") || channelName.includes("career"))
      return Briefcase;
    if (channelName.includes("random") || channelName.includes("off-topic"))
      return Coffee;
    if (channelName.includes("game")) return Gamepad2;
    if (channelName.includes("music")) return Music;
    if (channelName.includes("photo") || channelName.includes("design"))
      return Camera;
    if (channelName.includes("book") || channelName.includes("learn"))
      return Book;
    return Hash;
  };

  const getCategoryDisplayName = (categoryId) => {
    const displayNames = {
      general: "General",
      development: "Development",
      help: "Help & Support",
      career: "Career",
      offtopic: "Off Topic",
    };
    return (
      displayNames[categoryId] ||
      categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
    );
  };

  // Organize channels by category with dynamic data
  const organizeChannelsByCategory = () => {
    const categories = {};

    // Group channels by category
    channels.forEach((channel) => {
      const category = channel.category || "general";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        ...channel,
        icon: getChannelIcon(channel.name),
        messageCount: channel.messageCount || 0,
        onlineCount: channel.onlineCount || 0,
        lastActivity: channel.lastActivity || "No activity",
        unread: channel.unread || 0,
      });
    });

    return Object.entries(categories).map(([id, channels]) => ({
      id,
      name: getCategoryDisplayName(id),
      channels,
    }));
  };

  // Fallback categories if no channels are loaded
  const getFallbackCategories = () => [
    {
      id: "general",
      name: "General",
      channels: [
        {
          id: "general-discussion",
          name: "General Discussion",
          description: "General conversations and announcements",
          icon: Hash,
          messageCount: 1247,
          onlineCount: 89,
          lastActivity: "2 minutes ago",
          unread: 3,
        },
        {
          id: "welcome",
          name: "Welcome",
          description: "Welcome new members!",
          icon: Users,
          messageCount: 567,
          onlineCount: 34,
          lastActivity: "5 minutes ago",
          unread: 0,
          pinned: true,
        },
      ],
    },
    {
      id: "development",
      name: "Development",
      channels: [
        {
          id: "development",
          name: "Development",
          description: "Programming and development discussions",
          icon: Code,
          messageCount: 892,
          onlineCount: 45,
          lastActivity: "5 minutes ago",
          unread: 1,
        },
        {
          id: "help-support",
          name: "Help & Support",
          description: "Get help from the community",
          icon: HelpCircle,
          messageCount: 234,
          onlineCount: 23,
          lastActivity: "8 minutes ago",
          unread: 0,
        },
      ],
    },
  ];

  const channelCategories = organizeChannelsByCategory();
  const displayCategories =
    channelCategories.length > 0 ? channelCategories : getFallbackCategories();

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = displayCategories
    .map((category) => ({
      ...category,
      channels: category.channels.filter(
        (channel) =>
          channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          channel.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading channels...
            </span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>Failed to load channels</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Using fallback channels</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No channels found</p>
            {searchQuery && (
              <p className="text-sm">Try adjusting your search</p>
            )}
          </div>
        ) : null}

        {/* Channel Categories */}
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
