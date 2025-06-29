import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Search, UserPlus, AlertCircle } from "lucide-react";
import { useChatStore } from "@/features/chat/chatStore";
import { useDebounceEffect } from "@/hooks/useDebounce";

export const NewChatTab = () => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    error,
    searchUsers,
    startConversation,
    setActiveTab,
    clearError,
  } = useChatStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search to avoid too many API calls
  useDebounceEffect(
    () => {
      if (localQuery.trim()) {
        searchUsers(localQuery);
      }
    },
    [localQuery],
    300,
  );

  const handleUserSelect = async (user) => {
    try {
      await startConversation(user);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const suggestedUsers = [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setActiveTab("conversations")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium text-sm">New Chat</h3>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-xs">{error}</span>
              <Button variant="outline" size="sm" onClick={clearError}>
                ×
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Results */}
      <ScrollArea className="flex-1">
        {isSearching ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : localQuery.trim() && searchResults.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-center p-4">
            <div>
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
              <p className="text-xs text-muted-foreground">
                Try a different search term
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {/* Search Results */}
            {localQuery.trim() && searchResults.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  Search Results
                </h4>
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleUserSelect(user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.charAt(0) ||
                            user.username?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Users (shown when no search query) */}
            {!localQuery.trim() && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  Suggested
                </h4>
                <div className="space-y-1">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleUserSelect(user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NewChatTab;
