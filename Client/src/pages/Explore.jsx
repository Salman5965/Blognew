import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/AuthContext";
import { FollowButton } from "@/components/shared/FollowButton";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  TrendingUp,
  Users,
  BookOpen,
  Filter,
  Sparkles,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Hash,
  Crown,
  Award,
  Flame,
  Clock,
  UserPlus,
} from "lucide-react";
import exploreService from "@/services/exploreService";
import { useExplore } from "@/hooks/useExplore";
import { Link } from "react-router-dom";

const Explore = () => {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("week");

  const { data, loading, error, searchUsers } = useExplore({
    timeframe,
    contentType: activeFilter,
    limit: 12,
  });

  const {
    trendingAuthors,
    featuredContent,
    popularTags,
    recommendedUsers,
    trendingTopics,
    exploreStats,
  } = data;

  const {
    authors: isLoadingAuthors,
    content: isLoadingContent,
    tags: isLoadingTags,
    users: isLoadingUsers,
  } = loading;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await searchUsers(searchQuery);
  };

  const getAuthorRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Award className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Explore</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover trending authors, popular content, and join conversations
            that matter
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {exploreStats.totalAuthors?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Authors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {exploreStats.totalBlogs?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {exploreStats.activeUsers?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for authors, topics, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>

                <div className="flex items-center space-x-1">
                  <Button
                    variant={timeframe === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe("day")}
                  >
                    Today
                  </Button>
                  <Button
                    variant={timeframe === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={timeframe === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe("month")}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span>Trending Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTags ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trendingTopics.slice(0, 10).map((topic, index) => (
                  <Badge
                    key={topic.id || index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {topic.name || topic}
                    {topic.count && (
                      <span className="ml-1 opacity-70">({topic.count})</span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Authors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Trending Authors</span>
              <Badge variant="outline" className="ml-auto">
                {timeframe === "day"
                  ? "Today"
                  : timeframe === "week"
                    ? "This Week"
                    : "This Month"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAuthors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </Card>
                ))}
              </div>
            ) : trendingAuthors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No trending authors found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or time filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingAuthors.map((author, index) => (
                  <Card
                    key={author._id || author.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={author.avatar}
                              alt={author.username}
                            />
                            <AvatarFallback>
                              {(
                                author.firstName?.[0] ||
                                author.username?.[0] ||
                                "U"
                              ).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            {getAuthorRankIcon(index + 1)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/users/${author._id || author.id}`}
                            className="font-semibold hover:text-primary transition-colors truncate block"
                          >
                            {author.firstName && author.lastName
                              ? `${author.firstName} ${author.lastName}`
                              : author.username || "Unknown User"}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">
                            @{author.username}
                          </p>
                        </div>
                      </div>

                      {author.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {author.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{author.blogsCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{author.followersCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{author.likesCount || 0}</span>
                          </span>
                        </div>
                      </div>

                      <FollowButton
                        userId={author._id || author.id}
                        className="w-full"
                        size="sm"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Content & Recommended Users Side by Side */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Featured Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingContent ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <Skeleton className="h-20 w-20 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2 mb-2" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : featuredContent.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No featured content
                    </h3>
                    <p className="text-muted-foreground">
                      Check back later for featured articles
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featuredContent.slice(0, 5).map((content) => (
                      <div
                        key={content._id || content.id}
                        className="flex space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {content.coverImage && (
                          <img
                            src={content.coverImage}
                            alt={content.title}
                            className="h-16 w-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <Link
                            to={`/blog/${content.slug || content._id}`}
                            className="font-semibold hover:text-primary transition-colors line-clamp-2"
                          >
                            {content.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mb-2">
                            by{" "}
                            {content.author?.firstName &&
                            content.author?.lastName
                              ? `${content.author.firstName} ${content.author.lastName}`
                              : content.author?.username || "Unknown Author"}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{content.viewsCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{content.likesCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{content.commentsCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(
                                  new Date(content.createdAt),
                                  { addSuffix: true },
                                )}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Users */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                  <span>Suggested for You</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recommendedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No suggestions yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedUsers.slice(0, 6).map((user) => (
                      <div
                        key={user._id || user.id}
                        className="flex items-center space-x-3"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>
                            {(
                              user.firstName?.[0] ||
                              user.username?.[0] ||
                              "U"
                            ).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/users/${user._id || user.id}`}
                            className="font-medium hover:text-primary transition-colors truncate block"
                          >
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username || "Unknown User"}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.followersCount || 0} followers
                          </p>
                        </div>

                        <FollowButton
                          userId={user._id || user.id}
                          size="sm"
                          showText={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-purple-500" />
              <span>Popular Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTags ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-16" />
                ))}
              </div>
            ) : popularTags.length === 0 ? (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No popular tags yet
                </h3>
                <p className="text-muted-foreground">
                  Tags will appear as content is published
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <Badge
                    key={tag.id || index}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors"
                  >
                    {tag.name || tag}
                    {tag.count && (
                      <span className="ml-1 text-xs opacity-70">
                        ({tag.count})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Explore;
