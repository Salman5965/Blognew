import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowSuggestions } from "@/components/users/FollowSuggestions";
import { UserCard } from "@/components/shared/UserCard";
import { followService } from "@/services/followService";
import { userService } from "@/services/userService";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import {
  Search,
  Users,
  TrendingUp,
  Sparkles,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("suggestions");
  const { toast } = useToast();

  // Popular categories for discovery
  const popularCategories = [
    "Technology",
    "Design",
    "Programming",
    "Lifestyle",
    "Business",
    "Health",
    "Travel",
    "Food",
    "Art",
    "Science",
    "Education",
    "Music",
  ];

  // Load initial data
  useEffect(() => {
    loadTopAuthors();
  }, []);

  // Debounced search
  const [debouncedSearch] = useDebouncedCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await followService.searchUsers(query, 20);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Unable to search users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  }, 500);

  const loadTopAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const authors = await userService.getTopAuthors(20);
      setTopAuthors(authors || []);
    } catch (error) {
      console.error("Error loading top authors:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFollowChange = (isFollowing, userData, userId) => {
    // Update the user's following status in search results
    setSearchResults((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, isFollowing } : user,
      ),
    );

    // Update in top authors list
    setTopAuthors((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, isFollowing } : user,
      ),
    );
  };

  const handleCategoryClick = (category) => {
    handleSearch(category.toLowerCase());
    setActiveTab("search");
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Discover</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find amazing writers, connect with like-minded people, and discover
            your next favorite content creator.
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for writers, topics, or interests..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Popular Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/80 hover:text-primary-foreground transition-colors"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="suggestions"
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Suggested</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search Results</span>
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Popular Authors</span>
            </TabsTrigger>
          </TabsList>

          {/* Suggested Users Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <FollowSuggestions
              limit={12}
              title="People you might like"
              showHeader={false}
            />
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="search" className="space-y-6">
            {searchQuery ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Search results for "{searchQuery}"
                  </h3>
                  {searchResults.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {searchResults.length} users found
                    </span>
                  )}
                </div>

                {searchLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No users found
                    </h3>
                    <p className="text-muted-foreground">
                      Try searching with different keywords or browse our
                      suggestions.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        onFollowChange={(isFollowing, userData) =>
                          handleFollowChange(isFollowing, userData, user._id)
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                <p className="text-muted-foreground">
                  Enter a name, topic, or interest to find people to follow.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Popular Authors Tab */}
          <TabsContent value="popular" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Popular Authors</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadTopAuthors}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Failed to load authors
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadTopAuthors}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : topAuthors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No authors found</h3>
                <p className="text-muted-foreground">
                  Check back later for popular authors.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topAuthors.map((author) => (
                  <UserCard
                    key={author._id}
                    user={author}
                    onFollowChange={(isFollowing, userData) =>
                      handleFollowChange(isFollowing, userData, author._id)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Discover;
