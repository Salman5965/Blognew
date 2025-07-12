
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useChatStore } from "@/features/chat/chatStore";
import { ConversationsList } from "./ConversationsList";
import { ChatWindow } from "./ChatWindow";
import { NewChatTab } from "./NewChatTab";

export const ChatPanel = () => {
  const {
    isOpen,
    closeChat,
    activeTab,
    currentConversation,
    fetchConversations,
    refreshUnreadCount,
  } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      refreshUnreadCount();
    }
  }, [isOpen, fetchConversations, refreshUnreadCount]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (activeTab === "conversation" && currentConversation) {
      return <ChatWindow />;
    }

    if (activeTab === "new-chat") {
      return <NewChatTab />;
    }

    return <ConversationsList />;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 animate-in slide-in-from-bottom-2 slide-in-from-right-2">
      <Card className="h-full flex flex-col shadow-lg border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">
            {activeTab === "conversation" && currentConversation
              ? currentConversation.participantName
              : activeTab === "new-chat"
                ? "New Chat"
                : "Messages"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={closeChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPanel;
