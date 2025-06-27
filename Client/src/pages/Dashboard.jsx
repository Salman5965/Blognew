// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { PageWrapper } from "@/components/layout/PageWrapper";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { userService } from "@/services/userService";
// import { blogService } from "@/services/blogService";
// import {
//   PlusCircle,
//   Edit3,
//   Eye,
//   Heart,
//   MessageCircle,
//   Users,
//   TrendingUp,
//   Calendar,
//   Settings,
//   BarChart3,
//   FileText,
//   Clock,
//   Loader2,
//   AlertCircle,
//   Globe,
//   BookOpen,
//   ExternalLink,
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export const Dashboard = () => {
//   const navigate = useNavigate();
//   const { user } = useAuthContext();
//   const { toast } = useToast();

//   // State management
//   const [selectedPeriod, setSelectedPeriod] = useState("7d");
//   const [userStats, setUserStats] = useState(null);
//   const [recentBlogs, setRecentBlogs] = useState([]);
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Load dashboard data
//   useEffect(() => {
//     if (user?._id) {
//       loadDashboardData();
//     }
//   }, [user, selectedPeriod]);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Load user statistics
//       const stats = await userService.getUserStats(user._id);
//       setUserStats(stats);

//       // Load recent blogs
//       const blogsResponse = await blogService.getMyBlogs({
//         limit: 5,
//         sortBy: "createdAt",
//         sortOrder: "desc",
//       });
//       setRecentBlogs(blogsResponse.blogs || blogsResponse.data || []);

//       // Mock recent activity (you can implement this endpoint in the backend)
//       const activities = generateMockActivity(stats || {});
//       setRecentActivity(activities);
//     } catch (error) {
//       console.error("Error loading dashboard data:", error);
//       setError(error.message);
//       toast({
//         title: "Error",
//         description: "Failed to load dashboard data",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateMockActivity = (stats = {}) => {
//     const activities = [];

//     if (stats?.blogs?.totalBlogs > 0) {
//       activities.push({
//         id: 1,
//         type: "blog_published",
//         message: "Blog published successfully",
//         time: "2 hours ago",
//         color: "bg-green-500",
//       });
//     }

//     if (stats?.blogs?.totalViews > 0) {
//       activities.push({
//         id: 2,
//         type: "views",
//         message: `${Math.round(stats.blogs.totalViews * 0.1)} new views today`,
//         time: "4 hours ago",
//         color: "bg-blue-500",
//       });
//     }

//     if (stats?.blogs?.totalLikes > 0) {
//       activities.push({
//         id: 3,
//         type: "likes",
//         message: `${Math.round(stats.blogs.totalLikes * 0.05)} new likes`,
//         time: "6 hours ago",
//         color: "bg-red-500",
//       });
//     }

//     // Add default activity if no stats available
//     if (activities.length === 0) {
//       activities.push({
//         id: 1,
//         type: "welcome",
//         message: "Welcome to your dashboard!",
//         time: "Just now",
//         color: "bg-blue-500",
//       });
//     }

//     return activities;
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "published":
//         return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
//       case "draft":
//         return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
//       default:
//         return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
//     }
//   };

//   const StatCard = ({
//     icon: Icon,
//     title,
//     value,
//     change,
//     color = "blue",
//     loading = false,
//   }) => (
//     <Card className="hover:shadow-md transition-shadow">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">{title}</CardTitle>
//         <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">
//           {loading ? (
//             <Loader2 className="h-6 w-6 animate-spin" />
//           ) : (
//             value?.toLocaleString() || 0
//           )}
//         </div>
//         {change !== undefined && !loading && (
//           <p
//             className={`text-xs mt-1 ${
//               change >= 0
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }`}
//           >
//             {change >= 0 ? "+" : ""}
//             {change}% from last period
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );

//   const BlogRow = ({ blog }) => (
//     <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
//       <div className="flex-1">
//         <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
//           {blog.title}
//         </h3>
//         <div className="flex items-center space-x-4 mt-1">
//           <Badge className={getStatusColor(blog.status)}>{blog.status}</Badge>
//           <span className="text-sm text-gray-500 dark:text-gray-400">
//             {formatDate(blog.publishedAt || blog.createdAt)}
//           </span>
//         </div>
//       </div>
//       <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
//         <div className="flex items-center space-x-1">
//           <Eye className="h-4 w-4" />
//           <span>{blog.views || 0}</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <Heart className="h-4 w-4" />
//           <span>{blog.likeCount || blog.likes?.length || 0}</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <MessageCircle className="h-4 w-4" />
//           <span>{blog.commentsCount || 0}</span>
//         </div>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => navigate(`/edit/${blog._id}`)}
//         >
//           <Edit3 className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );

//   const QuickActionButton = ({
//     icon: Icon,
//     label,
//     onClick,
//     color = "blue",
//   }) => (
//     <Button
//       variant="ghost"
//       className="w-full justify-start space-x-3 p-3 h-auto"
//       onClick={onClick}
//     >
//       <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
//       <span className="font-medium">{label}</span>
//     </Button>
//   );

//   if (loading && !userStats) {
//     return (
//       <PageWrapper className="py-8">
//         <div className="flex justify-center items-center min-h-[400px]">
//           <Loader2 className="h-8 w-8 animate-spin" />
//         </div>
//       </PageWrapper>
//     );
//   }

//   if (error && !userStats) {
//     return (
//       <PageWrapper className="py-8">
//         <div className="max-w-2xl mx-auto">
//           <div className="text-center">
//             <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
//             <p className="text-muted-foreground mb-4">{error}</p>
//             <Button onClick={loadDashboardData}>Try Again</Button>
//           </div>
//         </div>
//       </PageWrapper>
//     );
//   }

//   return (
//     <PageWrapper className="py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               Welcome back, {user?.firstName || user?.username}!
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Here's what's happening with your blog.
//             </p>
//           </div>
//           <div className="flex items-center space-x-3 mt-4 sm:mt-0">
//             <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//               <SelectTrigger className="w-40">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="7d">Last 7 days</SelectItem>
//                 <SelectItem value="30d">Last 30 days</SelectItem>
//                 <SelectItem value="90d">Last 90 days</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard
//             icon={BookOpen}
//             title="Total Blogs"
//             value={userStats?.blogs?.totalBlogs}
//             change={12}
//             color="blue"
//             loading={loading}
//           />
//           <StatCard
//             icon={Eye}
//             title="Total Views"
//             value={userStats?.blogs?.totalViews}
//             change={8}
//             color="green"
//             loading={loading}
//           />
//           <StatCard
//             icon={Heart}
//             title="Total Likes"
//             value={userStats?.blogs?.totalLikes}
//             change={15}
//             color="red"
//             loading={loading}
//           />
//           <StatCard
//             icon={MessageCircle}
//             title="Comments"
//             value={userStats?.comments?.totalComments}
//             change={-3}
//             color="purple"
//             loading={loading}
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Recent Blogs */}
//           <div className="lg:col-span-2">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle>Recent Blogs</CardTitle>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => navigate("/dashboard/blogs")}
//                   >
//                     View all
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 {loading ? (
//                   <div className="flex justify-center py-8">
//                     <Loader2 className="h-6 w-6 animate-spin" />
//                   </div>
//                 ) : recentBlogs.length === 0 ? (
//                   <div className="text-center py-8">
//                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold mb-2">No blogs yet</h3>
//                     <p className="text-muted-foreground mb-4">
//                       Start creating your first blog post
//                     </p>
//                     <Button onClick={() => navigate("/create")}>
//                       <PlusCircle className="h-4 w-4 mr-2" />
//                       Create Blog
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-1">
//                     {recentBlogs.map((blog) => (
//                       <BlogRow key={blog._id} blog={blog} />
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Side Cards */}
//           <div className="space-y-6">
//             {/* Quick Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Quick Actions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-1">
//                 <QuickActionButton
//                   icon={PlusCircle}
//                   label="Create New Post"
//                   onClick={() => navigate("/create")}
//                   color="blue"
//                 />
//                 <QuickActionButton
//                   icon={BarChart3}
//                   label="View Analytics"
//                   onClick={() => navigate("/dashboard/analytics")}
//                   color="green"
//                 />
//                 <QuickActionButton
//                   icon={BookOpen}
//                   label="My Blogs"
//                   onClick={() => navigate("/dashboard/blogs")}
//                   color="purple"
//                 />
//                 <QuickActionButton
//                   icon={Settings}
//                   label="Profile Settings"
//                   onClick={() => navigate("/dashboard/profile")}
//                   color="gray"
//                 />
//               </CardContent>
//             </Card>

//             {/* Performance Overview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>This Week</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {loading ? (
//                   <div className="flex justify-center">
//                     <Loader2 className="h-6 w-6 animate-spin" />
//                   </div>
//                 ) : (
//                   <>
//                     <div className="space-y-2">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-muted-foreground">
//                           Views
//                         </span>
//                         <span className="font-semibold">
//                           {Math.round(
//                             (userStats?.blogs?.totalViews || 0) * 0.15,
//                           ).toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
//                         <div
//                           className="bg-blue-600 h-2 rounded-full"
//                           style={{ width: "72%" }}
//                         ></div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-muted-foreground">
//                           Engagement
//                         </span>
//                         <span className="font-semibold">
//                           {userStats?.blogs?.totalLikes > 0 ? "8.4%" : "0%"}
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
//                         <div
//                           className="bg-green-600 h-2 rounded-full"
//                           style={{
//                             width:
//                               userStats?.blogs?.totalLikes > 0 ? "84%" : "0%",
//                           }}
//                         ></div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-muted-foreground">
//                           New Comments
//                         </span>
//                         <span className="font-semibold">
//                           {Math.round(
//                             (userStats?.comments?.totalComments || 0) * 0.2,
//                           )}
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
//                         <div
//                           className="bg-purple-600 h-2 rounded-full"
//                           style={{ width: "46%" }}
//                         ></div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Recent Activity */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Recent Activity</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {loading ? (
//                   <div className="flex justify-center">
//                     <Loader2 className="h-6 w-6 animate-spin" />
//                   </div>
//                 ) : recentActivity.length === 0 ? (
//                   <p className="text-center text-muted-foreground py-4">
//                     No recent activity
//                   </p>
//                 ) : (
//                   <div className="space-y-3">
//                     {recentActivity.map((activity) => (
//                       <div
//                         key={activity.id}
//                         className="flex items-start space-x-3"
//                       >
//                         <div
//                           className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}
//                         ></div>
//                         <div className="flex-1">
//                           <p className="text-sm text-gray-900 dark:text-white">
//                             {activity.message}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             {activity.time}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </PageWrapper>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { ROUTES } from "@/utils/constant";
import {
  PlusCircle,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
  Globe,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [userStats, setUserStats] = useState(null);
  const [previousStats, setPreviousStats] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    if (user?._id) {
      loadDashboardData();
    }
  }, [user, selectedPeriod]);

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user statistics
      const stats = await userService.getUserStats(user._id);
      setUserStats(stats);

      // Generate mock previous period stats for comparison
      // In a real app, you'd fetch actual previous period data
      const mockPreviousStats = {
        blogs: {
          totalBlogs: Math.max(
            0,
            (stats?.blogs?.totalBlogs || 0) - Math.floor(Math.random() * 3),
          ),
          totalViews: Math.max(
            0,
            (stats?.blogs?.totalViews || 0) -
              Math.floor((stats?.blogs?.totalViews || 0) * 0.15),
          ),
          totalLikes: Math.max(
            0,
            (stats?.blogs?.totalLikes || 0) -
              Math.floor((stats?.blogs?.totalLikes || 0) * 0.2),
          ),
        },
        comments: {
          totalComments: Math.max(
            0,
            (stats?.comments?.totalComments || 0) -
              Math.floor((stats?.comments?.totalComments || 0) * 0.1),
          ),
        },
      };
      setPreviousStats(mockPreviousStats);

      // Load recent blogs
      const blogsResponse = await blogService.getMyBlogs({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setRecentBlogs(blogsResponse.blogs || blogsResponse.data || []);

      // Generate realistic activity based on actual stats
      const activities = generateMockActivity(stats || {});
      setRecentActivity(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivity = (stats = {}) => {
    const activities = [];
    const now = new Date();

    // Generate activity based on actual user stats
    if (stats?.blogs?.totalBlogs > 0) {
      if (stats.blogs.totalBlogs >= 1) {
        activities.push({
          id: 1,
          type: "blog_published",
          message: "New blog post published",
          time: "2 hours ago",
          color: "bg-green-500",
        });
      }
    }

    if (stats?.blogs?.totalViews > 0) {
      const dailyViews = Math.max(1, Math.round(stats.blogs.totalViews * 0.1));
      activities.push({
        id: 2,
        type: "views",
        message: `${dailyViews} new ${dailyViews === 1 ? "view" : "views"} today`,
        time: "4 hours ago",
        color: "bg-blue-500",
      });
    }

    if (stats?.blogs?.totalLikes > 0) {
      const newLikes = Math.max(1, Math.round(stats.blogs.totalLikes * 0.1));
      activities.push({
        id: 3,
        type: "likes",
        message: `${newLikes} new ${newLikes === 1 ? "like" : "likes"} received`,
        time: "6 hours ago",
        color: "bg-red-500",
      });
    }

    if (stats?.comments?.totalComments > 0) {
      const newComments = Math.max(
        1,
        Math.round(stats.comments.totalComments * 0.15),
      );
      activities.push({
        id: 4,
        type: "comments",
        message: `${newComments} new ${newComments === 1 ? "comment" : "comments"} received`,
        time: "8 hours ago",
        color: "bg-purple-500",
      });
    }

    // Add welcome message if no real activity
    if (activities.length === 0) {
      activities.push({
        id: 1,
        type: "welcome",
        message: "Welcome to your dashboard!",
        time: "Just now",
        color: "bg-blue-500",
      });
    }

    return activities.slice(0, 4); // Limit to 4 activities
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color = "blue",
    loading = false,
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            value?.toLocaleString() || 0
          )}
        </div>
        {change !== undefined && !loading && (
          <p
            className={`text-xs mt-1 ${
              change >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  const BlogRow = ({ blog }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
          {blog.title}
        </h3>
        <div className="flex items-center space-x-4 mt-1">
          <Badge className={getStatusColor(blog.status)}>{blog.status}</Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4" />
          <span>{blog.views || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Heart className="h-4 w-4" />
          <span>{blog.likeCount || blog.likes?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{blog.commentsCount || 0}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`${ROUTES.EDIT_BLOG}/${blog._id}`)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const QuickActionButton = ({
    icon: Icon,
    label,
    onClick,
    color = "blue",
  }) => (
    <Button
      variant="ghost"
      className="w-full justify-start space-x-3 p-3 h-auto"
      onClick={onClick}
    >
      <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
      <span className="font-medium">{label}</span>
    </Button>
  );

  if (loading && !userStats) {
    return (
      <PageWrapper className="py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error && !userStats) {
    return (
      <PageWrapper className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Try Again</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your blog.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Total Blogs"
            value={userStats?.blogs?.totalBlogs}
            change={calculatePercentageChange(
              userStats?.blogs?.totalBlogs || 0,
              previousStats?.blogs?.totalBlogs || 0,
            )}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={userStats?.blogs?.totalViews}
            change={calculatePercentageChange(
              userStats?.blogs?.totalViews || 0,
              previousStats?.blogs?.totalViews || 0,
            )}
            color="green"
            loading={loading}
          />
          <StatCard
            icon={Heart}
            title="Total Likes"
            value={userStats?.blogs?.totalLikes}
            change={calculatePercentageChange(
              userStats?.blogs?.totalLikes || 0,
              previousStats?.blogs?.totalLikes || 0,
            )}
            color="red"
            loading={loading}
          />
          <StatCard
            icon={MessageCircle}
            title="Comments"
            value={userStats?.comments?.totalComments}
            change={calculatePercentageChange(
              userStats?.comments?.totalComments || 0,
              previousStats?.comments?.totalComments || 0,
            )}
            color="purple"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Blogs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Blogs</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(ROUTES.MY_BLOGS)}
                  >
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : recentBlogs.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No blogs yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating your first blog post
                    </p>
                    <Button onClick={() => navigate("/create")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Blog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentBlogs.map((blog) => (
                      <BlogRow key={blog._id} blog={blog} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side Cards */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <QuickActionButton
                  icon={PlusCircle}
                  label="Create New Post"
                  onClick={() => navigate(ROUTES.CREATE_BLOG)}
                  color="blue"
                />
                <QuickActionButton
                  icon={BarChart3}
                  label="View Analytics"
                  onClick={() => navigate("/dashboard/analytics")}
                  color="green"
                />
                <QuickActionButton
                  icon={BookOpen}
                  label="My Blogs"
                  onClick={() => navigate(ROUTES.MY_BLOGS)}
                  color="purple"
                />
                <QuickActionButton
                  icon={Settings}
                  label="Profile Settings"
                  onClick={() => navigate(ROUTES.PROFILE)}
                  color="gray"
                />
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {(() => {
                      const weeklyViews = Math.max(
                        0,
                        Math.round((userStats?.blogs?.totalViews || 0) * 0.2),
                      );
                      const totalViews = userStats?.blogs?.totalViews || 0;
                      const viewsProgress =
                        totalViews > 0
                          ? Math.min(
                              100,
                              (weeklyViews / Math.max(totalViews * 0.3, 1)) *
                                100,
                            )
                          : 0;

                      const totalInteractions =
                        (userStats?.blogs?.totalLikes || 0) +
                        (userStats?.comments?.totalComments || 0);
                      const engagementRate =
                        totalViews > 0
                          ? ((totalInteractions / totalViews) * 100).toFixed(1)
                          : "0.0";
                      const engagementProgress = Math.min(
                        100,
                        parseFloat(engagementRate) * 10,
                      );

                      const weeklyComments = Math.max(
                        0,
                        Math.round(
                          (userStats?.comments?.totalComments || 0) * 0.3,
                        ),
                      );
                      const totalComments =
                        userStats?.comments?.totalComments || 0;
                      const commentsProgress =
                        totalComments > 0
                          ? Math.min(
                              100,
                              (weeklyComments /
                                Math.max(totalComments * 0.4, 1)) *
                                100,
                            )
                          : 0;

                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Views
                              </span>
                              <span className="font-semibold">
                                {weeklyViews.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(5, viewsProgress)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Engagement
                              </span>
                              <span className="font-semibold">
                                {engagementRate}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(2, engagementProgress)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                New Comments
                              </span>
                              <span className="font-semibold">
                                {weeklyComments}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(3, commentsProgress)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
