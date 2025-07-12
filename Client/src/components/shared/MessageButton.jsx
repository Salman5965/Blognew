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

    // Check if we're already on the messages page
    const currentPath = window.location.pathname;
    if (currentPath === "/messages") {
      // If on messages page, open modal
      setShowModal(true);
    } else {
      // If on any other page, navigate to messages with user parameter
      const userId = user._id || user.id;
      navigate(`/messages?user=${userId}`);
    }
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
