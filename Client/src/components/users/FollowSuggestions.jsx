import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCard } from "@/components/shared/UserCard";
import { followService } from "@/services/followService";
import {
  UserPlus,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FollowSuggestions = ({
  limit = 6,
  variant = "default",
  title = "Suggested for you",
  showHeader = true,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Load suggestions
  const loadSuggestions = async () => {
    try {
      setLoading(suggestions.length === 0);
      setError(null);

      const suggestionList = await followService.getFollowSuggestions(limit);
      setSuggestions(suggestionList || []);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load follow suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSuggestions();
  }, [limit]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSuggestions();
  };

  const handleFollowChange = (isFollowing, userData, userId) => {
    if (isFollowing) {
      // Remove the followed user from suggestions
      setSuggestions((prev) => prev.filter((user) => user._id !== userId));

      toast({
        title: "Great choice!",
        description: "We'll show you more content from this user",
        duration: 2000,
      });
    }
  };

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>{title}</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestions List */}
        {!loading && !error && (
          <div className="space-y-2">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suggestions</h3>
                <p className="text-muted-foreground text-sm">
                  Check back later for new people to follow!
                </p>
              </div>
            ) : (
              suggestions.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  variant="compact"
                  showBio={false}
                  onFollowChange={(isFollowing, userData) =>
                    handleFollowChange(isFollowing, userData, user._id)
                  }
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{title}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestions Grid */}
        {!loading && !error && (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No suggestions available
                </h3>
                <p className="text-muted-foreground">
                  Check back later for new people to follow!
                </p>
                <Button onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    showStats={true}
                    onFollowChange={(isFollowing, userData) =>
                      handleFollowChange(isFollowing, userData, user._id)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowSuggestions;
