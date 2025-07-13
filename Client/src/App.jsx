import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrivateRoute } from "@/components/shared/PrivateRoute";
import NotificationAlert from "@/components/notifications/NotificationAlert";
import ChatPanel from "@/components/chat/ChatPanel";
import { ROUTES } from "@/utils/constant";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy import pages for code splitting
const Home = React.lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home })),
);
const BlogDetails = React.lazy(() =>
  import("./pages/BlogDetails").then((module) => ({
    default: module.BlogDetails,
  })),
);
const Login = React.lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const Register = React.lazy(() => import("./pages/Register"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const CreateBlog = React.lazy(() =>
  import("./pages/CreateBlog").then((module) => ({
    default: module.CreateBlog,
  })),
);
const Dashboard = React.lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const MyBlogs = React.lazy(() =>
  import("./pages/MyBlogs").then((module) => ({ default: module.MyBlogs })),
);
const MyPosts = React.lazy(() =>
  import("./pages/MyPosts").then((module) => ({ default: module.MyPosts })),
);
const Profile = React.lazy(() => import("./pages/ProfileSettings"));
const EditBlog = React.lazy(() =>
  import("./pages/EditBlog").then((module) => ({ default: module.EditBlog })),
);
const NotFound = React.lazy(() => import("./pages/NotFound"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Cookies = React.lazy(() => import("./pages/Cookies"));
const Gdpr = React.lazy(() => import("./pages/Gdpr"));
const Help = React.lazy(() => import("./pages/Help"));
const Feed = React.lazy(() => import("./pages/Feed"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const BlogAnalytics = React.lazy(() => import("./pages/BlogAnalytics"));
const StoryAnalytics = React.lazy(() => import("./pages/StoryAnalytics"));
const FollowersPage = React.lazy(() => import("./pages/FollowersPage"));
const FollowingPage = React.lazy(() => import("./pages/FollowingPage"));
const AIContentManager = React.lazy(() => import("./pages/AIContentManager"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminRegister = React.lazy(() => import("./pages/AdminRegister"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));

const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const CommunityForum = React.lazy(() => import("./pages/CommunityForum"));
const Community = React.lazy(() => import("./pages/Community"));
const DailyDrip = React.lazy(() => import("./pages/DailyDrip"));
const Stories = React.lazy(() => import("./pages/Stories"));
const StoryDetails = React.lazy(() => import("./pages/StoryDetails"));
const CreateStory = React.lazy(() => import("./pages/CreateStory"));
const Explore = React.lazy(() => import("./pages/Explore"));
const Messages = React.lazy(() => import("./pages/Messages"));
const NotificationDebug = React.lazy(
  () => import("./components/notifications/NotificationDebug"),
);

// Simplified, fast loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <NotificationAlert />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path={ROUTES.HOME} element={<Home />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route
                      path={`${ROUTES.BLOG_DETAILS}/:slug`}
                      element={<BlogDetails />}
                    />
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    <Route
                      path={ROUTES.FORGOT_PASSWORD}
                      element={<ForgotPassword />}
                    />
                    <Route
                      path={ROUTES.RESET_PASSWORD}
                      element={<ResetPassword />}
                    />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <PrivateRoute>
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route path={ROUTES.HELP} element={<Help />} />

                    {/* Public browsing routes */}
                    <Route path="/stories" element={<Stories />} />
                    <Route path="/explore" element={<Explore />} />

                    {/* Static Pages */}
                    <Route path={ROUTES.ABOUT} element={<About />} />
                    <Route path={ROUTES.CONTACT} element={<Contact />} />
                    <Route path={ROUTES.PRIVACY} element={<Privacy />} />
                    <Route path={ROUTES.TERMS} element={<Terms />} />
                    <Route path={ROUTES.COOKIES} element={<Cookies />} />
                    <Route path={ROUTES.GDPR} element={<Gdpr />} />

                    {/* Protected Routes */}
                    <Route
                      path={ROUTES.FEED}
                      element={
                        <PrivateRoute>
                          <Feed />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.CREATE_BLOG}
                      element={
                        <PrivateRoute>
                          <CreateBlog />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={`${ROUTES.EDIT_BLOG}/:id`}
                      element={
                        <PrivateRoute>
                          <EditBlog />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.DASHBOARD}
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.MY_BLOGS}
                      element={
                        <PrivateRoute>
                          <MyBlogs />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.PROFILE}
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/analytics"
                      element={
                        <PrivateRoute>
                          <Analytics />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/blog-analytics"
                      element={
                        <PrivateRoute>
                          <BlogAnalytics />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/story-analytics"
                      element={
                        <PrivateRoute>
                          <StoryAnalytics />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/ai-content"
                      element={
                        <PrivateRoute>
                          <AIContentManager />
                        </PrivateRoute>
                      }
                    />

                    {/* Public route for story details */}
                    <Route path="/stories/:id" element={<StoryDetails />} />

                    {/* Additional protected routes */}
                    <Route
                      path={ROUTES.MY_POSTS}
                      element={
                        <PrivateRoute>
                          <MyPosts />
                        </PrivateRoute>
                      }
                    />

                    {/* User profile pages */}
                    <Route
                      path="/users/:userId"
                      element={
                        <PrivateRoute>
                          <UserProfile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/users/:userId/followers"
                      element={
                        <PrivateRoute>
                          <FollowersPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/users/:userId/following"
                      element={
                        <PrivateRoute>
                          <FollowingPage />
                        </PrivateRoute>
                      }
                    />

                    {/* Notifications */}
                    <Route
                      path="/notifications"
                      element={
                        <PrivateRoute>
                          <Notifications />
                        </PrivateRoute>
                      }
                    />

                    {/* Notification Debug (Development) */}
                    <Route
                      path="/debug/notifications"
                      element={
                        <PrivateRoute>
                          <NotificationDebug />
                        </PrivateRoute>
                      }
                    />

                    {/* Community Forum */}
                    <Route
                      path="/forum"
                      element={
                        <PrivateRoute>
                          <CommunityForum />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/community"
                      element={
                        <PrivateRoute>
                          <Community />
                        </PrivateRoute>
                      }
                    />

                    {/* Daily Drip */}
                    <Route path="/daily-drip" element={<DailyDrip />} />

                    {/* Story creation - protected */}
                    <Route
                      path="/stories/create"
                      element={
                        <PrivateRoute>
                          <CreateStory />
                        </PrivateRoute>
                      }
                    />

                    {/* Messages - protected */}
                    <Route
                      path="/messages"
                      element={
                        <PrivateRoute>
                          <Messages />
                        </PrivateRoute>
                      }
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>

            {/* Chat Panel - Available globally for authenticated users */}
            <ChatPanel />
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
