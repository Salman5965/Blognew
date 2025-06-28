import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "@/features/chat/chatStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const MessageButton = ({
  user,
  size = "sm",
  variant = "outline",
  className = "",
  showIcon = true,
  showText = true,
  ...props
}) => {
  const { user: currentUser } = useAuthContext();
  const { startConversation, openChat } = useChatStore();
  const { toast } = useToast();

  // Don't show button if no user or if it's the current user
  if (
    !user ||
    !currentUser ||
    currentUser._id === user._id ||
    currentUser._id === user.id
  ) {
    return null;
  }

  const handleMessage = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      // Create user object for chat service
      const chatUser = {
        id: user._id || user.id,
        name: user.name || user.displayName || user.username,
        username: user.username,
        avatar: user.avatar,
      };

      // Start conversation with this user
      await startConversation(chatUser);

      // Open chat panel
      openChat();

      toast({
        title: "Chat opened",
        description: `You can now send messages to ${chatUser.name || chatUser.username}`,
      });
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
    <Button
      variant={variant}
      size={size}
      onClick={handleMessage}
      className={className}
      {...props}
    >
      {showIcon && <MessageCircle className="h-4 w-4" />}
      {showIcon && showText && <span className="ml-2">Message</span>}
      {!showIcon && showText && <span>Message</span>}
    </Button>
  );
};

export default MessageButton;
