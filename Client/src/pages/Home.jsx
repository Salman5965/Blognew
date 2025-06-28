import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BlogList } from "@/components/blog/BlogList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlogStore } from "@/features/blogs/blogStore";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { useAuthContext } from "@/contexts/AuthContext";
import { DEBOUNCE_DELAY, ROUTES } from "@/utils/constant";

import {
  Search,
  Filter,
  Grid,
  List,
  X,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuthContext();

  const { filters, updateFilters, resetFilters } = useBlogStore();

  const [debouncedSearch] = useDebouncedCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, DEBOUNCE_DELAY.SEARCH);

  const popularTags = [
    "technology",
    "programming",
    "web-development",
    "react",
    "javascript",
    "design",
    "ui-ux",
    "tutorial",
    "tips",
    "best-practices",
  ];

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const hasActiveFilters =
    filters.search || filters.tags.length > 0 || filters.author;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <PageWrapper className="py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="text-primary"> Stories</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Read, write, and share stories that matter. Join our community of
              passionate writers and curious readers.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for stories, topics, writers..."
                className="pl-10 h-12 text-lg"
                defaultValue={filters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Left Side - Filters */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={resetFilters} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Right Side - View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden mb-6 p-4 border rounded-lg bg-card">
            <div className="space-y-4">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  size="sm"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Active Filters:</h3>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline">
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0"
                    onClick={() => updateFilters({ search: "" })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div
          className={`grid gap-8 ${isAuthenticated ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}
        >
          {/* Main Content - Blog List */}
          <div className={isAuthenticated ? "lg:col-span-3" : "col-span-1"}>
            <BlogList variant={viewMode} />
          </div>

          {/* Sidebar - Only for authenticated users */}
          {isAuthenticated && (
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-6 space-y-6">
                {/* Discover CTA */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span>Discover</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Find amazing writers and discover your next favorite
                      content creator.
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => navigate(ROUTES.EXPLORE)}
                        className="w-full"
                        size="sm"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Explore People
                      </Button>
                      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Popular Authors</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Search className="h-3 w-3" />
                          <span>User Search</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats or Tips for new users */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Welcome to BlogHub
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Discover amazing content</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Follow your favorite writers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Share your own stories</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
};
