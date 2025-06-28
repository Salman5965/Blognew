import { useState, useEffect, useCallback } from "react";
import exploreService from "@/services/exploreService";

export const useExplore = (options = {}) => {
  const [data, setData] = useState({
    trendingAuthors: [],
    featuredContent: [],
    popularTags: [],
    recommendedUsers: [],
    trendingTopics: [],
    exploreStats: {},
  });

  const [loading, setLoading] = useState({
    authors: true,
    content: true,
    tags: true,
    users: true,
    topics: true,
    stats: true,
  });

  const [error, setError] = useState(null);

  const { timeframe = "week", contentType = "all", limit = 12 } = options;

  const loadExploreData = useCallback(async () => {
    try {
      setError(null);
      setLoading((prev) => ({
        ...prev,
        authors: true,
        content: true,
        tags: true,
        users: true,
        topics: true,
        stats: true,
      }));

      // Load all data in parallel
      const [
        authorsResult,
        contentResult,
        tagsResult,
        usersResult,
        topicsResult,
        statsResult,
      ] = await Promise.allSettled([
        exploreService.getTrendingAuthors({ timeframe, limit }),
        exploreService.getFeaturedContent({
          type: contentType === "all" ? null : contentType,
        }),
        exploreService.getPopularTags(20),
        exploreService.getRecommendedUsers({ limit: 8 }),
        exploreService.getTrendingTopics(10),
        exploreService.getExploreStats(),
      ]);

      // Update data with successful results
      setData((prevData) => ({
        ...prevData,
        trendingAuthors:
          authorsResult.status === "fulfilled"
            ? authorsResult.value.authors || []
            : prevData.trendingAuthors,
        featuredContent:
          contentResult.status === "fulfilled"
            ? contentResult.value.content || []
            : prevData.featuredContent,
        popularTags:
          tagsResult.status === "fulfilled"
            ? tagsResult.value || []
            : prevData.popularTags,
        recommendedUsers:
          usersResult.status === "fulfilled"
            ? usersResult.value.users || []
            : prevData.recommendedUsers,
        trendingTopics:
          topicsResult.status === "fulfilled"
            ? topicsResult.value || []
            : prevData.trendingTopics,
        exploreStats:
          statsResult.status === "fulfilled"
            ? statsResult.value || {}
            : prevData.exploreStats,
      }));

      // Update loading states
      setLoading({
        authors: false,
        content: false,
        tags: false,
        users: false,
        topics: false,
        stats: false,
      });
    } catch (error) {
      console.error("Error loading explore data:", error);
      setError(error.message || "Failed to load explore data");
      setLoading({
        authors: false,
        content: false,
        tags: false,
        users: false,
        topics: false,
        stats: false,
      });
    }
  }, [timeframe, contentType, limit]);

  const searchUsers = useCallback(async (query, searchOptions = {}) => {
    if (!query.trim()) return;

    try {
      setLoading((prev) => ({ ...prev, authors: true }));
      setError(null);

      const results = await exploreService.searchUsers(query, searchOptions);
      setData((prevData) => ({
        ...prevData,
        trendingAuthors: results.users || [],
      }));
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "Search failed");
    } finally {
      setLoading((prev) => ({ ...prev, authors: false }));
    }
  }, []);

  const refreshData = useCallback(() => {
    loadExploreData();
  }, [loadExploreData]);

  useEffect(() => {
    loadExploreData();
  }, [loadExploreData]);

  return {
    data,
    loading,
    error,
    searchUsers,
    refreshData,
  };
};

export default useExplore;
