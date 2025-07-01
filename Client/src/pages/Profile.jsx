import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { followService } from "@/services/followService";
import { FollowSuggestions } from "@/components/users/FollowSuggestions";
import {
  User,
  Users,
  UserCheck,
  Mail,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit3,
  Save,
  X,
  Eye,
  Heart,
  MessageCircle,
  Settings,
  Shield,
  BookOpen,
  TrendingUp,
  Award,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Loader2,
  AlertCircle,
  Lock,
  Camera,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [followStats, setFollowStats] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    avatar: "",
    socialLinks: {
      twitter: "",
      github: "",
      linkedin: "",
      website: "",
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, private
    showEmail: false,
    showFollowers: true,
    showFollowing: true,
    allowMessages: true,
    allowFollow: true,
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "",
          github: user.socialLinks?.github || "",
          linkedin: user.socialLinks?.linkedin || "",
          website: user.socialLinks?.website || "",
        },
      });

      // Load privacy settings
      setPrivacySettings({
        profileVisibility: user.profileVisibility || "public",
        showEmail: user.privacySettings?.showEmail || false,
        showFollowers: user.privacySettings?.showFollowers !== false,
        showFollowing: user.privacySettings?.showFollowing !== false,
        allowMessages: user.privacySettings?.allowMessages !== false,
        allowFollow: user.privacySettings?.allowFollow !== false,
      });
    }
  }, [user]);

  // Load user statistics and recent blogs
  useEffect(() => {
    if (user?._id) {
      loadUserStats();
      loadRecentBlogs();
      loadFollowStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await userService.getUserStats(user._id);
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading user stats:", error);
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadFollowStats = async () => {
    try {
      // Get followers and following counts from backend
      const [followersResponse, followingResponse] = await Promise.all([
        userService.getFollowers(user._id, { page: 1, limit: 1 }),
        userService.getFollowing(user._id, { page: 1, limit: 1 }),
      ]);

      setFollowStats({
        followersCount: followersResponse.pagination?.totalFollowers || 0,
        followingCount: followingResponse.pagination?.totalFollowing || 0,
      });
    } catch (error) {
      console.error("Error loading follow stats:", error);
      // Set fallback values
      setFollowStats({
        followersCount: 0,
        followingCount: 0,
      });
    }
  };

  const loadRecentBlogs = async () => {
    try {
      const response = await blogService.getMyBlogs({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setRecentBlogs(response.blogs || response.data || []);
    } catch (error) {
      console.error("Error loading recent blogs:", error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfileForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await updateProfile(profileForm);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      setIsLoading(true);

      // Update profile with privacy settings
      await updateProfile({
        ...profileForm,
        profileVisibility: privacySettings.profileVisibility,
        privacySettings: {
          showEmail: privacySettings.showEmail,
          showFollowers: privacySettings.showFollowers,
          showFollowing: privacySettings.showFollowing,
          allowMessages: privacySettings.allowMessages,
          allowFollow: privacySettings.allowFollow,
        },
      });

      toast({
        title: "Success",
        description: "Privacy settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial =
      firstName && typeof firstName === "string" && firstName.length > 0
        ? firstName.charAt(0)
        : "";
    const lastInitial =
      lastName && typeof lastName === "string" && lastName.length > 0
        ? lastName.charAt(0)
        : "";

    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || "U";
  };

  if (!user) {
    return (
      <PageWrapper className="py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profileForm.avatar} alt={user.username} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(
                        profileForm.firstName,
                        profileForm.lastName,
                      ) || user.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    {user.role || "User"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileForm.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileForm.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              placeholder="Last name"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-3xl font-bold">
                          {profileForm.firstName || profileForm.lastName
                            ? `${profileForm.firstName} ${profileForm.lastName}`.trim()
                            : user.username}
                        </h1>
                        <p className="text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          size="sm"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>

                  {isEditing ? (
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Tell us about yourself..."
                        className="w-full p-2 border rounded-md resize-none h-20"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {profileForm.bio.length}/500 characters
                      </p>
                    </div>
                  ) : (
                    profileForm.bio && (
                      <p className="text-sm">{profileForm.bio}</p>
                    )
                  )}

                  {/* Social Links */}
                  <div className="space-y-2">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label>Social Links</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Twitter className="h-4 w-4" />
                            <Input
                              placeholder="Twitter URL"
                              value={profileForm.socialLinks.twitter}
                              onChange={(e) =>
                                handleInputChange(
                                  "socialLinks.twitter",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Github className="h-4 w-4" />
                            <Input
                              placeholder="GitHub URL"
                              value={profileForm.socialLinks.github}
                              onChange={(e) =>
                                handleInputChange(
                                  "socialLinks.github",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Linkedin className="h-4 w-4" />
                            <Input
                              placeholder="LinkedIn URL"
                              value={profileForm.socialLinks.linkedin}
                              onChange={(e) =>
                                handleInputChange(
                                  "socialLinks.linkedin",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <Input
                              placeholder="Website URL"
                              value={profileForm.socialLinks.website}
                              onChange={(e) =>
                                handleInputChange(
                                  "socialLinks.website",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profileForm.socialLinks.twitter && (
                          <a
                            href={profileForm.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:underline"
                          >
                            <Twitter className="h-4 w-4 mr-1" />
                            Twitter
                          </a>
                        )}
                        {profileForm.socialLinks.github && (
                          <a
                            href={profileForm.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-gray-600 hover:underline"
                          >
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        )}
                        {profileForm.socialLinks.linkedin && (
                          <a
                            href={profileForm.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-700 hover:underline"
                          >
                            <Linkedin className="h-4 w-4 mr-1" />
                            LinkedIn
                          </a>
                        )}
                        {profileForm.socialLinks.website && (
                          <a
                            href={profileForm.socialLinks.website}
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="blogs">Recent Blogs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Blog Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Blogs
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        userStats?.blogs?.totalBlogs || 0
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        (userStats?.blogs?.totalViews || 0).toLocaleString()
                      )}
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
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        (userStats?.blogs?.totalLikes || 0).toLocaleString()
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Follow Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    (window.location.href = `/users/${user._id}/followers`)
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Followers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        (followStats?.followersCount || 0).toLocaleString()
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click to view followers
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    (window.location.href = `/users/${user._id}/following`)
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Following
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        (followStats?.followingCount || 0).toLocaleString()
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click to view following
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Follow Suggestions */}
              <FollowSuggestions limit={4} />
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Total Blogs:</span>
                        <span className="font-semibold">
                          {userStats?.blogs?.totalBlogs || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Views:</span>
                        <span className="font-semibold">
                          {(userStats?.blogs?.totalViews || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Likes:</span>
                        <span className="font-semibold">
                          {(userStats?.blogs?.totalLikes || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Read Time:</span>
                        <span className="font-semibold">
                          {Math.round(userStats?.blogs?.avgReadTime || 0)} min
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comment Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Total Comments:</span>
                        <span className="font-semibold">
                          {userStats?.comments?.totalComments || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comment Likes:</span>
                        <span className="font-semibold">
                          {userStats?.comments?.totalCommentLikes || 0}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Blogs Tab */}
          <TabsContent value="blogs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Blogs</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBlogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No blogs published yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentBlogs.map((blog) => (
                      <div
                        key={blog._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {blog.views || 0}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {blog.likeCount || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Privacy Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Visibility */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile and posts
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="public"
                          checked={
                            privacySettings.profileVisibility === "public"
                          }
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              profileVisibility: e.target.value,
                            }))
                          }
                          className="text-primary"
                        />
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-muted-foreground">
                            Anyone can see your profile and posts
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="private"
                          checked={
                            privacySettings.profileVisibility === "private"
                          }
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              profileVisibility: e.target.value,
                            }))
                          }
                          className="text-primary"
                        />
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-muted-foreground">
                            Only your followers can see your posts
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Profile Information</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose what information to display on your profile
                      </p>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium">Show Email</div>
                          <div className="text-sm text-muted-foreground">
                            Display your email address on your profile
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              showEmail: e.target.checked,
                            }))
                          }
                          className="scale-125"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium">Show Followers</div>
                          <div className="text-sm text-muted-foreground">
                            Display your followers list publicly
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showFollowers}
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              showFollowers: e.target.checked,
                            }))
                          }
                          className="scale-125"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium">Show Following</div>
                          <div className="text-sm text-muted-foreground">
                            Display who you follow publicly
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showFollowing}
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              showFollowing: e.target.checked,
                            }))
                          }
                          className="scale-125"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Interaction Settings */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Interaction Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Control how others can interact with you
                      </p>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium">Allow Messages</div>
                          <div className="text-sm text-muted-foreground">
                            Let others send you direct messages
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.allowMessages}
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              allowMessages: e.target.checked,
                            }))
                          }
                          className="scale-125"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium">
                            Allow Follow Requests
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Allow others to follow you
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.allowFollow}
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              allowFollow: e.target.checked,
                            }))
                          }
                          className="scale-125"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSavePrivacySettings}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Save Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your account password
                      </p>
                    </div>
                    <Dialog
                      open={isPasswordDialogOpen}
                      onOpenChange={setIsPasswordDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="currentPassword">
                              Current Password
                            </Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  currentPassword: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsPasswordDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleChangePassword}
                            disabled={passwordLoading}
                          >
                            {passwordLoading && (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Change Password
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default Profile;
