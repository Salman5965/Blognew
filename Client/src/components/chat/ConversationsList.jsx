
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, MessageCircle, AlertCircle } from "lucide-react";
import { useChatStore } from "@/features/chat/chatStore";
import { formatDistanceToNow } from "date-fns";

export const ConversationsList = () => {
  const {
    conversations,
    isLoading,
    error,
    openConversation,
    setActiveTab,
    clearError,
  } = useChatStore();

  const formatLastMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return "No messages yet";
    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with New Chat button */}
      <div className="p-3 border-b">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setActiveTab("new-chat")}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-medium text-sm mb-1">No conversations</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Start a new conversation to connect with other users
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("new-chat")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Start Chat
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => openConversation(conversation)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback>
                      {conversation.participantName?.charAt(0).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">
                      {conversation.participantName}
                    </p>
                    <div className="flex items-center space-x-1">
                      {conversation.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 w-5 flex items-center justify-center text-xs p-0"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">
                      {truncateMessage(conversation.lastMessage)}
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatLastMessageTime(conversation.lastMessageTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationsList;
