import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCard } from "@/components/shared/UserCard";
import { followService } from "@/services/followService";
import {
  Search,
  UserCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FollowingList = ({ userId, variant = "default" }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Load following
  const loadFollowing = async (query = "", page = 1) => {
    try {
      setLoading(page === 1);
      setError(null);

      const response = await followService.getFollowing(userId, {
        search: query,
        page,
        limit: 20,
      });

      setFollowing(response.following || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error("Error loading following:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load following",
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
      loadFollowing();
    }
  }, [userId]);

  // Search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (userId) {
        loadFollowing(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFollowing(searchQuery);
  };

  const handleFollowChange = (isFollowing, userData) => {
    // If user unfollowed someone, remove them from the following list
    if (!isFollowing) {
      setFollowing((prev) =>
        prev.filter((user) => user._id !== userData.userId),
      );
    }
  };

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search following..."
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

        {/* Following List */}
        {!loading && !error && (
          <div className="space-y-1">
            {following.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Not following anyone
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No users found matching your search."
                    : "When this user follows people, they'll appear here."}
                </p>
              </div>
            ) : (
              following.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  variant="compact"
                  onFollowChange={handleFollowChange}
                />
              ))
            )}
          </div>
        )}

        {/* Stats */}
        {pagination && pagination.totalFollowing > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {following.length} of {pagination.totalFollowing} following
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
            <UserCheck className="h-5 w-5" />
            <span>Following</span>
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({pagination.totalFollowing})
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
            placeholder="Search following..."
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

        {/* Following Grid */}
        {!loading && !error && (
          <div className="space-y-4">
            {following.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Not following anyone
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No users found matching your search."
                    : "When this user follows people, they'll appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {following.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
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

export default FollowingList;
