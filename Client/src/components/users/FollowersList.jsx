import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCard } from "@/components/shared/UserCard";
import { followService } from "@/services/followService";
import { Search, Users, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FollowersList = ({ userId, variant = "default" }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Load followers
  const loadFollowers = async (query = "", page = 1) => {
    try {
      setLoading(page === 1);
      setError(null);

      const response = await followService.getFollowers(userId, {
        search: query,
        page,
        limit: 20,
      });

      setFollowers(response.followers || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error("Error loading followers:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load followers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      loadFollowers();
    }
  }, [userId]);

  // Search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (userId) {
        loadFollowers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFollowers(searchQuery);
  };

  const handleFollowChange = (isFollowing, userData) => {
    // Update the follower's following status in the list
    setFollowers((prev) =>
      prev.map((follower) =>
        follower._id === userData.userId
          ? { ...follower, isFollowing }
          : follower,
      ),
    );
  };

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

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

        {/* Followers List */}
        {!loading && !error && (
          <div className="space-y-1">
            {followers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No followers yet</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No followers found matching your search."
                    : "When people follow this user, they'll appear here."}
                </p>
              </div>
            ) : (
              followers.map((follower) => (
                <UserCard
                  key={follower._id}
                  user={follower}
                  variant="compact"
                  onFollowChange={handleFollowChange}
                />
              ))
            )}
          </div>
        )}

        {/* Stats */}
        {pagination && pagination.totalFollowers > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {followers.length} of {pagination.totalFollowers} followers
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
            <Users className="h-5 w-5" />
            <span>Followers</span>
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({pagination.totalFollowers})
              </span>
            )}
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

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

        {/* Followers Grid */}
        {!loading && !error && (
          <div className="space-y-4">
            {followers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No followers yet</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No followers found matching your search."
                    : "When people follow this user, they'll appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followers.map((follower) => (
                  <UserCard
                    key={follower._id}
                    user={follower}
                    onFollowChange={handleFollowChange}
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

export default FollowersList;
