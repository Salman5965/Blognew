import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "./FollowButton";
import { ROUTES } from "@/utils/constant";
import { Users, UserCheck } from "lucide-react";

export const UserCard = ({
  user,
  showFollowButton = true,
  showStats = true,
  showBio = true,
  variant = "default",
  onFollowChange,
}) => {
  const userProfileUrl = `/users/${user._id}`;

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Link to={userProfileUrl}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={userProfileUrl} className="hover:underline">
              <p className="font-medium text-sm truncate">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </Link>
            {user.mutualFollows > 0 && (
              <p className="text-xs text-muted-foreground">
                {user.mutualFollows} mutual follow
                {user.mutualFollows !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {showFollowButton && (
          <FollowButton
            userId={user._id}
            initialFollowingStatus={user.isFollowing}
            size="sm"
            onFollowChange={onFollowChange}
          />
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Link to={userProfileUrl}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <Link to={userProfileUrl} className="hover:underline">
                  <h3 className="font-semibold text-lg truncate">
                    {getDisplayName()}
                  </h3>
                  <p className="text-muted-foreground">@{user.username}</p>
                </Link>

                {/* Bio */}
                {showBio && user.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Stats */}
                {showStats && (
                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{user.followersCount || 0} followers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserCheck className="h-4 w-4" />
                      <span>{user.followingCount || 0} following</span>
                    </div>
                  </div>
                )}

                {/* Mutual follows and reason */}
                <div className="flex items-center space-x-2 mt-2">
                  {user.mutualFollows > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {user.mutualFollows} mutual
                    </Badge>
                  )}
                  {user.reason && (
                    <Badge variant="outline" className="text-xs">
                      {user.reason}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              {showFollowButton && (
                <div className="ml-4">
                  <FollowButton
                    userId={user._id}
                    initialFollowingStatus={user.isFollowing}
                    onFollowChange={onFollowChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
