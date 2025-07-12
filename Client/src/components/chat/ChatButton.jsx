
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "@/features/chat/chatStore";

export const ChatButton = () => {
  const { toggleChat, unreadCount } = useChatStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleChat}
      className="relative"
      aria-label="Open chat"
    >
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default ChatButton;
