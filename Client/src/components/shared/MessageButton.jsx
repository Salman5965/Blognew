import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NewMessageModal from "@/components/messages/NewMessageModal";

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
  const [showModal, setShowModal] = useState(false);

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

    // Open modal instead of navigating directly
    setShowModal(true);
  };

  const handleStartConversation = async (userId) => {
    // Navigate to Messages page with user ID to start conversation
    navigate(`/messages?user=${userId}`);
  };

  return (
    <>
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

      <NewMessageModal
        open={showModal}
        onOpenChange={setShowModal}
        onStartConversation={handleStartConversation}
      />
    </>
  );
};

export default MessageButton;
