import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDisplayName, getInitials } from "@/utils/userUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import messagingService from "@/services/messagingService";

const NewMessageModal = ({ open, onOpenChange, onStartConversation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const users = await messagingService.searchUsers(searchQuery, 20);
      setSearchResults(users);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = async (user) => {
    try {
      const userId = user._id || user.id;

      if (onStartConversation) {
        // If we have a callback, use it (for within Messages page)
        await onStartConversation(userId);
      } else {
        // Otherwise navigate to messages page (for external usage)
        navigate(`/messages?user=${userId}`);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold text-center">
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-0"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No people found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                  People
                </h3>
                {searchResults.map((user, index) => (
                  <div
                    key={`modal-user-${user._id || user.id || index}`}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/users/${user._id || user.id}`);
                        onOpenChange(false);
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="font-medium truncate">
                        {getDisplayName(user)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Search for people to message</p>
                <p className="text-sm">Start typing to find someone</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageModal;
