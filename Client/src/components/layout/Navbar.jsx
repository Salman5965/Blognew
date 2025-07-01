import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { ROUTES, DEBOUNCE_DELAY } from "@/utils/constant";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  Edit3,
  BarChart3,
  FileText,
  MessageCircle,
  Users,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [filters, setFilters] = React.useState({
    search: "",
    category: "",
    sortBy: "latest",
  });
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  // Fetch unread counts when user is logged in
  React.useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        // For now, simulate with random values
        setUnreadNotifications(Math.floor(Math.random() * 5));
        setUnreadMessages(Math.floor(Math.random() * 3));
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const [debouncedSearch] = useDebouncedCallback(async (value) => {
    setFilters((prev) => ({ ...prev, search: value }));

    if (value.trim()) {
      setIsSearching(true);
      setShowSearchResults(true);

      try {
        // Import exploreService dynamically to avoid circular dependencies
        const { default: exploreService } = await import(
          "@/services/exploreService"
        );

        // Search across all content types
        const results = await exploreService.searchContent(value, "all", {
          limit: 8,
        });

        // Combine and format results
        const combinedResults = [
          ...(results.results?.users || [])
            .slice(0, 3)
            .map((user) => ({ ...user, type: "user" })),
          ...(results.results?.blogs || [])
            .slice(0, 3)
            .map((blog) => ({ ...blog, type: "blog" })),
          ...(results.results?.stories || [])
            .slice(0, 2)
            .map((story) => ({ ...story, type: "story" })),
        ];

        setSearchResults(combinedResults);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, DEBOUNCE_DELAY);

  const handleCreatePost = () => {
    navigate(ROUTES.CREATE_BLOG);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
              <span
                className="font-bold text-xl"
                style={{ fontFamily: "Pacifico, cursive" }}
              >
                SilentVoice
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to={ROUTES.FEED}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feed
                </Link>
                <Link
                  to="/explore"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore
                </Link>
                <Link
                  to="/stories"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Stories
                </Link>
                <Link
                  to="/daily-drip"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  DailyDrip
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search everything..."
                className="pl-10"
                defaultValue={filters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                onFocus={() => filters.search && setShowSearchResults(true)}
                onBlur={() =>
                  setTimeout(() => setShowSearchResults(false), 200)
                }
              />

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Searching...
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id || result._id}-${index}`}
                          className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setShowSearchResults(false);
                            switch (result.type) {
                              case "user":
                                navigate(`/users/${result.id || result._id}`);
                                break;
                              case "blog":
                                navigate(`/blog/${result.id || result._id}`);
                                break;
                              case "story":
                                navigate(`/stories/${result.id || result._id}`);
                                break;
                              default:
                                navigate("/explore");
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {result.type === "user" ? (
                              <>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {result.firstName || result.lastName
                                      ? `${result.firstName || ""} ${result.lastName || ""}`.trim()
                                      : result.username}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    @{result.username} • User
                                  </p>
                                </div>
                              </>
                            ) : result.type === "blog" ? (
                              <>
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    By{" "}
                                    {result.author?.firstName ||
                                      result.author?.username ||
                                      "Unknown"}{" "}
                                    • Blog
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {result.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    By{" "}
                                    {result.author?.firstName ||
                                      result.author?.username ||
                                      "Unknown"}{" "}
                                    • Story
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="px-4 py-3 border-t">
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => {
                            setShowSearchResults(false);
                            navigate(
                              `/explore?q=${encodeURIComponent(filters.search)}`,
                            );
                          }}
                        >
                          View all results for "{filters.search}"
                        </button>
                      </div>
                    </div>
                  ) : filters.search ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p className="text-sm">
                        No results found for "{filters.search}"
                      </p>
                      <button
                        className="text-sm text-primary hover:underline mt-1"
                        onClick={() => {
                          setShowSearchResults(false);
                          navigate(
                            `/explore?q=${encodeURIComponent(filters.search)}`,
                          );
                        }}
                      >
                        Search in Explore
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Create Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreatePost}
                  className="hidden md:flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create</span>
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden md:flex"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden md:flex"
                  onClick={() => navigate("/messages")}
                >
                  <MessageCircle className="h-4 w-4" />
                  {unreadMessages > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </Badge>
                  )}
                </Button>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback>
                          {user?.username?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.username}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.DASHBOARD}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.MY_BLOGS}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        My Blogs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.PROFILE}>
                        <Settings className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/community")}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Community</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="flex items-center gap-1 p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="flex-1 justify-start h-8"
                      >
                        {theme === "dark" ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Moon className="mr-2 h-4 w-4" />
                        )}
                        <span className="text-sm">
                          {theme === "dark" ? "Light" : "Dark"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="flex-1 justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="text-sm">Logout</span>
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to={ROUTES.LOGIN}>Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to={ROUTES.REGISTER}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to={ROUTES.FEED}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Feed
              </Link>
              <Link
                to="/explore"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                to="/stories"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Stories
              </Link>
              <Link
                to="/daily-drip"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Daily Drip
              </Link>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  handleCreatePost();
                  setIsMobileMenuOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  navigate("/notifications");
                  setIsMobileMenuOpen(false);
                }}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  navigate("/messages");
                  setIsMobileMenuOpen(false);
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
