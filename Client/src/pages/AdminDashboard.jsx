import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Shield,
  Crown,
  Bot,
  BarChart3,
  Users,
  Settings,
  FileText,
  MessageCircle,
  Bell,
  Activity,
  Lock,
  Database,
  Zap,
  Globe,
  ChevronRight,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login", { replace: true });
      return;
    }

    if (user && user.role !== "admin" && !user.isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const adminTools = [
    {
      title: "AI Content Manager",
      description: "Manage automated content generation and publishing",
      icon: Bot,
      path: "/dashboard/ai-content",
      color: "purple",
      badge: "AI Powered",
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      path: "/admin/users",
      color: "blue",
      badge: "Core",
    },
    {
      title: "Content Analytics",
      description: "View detailed analytics for all content",
      icon: BarChart3,
      path: "/dashboard/analytics",
      color: "green",
      badge: "Analytics",
    },
    {
      title: "Daily Drip Management",
      description: "Manage daily inspiration content",
      icon: Crown,
      path: "/daily-drip",
      color: "yellow",
      badge: "Content",
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: Settings,
      path: "/admin/settings",
      color: "gray",
      badge: "System",
    },
    {
      title: "Content Moderation",
      description: "Review and moderate user-generated content",
      icon: FileText,
      path: "/admin/moderation",
      color: "red",
      badge: "Moderation",
    },
    {
      title: "Notifications Center",
      description: "Manage system notifications and alerts",
      icon: Bell,
      path: "/admin/notifications",
      color: "indigo",
      badge: "Communication",
    },
    {
      title: "Activity Monitor",
      description: "Monitor system activity and user behavior",
      icon: Activity,
      path: "/admin/activity",
      color: "orange",
      badge: "Monitoring",
    },
  ];

  const quickStats = [
    {
      label: "AI Content Generated",
      value: "1,234",
      icon: Bot,
      color: "purple",
    },
    { label: "Total Users", value: "5,678", icon: Users, color: "blue" },
    {
      label: "Published Articles",
      value: "2,345",
      icon: FileText,
      color: "green",
    },
    {
      label: "System Health",
      value: "99.9%",
      icon: Activity,
      color: "emerald",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple:
        "border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30",
      blue: "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30",
      green:
        "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30",
      yellow:
        "border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
      gray: "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/30",
      red: "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30",
      indigo:
        "border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
      orange:
        "border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/30",
      emerald:
        "border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
    };
    return colors[color] || colors.gray;
  };

  const getIconColor = (color) => {
    const colors = {
      purple: "text-purple-600 dark:text-purple-400",
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      gray: "text-gray-600 dark:text-gray-400",
      red: "text-red-600 dark:text-red-400",
      indigo: "text-indigo-600 dark:text-indigo-400",
      orange: "text-orange-600 dark:text-orange-400",
      emerald: "text-emerald-600 dark:text-emerald-400",
    };
    return colors[color] || colors.gray;
  };

  if (!isAuthenticated || (user && user.role !== "admin" && !user.isAdmin)) {
    return null;
  }

  return (
    <PageWrapper className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Administrator Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
            >
              <Crown className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
            <Badge variant="outline" className="text-green-600">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${getIconColor(stat.color)}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Tools Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Administration Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 ${getColorClasses(tool.color)} group`}
                  onClick={() => navigate(tool.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${tool.color}-500 to-${tool.color}-600 flex items-center justify-center`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {tool.title}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {tool.badge}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate("/dashboard/ai-content")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Manage AI Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/daily-drip")}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Daily Drip
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/analytics")}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="mt-8">
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                    Administrator Access Notice
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You are accessing the administrator dashboard. All actions
                    are logged and monitored. Please ensure you follow security
                    best practices and only perform authorized operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
