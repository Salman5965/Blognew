import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Hash,
  Settings,
  Search,
  Filter,
  Pin,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import ForumChannelList from "@/components/forum/ForumChannelList";
import ForumChat from "@/components/forum/ForumChat";
import ForumWelcome from "@/components/forum/ForumWelcome";

const CommunityForum = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChannelListOpen, setIsChannelListOpen] = useState(true);
  const { user, isAuthenticated } = useAuthContext();

  const forumStats = {
    totalMembers: 12453,
    onlineMembers: 342,
    totalMessages: 89234,
    channelsCount: 28,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Join the Community</h2>
            <p className="text-muted-foreground">
              Connect with developers, share knowledge, and get help from the
              community
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/auth/signin">Sign In to Join</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/signup">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Forum Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Community Forum</h1>
              </div>
              <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {forumStats.onlineMembers.toLocaleString()} online
                  </span>
                </div>
                <span>•</span>
                <span>{forumStats.totalMembers.toLocaleString()} members</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Channel Sidebar */}
        <div
          className={`${isChannelListOpen ? "w-80" : "w-0"} transition-all duration-300 border-r bg-card overflow-hidden`}
        >
          <ForumChannelList
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
            searchQuery={searchQuery}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <ForumChat
              channel={selectedChannel}
              onToggleSidebar={() => setIsChannelListOpen(!isChannelListOpen)}
            />
          ) : (
            <ForumWelcome
              stats={forumStats}
              onChannelSelect={setSelectedChannel}
              onToggleSidebar={() => setIsChannelListOpen(!isChannelListOpen)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;
