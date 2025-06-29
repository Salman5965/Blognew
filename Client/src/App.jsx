import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrivateRoute } from "@/components/shared/PrivateRoute";
import { ROUTES } from "@/utils/constant";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatPanel } from "@/components/chat/ChatPanel";

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
const Profile = React.lazy(() => import("./pages/Profile"));
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
const Analytics = React.lazy(() =>
  import("./pages/Analytics").then((module) => ({ default: module.Analytics })),
);
const FollowersPage = React.lazy(() => import("./pages/FollowersPage"));
const FollowingPage = React.lazy(() => import("./pages/FollowingPage"));

const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Messages = React.lazy(() => import("./pages/Messages"));
const Stories = React.lazy(() => import("./pages/Stories"));
const CreateStory = React.lazy(() => import("./pages/CreateStory"));
const Community = React.lazy(() => import("./pages/Community"));
const CommunityForum = React.lazy(() => import("./pages/CommunityForum"));
const Explore = React.lazy(() => import("./pages/Explore"));

// Loading component for suspense
const PageLoader = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
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
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path={ROUTES.HOME} element={<Home />} />
                    <Route
                      path={`${ROUTES.BLOG_DETAILS}/:slug`}
                      element={<BlogDetails />}
                    />
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    <Route path={ROUTES.HELP} element={<Help />} />

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

                    {/* Messages */}
                    <Route
                      path="/messages"
                      element={
                        <PrivateRoute>
                          <Messages />
                        </PrivateRoute>
                      }
                    />

                    {/* Stories */}
                    <Route
                      path="/stories"
                      element={
                        <PrivateRoute>
                          <Stories />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/stories/create"
                      element={
                        <PrivateRoute>
                          <CreateStory />
                        </PrivateRoute>
                      }
                    />

                    {/* Community Pages */}
                    <Route
                      path="/community"
                      element={
                        <PrivateRoute>
                          <Community />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/community/forum"
                      element={
                        <PrivateRoute>
                          <CommunityForum />
                        </PrivateRoute>
                      }
                    />

                    {/* Explore Page */}
                    <Route
                      path={ROUTES.EXPLORE}
                      element={
                        <PrivateRoute>
                          <Explore />
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
