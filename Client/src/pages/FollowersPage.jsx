import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowersList } from "@/components/users/FollowersList";
import { FollowSuggestions } from "@/components/users/FollowSuggestions";
import { userService } from "@/services/userService";
import { followService } from "@/services/followService";
import { ROUTES } from "@/utils/constant";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isValidObjectId } from "@/utils/validation";

export const FollowersPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data and follow stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate userId format
        if (!userId || !isValidObjectId(userId)) {
          throw new Error("Invalid user ID format");
        }

        // Load user profile
        const userData = await userService.getUserById(userId);
        if (!userData) {
          throw new Error("User not found");
        }
        setUser(userData);

        // Load follow stats - continue even if user profile failed
        try {
          const [followersResponse, followingResponse] = await Promise.all([
            userService.getFollowers(userId, { page: 1, limit: 1 }),
            userService.getFollowing(userId, { page: 1, limit: 1 }),
          ]);

          setFollowStats({
            followersCount: followersResponse.pagination?.totalFollowers || 0,
            followingCount: followingResponse.pagination?.totalFollowing || 0,
          });
        } catch (followError) {
          console.warn("Failed to load follow stats:", followError);
          // Set default values if follow stats fail
          setFollowStats({
            followersCount: 0,
            followingCount: 0,
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError(error.message);

        // More specific error messages
        let errorMessage = "Failed to load user profile";
        if (error.message === "Invalid user ID format") {
          errorMessage = "Invalid user ID. Please check the URL.";
        } else if (
          error.message === "User not found" ||
          error.message === "Not Found"
        ) {
          errorMessage =
            "User not found. They may have been deleted or the link is incorrect.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    } else {
      setError("No user ID provided");
      setLoading(false);
    }
  }, [userId, toast]);

  const getInitials = () => {
    if (!user) return "";

    // Check if both firstName and lastName exist and are not empty
    if (
      user.firstName &&
      user.lastName &&
      typeof user.firstName === "string" &&
      typeof user.lastName === "string" &&
      user.firstName.length > 0 &&
      user.lastName.length > 0
    ) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }

    // Fallback to username if available
    if (
      user.username &&
      typeof user.username === "string" &&
      user.username.length > 0
    ) {
      return user.username.charAt(0).toUpperCase();
    }

    // Final fallback
    return "U";
  };

  const getDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !user) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The user you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-4 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
              <p className="text-muted-foreground">@{user.username}</p>

              {/* Follow Stats */}
              {followStats && (
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <Link
                    to={`/users/${userId}/followers`}
                    className="hover:text-foreground font-medium"
                  >
                    <span className="text-foreground">
                      {followStats.followersCount}
                    </span>{" "}
                    followers
                  </Link>
                  <Link
                    to={`/users/${userId}/following`}
                    className="hover:text-foreground font-medium"
                  >
                    <span className="text-foreground">
                      {followStats.followingCount}
                    </span>{" "}
                    following
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-6 border-b">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-primary">
            <Users className="h-4 w-4" />
            <span className="font-medium">Followers</span>
            {followStats && (
              <span className="text-sm text-muted-foreground">
                ({followStats.followersCount})
              </span>
            )}
          </div>
          <Link
            to={`/users/${userId}/following`}
            className="flex items-center space-x-2 pb-3 text-muted-foreground hover:text-foreground"
          >
            <UserCheck className="h-4 w-4" />
            <span>Following</span>
            {followStats && (
              <span className="text-sm">({followStats.followingCount})</span>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <FollowersList userId={userId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FollowSuggestions limit={4} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default FollowersPage;
