import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Sparkles,
  Search,
  Plus,
  Settings,
  ArrowRight,
  Zap,
  Heart,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/features/chat/chatStore";
import { userService } from "@/services/userService";
import { getDisplayName, getInitials } from "@/utils/userUtils";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const {
    openChat,
    fetchConversations,
    startConversation,
    conversations,
    unreadCount,
  } = useChatStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    loadRecentContacts();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadRecentContacts = async () => {
    try {
      // Get some recent users who might be good to message
      const response = await userService.getTopAuthors(6);
      setRecentContacts(response || []);
    } catch (error) {
      console.error("Failed to load recent contacts:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await userService.searchUsers(searchQuery, 8);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartConversation = async (userToMessage) => {
    try {
      const chatUser = {
        id: userToMessage._id || userToMessage.id,
        name: getDisplayName(userToMessage),
        username: userToMessage.username,
        avatar: userToMessage.avatar,
      };

      await startConversation(chatUser);
      openChat();

      toast({
        title: "Chat started",
        description: `You can now message ${chatUser.name}`,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickOpenChat = () => {
    fetchConversations();
    openChat();
    toast({
      title: "Chat opened",
      description:
        "Chat panel is now open. You can continue your conversations.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquare className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect & Collaborate
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Message other writers, share ideas, get feedback, and build
              meaningful connections in our writing community.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={handleQuickOpenChat}
                className="flex items-center gap-2"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                Open Chat Panel
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/explore")}
                size="lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Discover Writers
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Real-time Messaging</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant messaging with other writers in our community
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Quick Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Start conversations with one click from any profile
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Build Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with like-minded writers and creators
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Connect Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find People to Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for writers by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="space-y-3">
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Searching...
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Search Results
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.map((person) => (
                          <Card
                            key={person._id || person.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={person.avatar} />
                                    <AvatarFallback>
                                      {getInitials(
                                        person.firstName,
                                        person.lastName,
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {getDisplayName(person)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      @{person.username}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStartConversation(person)
                                  }
                                >
                                  Message
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No users found for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent/Popular Writers */}
          {!searchQuery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Popular Writers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentContacts.map((person) => (
                    <Card
                      key={person._id || person.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={person.avatar} />
                              <AvatarFallback>
                                {getInitials(person.firstName, person.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {getDisplayName(person)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                @{person.username}
                              </p>
                              {person.bio && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {person.bio}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleStartConversation(person)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* How it Works */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-background">
            <CardHeader>
              <CardTitle>How to Start Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Find Someone</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse profiles, search for writers, or discover new people
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Click Message</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the message button on their profile or from search
                    results
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Start Chatting</h4>
                  <p className="text-sm text-muted-foreground">
                    The chat panel opens automatically - start your
                    conversation!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Already have ongoing conversations?
            </p>
            <Button
              variant="outline"
              onClick={handleQuickOpenChat}
              className="flex items-center gap-2 mx-auto"
            >
              Open Chat Panel
              <ArrowRight className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} unread</Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
