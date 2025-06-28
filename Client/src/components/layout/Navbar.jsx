import React from "react";
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
  User,
  Settings,
  LogOut,
  Plus,
  BookOpen,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
} from "lucide-react";
import { useBlogStore } from "@/features/blogs/blogStore";
import { ChatButton } from "@/components/chat/ChatButton";
import { NotificationButton } from "@/components/notifications";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { theme, setTheme, actualTheme } = useTheme();
  const { updateFilters, filters } = useBlogStore();

  const [debouncedSearch] = useDebouncedCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, DEBOUNCE_DELAY.SEARCH);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleTheme = () => {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BlogHub</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to={ROUTES.HOME}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                to={ROUTES.FEED}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Feed
              </Link>
              <Link
                to="/community"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Community
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

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              className="pl-10"
              defaultValue={filters.search}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {getThemeIcon()}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Create Blog Button */}
              <Button asChild>
                <Link to={ROUTES.CREATE_BLOG}>
                  <Plus className="h-4 w-4 mr-2" />
                  Write
                </Link>
              </Button>

              {/* Notification Button */}
              <NotificationButton />

              {/* Chat Button */}
              <ChatButton />

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
                        {user?.username?.charAt(0).toUpperCase() || "U"}
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
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.HELP}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help
                    </Link>
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
    </nav>
  );
};
