import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowingList } from "@/components/users/FollowingList";
import { userService } from "@/services/userService";
import { followService } from "@/services/followService";
import { ROUTES } from "@/utils/constant";
import { Users, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isValidObjectId } from "@/utils/validation";

export const FollowingPage = () => {
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
          const followStatsResponse =
            await followService.getFollowStats(userId);
          setFollowStats({
            followersCount: followStatsResponse.followersCount || 0,
            followingCount: followStatsResponse.followingCount || 0,
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

    // Check if both firstName and lastName exist and are not empty
    if (
      user.firstName &&
      user.lastName &&
      typeof user.firstName === "string" &&
      typeof user.lastName === "string" &&
      user.firstName.trim().length > 0 &&
      user.lastName.trim().length > 0
    ) {
      return `${user.firstName.trim()} ${user.lastName.trim()}`;
    }

    // Fallback to username if available
    if (
      user.username &&
      typeof user.username === "string" &&
      user.username.trim().length > 0
    ) {
      return user.username.trim();
    }

    // Final fallback
    return "Anonymous User";
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
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                {getDisplayName()}
              </h1>
              <p className="text-muted-foreground truncate">@{user.username}</p>

              {/* Follow Stats */}
              {followStats && (
                <div className="flex items-center space-x-3 sm:space-x-4 mt-2 text-sm text-muted-foreground">
                  <Link
                    to={`/users/${userId}/followers`}
                    className="hover:text-foreground font-medium flex-shrink-0"
                  >
                    <span className="text-foreground">
                      {followStats.followersCount}
                    </span>{" "}
                    followers
                  </Link>
                  <Link
                    to={`/users/${userId}/following`}
                    className="hover:text-foreground font-medium flex-shrink-0"
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
        <div className="flex items-center space-x-4 sm:space-x-6 border-b overflow-x-auto">
          <Link
            to={`/users/${userId}/followers`}
            className="flex items-center space-x-2 pb-3 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Users className="h-4 w-4" />
            <span>Followers</span>
            {followStats && (
              <span className="text-sm">({followStats.followersCount})</span>
            )}
          </Link>
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-primary flex-shrink-0">
            <UserCheck className="h-4 w-4" />
            <span className="font-medium">Following</span>
            {followStats && (
              <span className="text-sm text-muted-foreground">
                ({followStats.followingCount})
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          <FollowingList userId={userId} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default FollowingPage;
