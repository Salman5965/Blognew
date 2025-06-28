import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowButton } from "@/components/shared/FollowButton";
import { FollowersList } from "@/components/users/FollowersList";
import { FollowingList } from "@/components/users/FollowingList";
import { BlogList } from "@/components/blog/BlogList";
import { BlogCard } from "@/components/blog/BlogCard";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { followService } from "@/services/followService";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/utils/constant";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Users,
  UserCheck,
  BookOpen,
  Eye,
  Heart,
  MessageCircle,
  Loader2,
  AlertCircle,
  Github,
  Twitter,
  Linkedin,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/features/chat/chatStore";

export const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthContext();
  const { toast } = useToast();
  const { startConversation, openChat } = useChatStore();

  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("blogs");

  // Check if viewing own profile
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile, stats, and blogs in parallel
      const [userData, stats, followStatsData, blogsData] = await Promise.all([
        userService.getUserById(userId),
        userService.getUserStats(userId),
        followService.getFollowStats(userId),
        blogService.getUserBlogs(userId, { limit: 20, status: "published" }),
      ]);

      setUser(userData);
      setUserStats(stats);
      setFollowStats(followStatsData);
      setUserBlogs(blogsData.blogs || blogsData.data || []);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const handleFollowChange = (isFollowing) => {
    // Update follower count
    setFollowStats((prev) => ({
      ...prev,
      followersCount: isFollowing
        ? (prev?.followersCount || 0) + 1
        : Math.max(0, (prev?.followersCount || 0) - 1),
    }));
  };

  const handleSendMessage = async () => {
    try {
      // Create user object for chat service
      const chatUser = {
        id: user._id,
        name: getDisplayName(),
        username: user.username,
        avatar: user.avatar,
      };

      // Start conversation with this user
      await startConversation(chatUser);

      // Open chat panel
      openChat();

      toast({
        title: "Chat opened",
        description: `You can now send messages to ${getDisplayName()}`,
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

  // If viewing own profile, redirect to settings profile
  if (isOwnProfile) {
    navigate(ROUTES.PROFILE);
    return null;
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div>
                    <h1 className="text-3xl font-bold">{getDisplayName()}</h1>
                    <p className="text-xl text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>

                  {!isOwnProfile && (
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendMessage}
                        className="flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message</span>
                      </Button>
                      <FollowButton
                        userId={user._id}
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  )}
                </div>

                {/* Bio */}
                {user.bio && <p className="text-lg">{user.bio}</p>}

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <Link
                    to={`/users/${user._id}/followers`}
                    className="hover:text-foreground font-medium"
                  >
                    <span className="text-foreground font-bold">
                      {followStats?.followersCount || 0}
                    </span>{" "}
                    followers
                  </Link>
                  <Link
                    to={`/users/${user._id}/following`}
                    className="hover:text-foreground font-medium"
                  >
                    <span className="text-foreground font-bold">
                      {followStats?.followingCount || 0}
                    </span>{" "}
                    following
                  </Link>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-foreground font-bold">
                      {userStats?.blogs?.totalBlogs || 0}
                    </span>{" "}
                    blogs
                  </div>
                </div>

                {/* Social Links */}
                {user.socialLinks && (
                  <div className="flex flex-wrap gap-3">
                    {user.socialLinks.twitter && (
                      <a
                        href={user.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        <Twitter className="h-4 w-4 mr-1" />
                        Twitter
                      </a>
                    )}
                    {user.socialLinks.github && (
                      <a
                        href={user.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-700 hover:underline"
                      >
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </a>
                    )}
                    {user.socialLinks.linkedin && (
                      <a
                        href={user.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-700 hover:underline"
                      >
                        <Linkedin className="h-4 w-4 mr-1" />
                        LinkedIn
                      </a>
                    )}
                    {user.socialLinks.website && (
                      <a
                        href={user.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-green-600 hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blogs" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Blogs</span>
              <Badge variant="secondary" className="ml-1">
                {userStats?.blogs?.totalBlogs || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="followers"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Followers</span>
              <Badge variant="secondary" className="ml-1">
                {followStats?.followersCount || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex items-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Following</span>
              <Badge variant="secondary" className="ml-1">
                {followStats?.followingCount || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Blogs Tab */}
          <TabsContent value="blogs">
            {userBlogs.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blogs yet</h3>
                <p className="text-muted-foreground">
                  {user.username} hasn't published any blogs yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(userStats?.blogs?.totalViews || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Likes
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(userStats?.blogs?.totalLikes || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Comments
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(userStats?.comments?.totalComments || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers">
            <FollowersList userId={user._id} />
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <FollowingList userId={user._id} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default UserProfile;
