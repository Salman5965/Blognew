import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { followService } from "@/services/followService";
import {
  Users,
  UserPlus,
  UserCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Star,
  TrendingUp,
  BookOpen,
  Eye,
  Heart,
} from "lucide-react";

export const SuggestedUsers = ({ limit = 6, className = "" }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [followLoading, setFollowLoading] = useState(new Set());

  useEffect(() => {
    if (user?._id) {
      loadSuggestedUsers();
    }
  }, [user, limit]);

  const loadSuggestedUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get suggested users based on different criteria
      const [topAuthors, recentUsers, similarUsers] = await Promise.all([
        userService.getTopAuthors({ limit: Math.ceil(limit / 3) }),
        userService
          .searchUsers("", { limit: Math.ceil(limit / 3), sortBy: "recent" })
          .catch(() => ({ data: { users: [] } })),
        getUsersWithSimilarInterests().catch(() => []),
      ]);

      // Combine and deduplicate suggestions
      const allSuggestions = [
        ...(topAuthors.data?.authors || []).map((user) => ({
          ...user,
          reason: "Top Author",
          icon: Star,
        })),
        ...(recentUsers.data?.users || []).map((user) => ({
          ...user,
          reason: "New Member",
          icon: TrendingUp,
        })),
        ...similarUsers.map((user) => ({
          ...user,
          reason: "Similar Interests",
          icon: BookOpen,
        })),
      ];

      // Remove current user and duplicates
      const uniqueSuggestions = allSuggestions
        .filter((suggested) => suggested._id !== user._id)
        .reduce((acc, current) => {
          const exists = acc.find((item) => item._id === current._id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, [])
        .slice(0, limit);

      setSuggestedUsers(uniqueSuggestions);

      // Check which users are already being followed
      if (uniqueSuggestions.length > 0) {
        await checkFollowingStatus(uniqueSuggestions.map((u) => u._id));
      }
    } catch (error) {
      console.error("Error loading suggested users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUsersWithSimilarInterests = async () => {
    try {
      // This would ideally use ML or content-based filtering
      // For now, we'll use a simple approach based on blog topics/tags
      const response = await userService.getAllUsers({
        limit: Math.ceil(limit / 3),
        sortBy: "blogCount",
        isActive: true,
      });
      return response.data?.users || [];
    } catch (error) {
      return [];
    }
  };

  const checkFollowingStatus = async (userIds) => {
    try {
      // Check if current user is following any of these users
      const followingResponse = await userService.getFollowing(user._id, {
        limit: 100,
      });
      const followingIds = new Set(
        (followingResponse.data?.following || []).map((f) => f.id || f._id),
      );
      setFollowingUsers(followingIds);
    } catch (error) {
      console.error("Error checking following status:", error);
    }
  };

  const handleFollowUser = async (targetUserId) => {
    try {
      setFollowLoading((prev) => new Set([...prev, targetUserId]));

      if (followingUsers.has(targetUserId)) {
        // Unfollow
        await followService.unfollowUser(targetUserId);
        setFollowingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(targetUserId);
          return newSet;
        });
        toast({
          title: "Unfollowed",
          description: "User unfollowed successfully",
        });
      } else {
        // Follow
        await followService.followUser(targetUserId);
        setFollowingUsers((prev) => new Set([...prev, targetUserId]));
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    }
    return username?.[0]?.toUpperCase() || "U";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Suggested for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Suggested for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={loadSuggestedUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Suggested for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No suggestions available
            </h3>
            <p className="text-muted-foreground mb-4">
              Check back later for personalized user recommendations
            </p>
            <Button variant="outline" onClick={loadSuggestedUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Suggested for You
          </span>
          <Button variant="ghost" size="sm" onClick={loadSuggestedUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestedUsers.map((suggestedUser) => {
            const ReasonIcon = suggestedUser.icon || Users;
            const isFollowing = followingUsers.has(suggestedUser._id);
            const isLoading = followLoading.has(suggestedUser._id);

            return (
              <div
                key={suggestedUser._id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={suggestedUser.avatar}
                      alt={suggestedUser.username}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(
                        suggestedUser.firstName,
                        suggestedUser.lastName,
                        suggestedUser.username,
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm truncate">
                        {suggestedUser.firstName || suggestedUser.lastName
                          ? `${suggestedUser.firstName || ""} ${suggestedUser.lastName || ""}`.trim()
                          : suggestedUser.username}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        <ReasonIcon className="h-3 w-3 mr-1" />
                        {suggestedUser.reason}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground truncate">
                      @{suggestedUser.username}
                    </p>

                    {suggestedUser.bio && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {suggestedUser.bio}
                      </p>
                    )}

                    {/* User Stats */}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                      {suggestedUser.blogCount !== undefined && (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{suggestedUser.blogCount} blogs</span>
                        </div>
                      )}
                      {suggestedUser.totalViews !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{suggestedUser.totalViews} views</span>
                        </div>
                      )}
                      {suggestedUser.totalLikes !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{suggestedUser.totalLikes} likes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFollowUser(suggestedUser._id)}
                    disabled={isLoading}
                    className={
                      isFollowing
                        ? "text-gray-600 hover:text-red-600 hover:border-red-300"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* View More Button */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => (window.location.href = "/explore")}
            >
              <Users className="h-4 w-4 mr-2" />
              Discover More Users
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedUsers;
