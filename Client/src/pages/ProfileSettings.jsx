import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import {
  User,
  Users,
  UserCheck,
  Mail,
  Calendar,
  Settings,
  Shield,
  BookOpen,
  TrendingUp,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Loader2,
  AlertCircle,
  Lock,
  Camera,
  Eye,
  EyeOff,
  MessageCircle,
  Bell,
  Save,
  RefreshCw,
  Star,
  Heart,
  UserPlus,
} from "lucide-react";
import { iconColors } from "@/utils/iconColors";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProfileSettings = () => {
  const { user, updateProfile, changePassword } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
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
    profileVisibility: "public",
    showEmail: false,
    showFollowers: true,
    showFollowing: true,
    allowMessages: true,
    allowFollow: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newFollowers: true,
    blogLikes: true,
    blogComments: true,
    directMessages: true,
    weeklyDigest: true,
    marketingEmails: false,
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

      setPrivacySettings({
        profileVisibility: user.profileVisibility || "public",
        showEmail: user.privacySettings?.showEmail || false,
        showFollowers: user.privacySettings?.showFollowers !== false,
        showFollowing: user.privacySettings?.showFollowing !== false,
        allowMessages: user.privacySettings?.allowMessages !== false,
        allowFollow: user.privacySettings?.allowFollow !== false,
      });

      setNotificationSettings({
        emailNotifications:
          user.notificationSettings?.emailNotifications !== false,
        pushNotifications:
          user.notificationSettings?.pushNotifications !== false,
        newFollowers: user.notificationSettings?.newFollowers !== false,
        blogLikes: user.notificationSettings?.blogLikes !== false,
        blogComments: user.notificationSettings?.blogComments !== false,
        directMessages: user.notificationSettings?.directMessages !== false,
        weeklyDigest: user.notificationSettings?.weeklyDigest !== false,
        marketingEmails: user.notificationSettings?.marketingEmails || false,
      });
    }
  }, [user]);

  // Load user statistics
  useEffect(() => {
    if (user?._id) {
      loadUserStats();
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
    } finally {
      setStatsLoading(false);
    }
  };

  const loadFollowStats = async () => {
    try {
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
      setFollowStats({ followersCount: 0, followingCount: 0 });
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
      setLoading(true);
      setError(null);

      await updateProfile(profileForm);

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
      setLoading(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      setLoading(true);

      await updateProfile({
        ...profileForm,
        notificationSettings,
      });

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0) || "";
    const lastInitial = lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
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
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
            <Settings className={`h-8 w-8 mr-3 ${iconColors.info}`} />
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, privacy, and notification preferences
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Profile Image */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={profileForm.avatar}
                    alt="Profile picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {getInitials(profileForm.firstName, profileForm.lastName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-background shadow-lg border-2 hover:scale-105 transition-transform"
                >
                  <Camera className={`h-4 w-4 ${iconColors.info}`} />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profileForm.firstName || profileForm.lastName
                      ? `${profileForm.firstName} ${profileForm.lastName}`.trim()
                      : user.username}
                  </h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.role || "User"}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto md:mx-0">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {statsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        userStats?.blogs?.totalBlogs || 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Blogs</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {statsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        userStats?.stories?.totalStories || 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Stories</div>
                  </div>
                  <button
                    className="text-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/${user._id}/followers`)}
                  >
                    <div className="text-lg font-bold text-primary">
                      {statsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        followStats?.followersCount || 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Followers
                    </div>
                  </button>
                  <button
                    className="text-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/users/${user._id}/following`)}
                  >
                    <div className="text-lg font-bold text-primary">
                      {statsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        followStats?.followingCount || 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Following
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Enter your first name"
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
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="resize-none h-24"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {profileForm.bio.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label>Email Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Twitter className="h-4 w-4 text-blue-500" />
                    <Input
                      placeholder="Twitter profile URL"
                      value={profileForm.socialLinks.twitter}
                      onChange={(e) =>
                        handleInputChange("socialLinks.twitter", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Github className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <Input
                      placeholder="GitHub profile URL"
                      value={profileForm.socialLinks.github}
                      onChange={(e) =>
                        handleInputChange("socialLinks.github", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    <Input
                      placeholder="LinkedIn profile URL"
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
                    <Globe className="h-4 w-4 text-green-600" />
                    <Input
                      placeholder="Personal website URL"
                      value={profileForm.socialLinks.website}
                      onChange={(e) =>
                        handleInputChange("socialLinks.website", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Social Links
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Privacy Settings
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
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        profileVisibility: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Public</div>
                            <div className="text-xs text-muted-foreground">
                              Anyone can see your profile
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center space-x-2">
                          <EyeOff className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Private</div>
                            <div className="text-xs text-muted-foreground">
                              Only followers can see your posts
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Privacy Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Email Address</div>
                      <div className="text-sm text-muted-foreground">
                        Display your email on your public profile
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showEmail: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Followers List</div>
                      <div className="text-sm text-muted-foreground">
                        Allow others to see who follows you
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showFollowers}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showFollowers: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show Following List</div>
                      <div className="text-sm text-muted-foreground">
                        Allow others to see who you follow
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showFollowing}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showFollowing: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Allow Direct Messages</div>
                      <div className="text-sm text-muted-foreground">
                        Let others send you direct messages
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allowMessages: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Allow Follow Requests</div>
                      <div className="text-sm text-muted-foreground">
                        Allow others to follow you
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.allowFollow}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allowFollow: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSavePrivacySettings} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          emailNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          pushNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">New Followers</div>
                      <div className="text-sm text-muted-foreground">
                        When someone follows you
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.newFollowers}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          newFollowers: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Blog Likes</div>
                      <div className="text-sm text-muted-foreground">
                        When someone likes your blog posts
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.blogLikes}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          blogLikes: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Blog Comments</div>
                      <div className="text-sm text-muted-foreground">
                        When someone comments on your blogs
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.blogComments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          blogComments: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Direct Messages</div>
                      <div className="text-sm text-muted-foreground">
                        When you receive a direct message
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.directMessages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          directMessages: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly Digest</div>
                      <div className="text-sm text-muted-foreground">
                        Weekly summary of your activity
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          weeklyDigest: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">
                        Product updates and promotional content
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          marketingEmails: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your account password for better security
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
                          Enter your current password and choose a new secure
                          password.
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
                          variant="destructive"
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

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Account Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Email Verification:</span>
                      <Badge
                        variant={
                          user.isEmailVerified ? "default" : "destructive"
                        }
                      >
                        {user.isEmailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Account Status:</span>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Member Since:</span>
                      <span className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default ProfileSettings;
