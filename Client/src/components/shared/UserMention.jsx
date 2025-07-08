import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AtSign, Loader2 } from "lucide-react";
import userSearchService from "@/services/userSearchService";
import { cn } from "@/lib/utils";

export const UserMention = ({ onMention, className }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setUsers([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await userSearchService.searchUsers(query, 5);
        if (result.success) {
          setUsers(result.users || []);
          setShowSuggestions(true);
          setSelectedIndex(0);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || users.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case "Enter":
        e.preventDefault();
        if (users[selectedIndex]) {
          handleSelectUser(users[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSelectUser = (user) => {
    onMention(user);
    setQuery("");
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center space-x-2">
        <AtSign className="h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mention someone..."
          className="flex-1 bg-transparent border-none outline-none text-sm"
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {showSuggestions && users.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto"
        >
          {users.map((user, index) => (
            <Button
              key={user._id || user.id}
              variant="ghost"
              className={cn(
                "w-full justify-start p-3 h-auto",
                index === selectedIndex && "bg-accent",
              )}
              onClick={() => handleSelectUser(user)}
            >
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {(user.username || user.name)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium text-sm">
                  {user.fullName || user.name || user.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  @{user.username}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
