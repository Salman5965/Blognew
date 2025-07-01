import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Don't show button if no user or if it's the current user
  if (
    !user ||
    !currentUser ||
    currentUser._id === user._id ||
    currentUser._id === user.id
  ) {
    return null;
  }

  const handleMessage = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Navigate to Messages page with user ID to start conversation
    const userId = user._id || user.id;
    navigate(`/messages?user=${userId}`);
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
