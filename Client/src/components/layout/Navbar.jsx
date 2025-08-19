import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  PlusCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDebouncedCallback } from "use-debounce";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/utils/constant";
import { getDisplayName, getInitials } from "@/utils/userUtils";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({ search: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Dynamic icon colors based on current page
  const iconColors = {
    info: location.pathname === "/feed" ? "text-primary" : "text-muted-foreground",
    notification: location.pathname === "/notifications" ? "text-primary" : "text-muted-foreground",
    message: location.pathname === "/messages" ? "text-primary" : "text-muted-foreground",
  };

  // Fetch notification and message counts
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchCounts = async () => {
      try {
        // Import services dynamically to avoid circular dependencies
        const [{ default: notificationService }, { default: messagingService }] =
          await Promise.all([
            import("@/services/notificationService"),
            import("@/services/messagingService"),
          ]);

        const [notifications, conversations] = await Promise.all([
          notificationService.getUnreadCount().catch(() => 0),
          messagingService.getConversations().catch(() => ({ conversations: [] })),
        ]);

        setUnreadNotifications(notifications);

        // Count unread messages from conversations
        const messageCount = (conversations.conversations || []).reduce(
          (total, conv) => total + (conv.unreadCount || 0),
          0
        );
        setUnreadMessages(messageCount);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const debouncedSearch = useDebouncedCallback(async (value) => {
    setFilters((prev) => ({ ...prev, search: value }));

    if (value.trim() && value.length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);

      try {
        // Import services dynamically to avoid circular dependencies
        const [
          { default: exploreService },
          { default: blogService },
          { default: userService },
        ] = await Promise.all([
          import("@/services/exploreService"),
          import("@/services/blogService"),
          import("@/services/userService"),
        ]);

        // Search across all content types with parallel requests for better performance
        const searchPromises = [
          exploreService
            .searchContent(value, "all", {
              limit: 10,
              sortBy: "relevance",
            })
            .catch(() => ({ results: {} })),
          blogService
            .getBlogs({
              search: value,
              limit: 8,
              sortBy: "relevance",
            })
            .catch(() => ({ blogs: [] })),
        ];

        // Only add user search if user is authenticated
        if (isAuthenticated) {
          searchPromises.push(
            userService.searchUsers(value, 8).catch(() => []),
          );
        }

        const results = await Promise.all(searchPromises);
        const [exploreResults, blogResults, userResults] = [
          results[0],
          results[1],
          isAuthenticated ? results[2] : [],
        ];

        // Combine and format results with better distribution
        const combinedResults = [
          // Users (up to 4 from direct search)
          ...(userResults || [])
            .slice(0, 4)
            .map((user) => ({ ...user, type: "user" })),
          // Additional users from explore if needed
          ...(exploreResults.results?.users || [])
            .slice(0, 2)
            .filter(
              (user) =>
                !(userResults || []).some(
                  (u) => (u._id || u.id) === (user._id || user.id),
                ),
            )
            .map((user) => ({ ...user, type: "user" })),
          // Blogs (up to 6 from direct search)
          ...(blogResults.blogs || [])
            .slice(0, 6)
            .map((blog) => ({ ...blog, type: "blog" })),
          // Additional blogs from explore if needed
          ...(exploreResults.results?.blogs || [])
            .slice(0, 3)
            .filter(
              (blog) =>
                !(blogResults.blogs || []).some(
                  (b) => (b._id || b.id) === (blog._id || blog.id),
                ),
            )
            .map((blog) => ({ ...blog, type: "blog" })),
          // Stories (up to 4)
          ...(exploreResults.results?.stories || [])
            .slice(0, 4)
            .map((story) => ({ ...story, type: "story" })),
          // Daily Drip content (up to 2)
          ...(exploreResults.results?.dailydrip || [])
            .slice(0, 2)
            .map((drip) => ({ ...drip, type: "dailydrip" })),
        ].slice(0, 15); // Limit total results to 15

        setSearchResults(combinedResults);
      } catch (error) {
        console.error("Search failed:", error);

        // Handle different types of errors gracefully
        if (
          error.message?.includes("Too many requests") ||
          error.status === 429
        ) {
          setSearchResults([
            {
              type: "error",
              id: "rate-limit",
              title: "Search rate limited",
              message: "Please slow down your search. Try again in a moment.",
            },
          ]);
        } else if (
          error.status === 401 ||
          error.message?.includes("Access denied")
        ) {
          setSearchResults([
            {
              type: "error",
              id: "auth-error",
              title: "Authentication required",
              message: isAuthenticated
                ? "Session expired. Please refresh the page."
                : "Sign in for full search results.",
            },
          ]);
        } else {
          setSearchResults([
            {
              type: "error",
              id: "search-error",
              title: "Search temporarily unavailable",
              message: "Please try again in a moment.",
            },
          ]);
        }
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, 800);

  const handleCreatePost = () => {
    navigate(ROUTES.CREATE_BLOG);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "blog":
        return <PlusCircle className="h-4 w-4" />;
      case "story":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getResultPath = (result) => {
    switch (result.type) {
      case "user":
        return `/users/${result._id || result.id}`;
      case "blog":
        return `/blogs/${result.slug || result._id || result.id}`;
      case "story":
        return `/stories/${result._id || result.id}`;
      case "dailydrip":
        return `/daily-drip/${result._id || result.id}`;
      default:
        return "#";
    }
  };

  const formatResultTitle = (result) => {
    switch (result.type) {
      case "user":
        return getDisplayName(result);
      case "blog":
      case "story":
      case "dailydrip":
        return result.title;
      case "error":
        return result.title;
      default:
        return "Unknown";
    }
  };

  const formatResultSubtitle = (result) => {
    switch (result.type) {
      case "user":
        return `@${result.username}`;
      case "blog":
        return result.excerpt?.substring(0, 60) + "..." || "No excerpt available";
      case "story":
        return result.summary?.substring(0, 60) + "..." || "No summary available";
      case "dailydrip":
        return result.description?.substring(0, 60) + "..." || "Daily inspiration";
      case "error":
        return result.message;
      default:
        return "";
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">WriteNest</span>
            </Link>
          </div>

          {/* Search */}
          {isAuthenticated && (
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${iconColors.info}`}
                />
                <Input
                  placeholder="Search users, blogs, stories, everything..."
                  className="pl-10 pr-4"
                  defaultValue={filters.search}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  onFocus={() => filters.search && setShowSearchResults(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filters.search) {
                      setShowSearchResults(false);
                      navigate(
                        `/explore?q=${encodeURIComponent(filters.search)}`,
                      );
                    }
                  }}
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
                            key={`${result.type}-${result._id || result.id || index}`}
                            className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center space-x-3"
                            onClick={() => {
                              if (result.type !== "error") {
                                navigate(getResultPath(result));
                                setShowSearchResults(false);
                              }
                            }}
                          >
                            <div className="flex-shrink-0">
                              {result.type === "user" ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={result.avatar} />
                                  <AvatarFallback>
                                    {getInitials(result.firstName, result.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  {getResultIcon(result.type)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {formatResultTitle(result)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {formatResultSubtitle(result)}
                              </p>
                            </div>
                            {result.type !== "error" && (
                              <Badge variant="secondary" className="text-xs">
                                {result.type}
                              </Badge>
                            )}
                          </div>
                        ))}
                        <div className="px-4 py-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setShowSearchResults(false);
                              navigate(
                                `/explore?q=${encodeURIComponent(filters.search)}`,
                              );
                            }}
                          >
                            See all results for "{filters.search}"
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <p className="text-sm">No results found</p>
                        <p className="text-xs">
                          Try different keywords or browse{" "}
                          <Link to="/explore" className="text-primary hover:underline">
                            Explore
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Create Post */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCreatePost}
                  className="relative"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/notifications")}
                  className="relative"
                >
                  <Bell className={`h-4 w-4 ${iconColors.notification}`} />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/messages")}
                  className="relative"
                >
                  <MessageCircle className={`h-4 w-4 ${iconColors.message}`} />
                  {unreadMessages > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={getDisplayName(user)} />
                        <AvatarFallback>
                          {getInitials(user?.firstName, user?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{getDisplayName(user)}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          @{user?.username}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.DASHBOARD)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to={ROUTES.LOGIN}>Log in</Link>
                </Button>
                <Button asChild>
                  <Link to={ROUTES.REGISTER}>Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
