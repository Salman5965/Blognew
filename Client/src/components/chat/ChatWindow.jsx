
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";
import { useChatStore } from "@/features/chat/chatStore";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

export const ChatWindow = () => {
  const {
    currentConversation,
    messages,
    isLoading,
    error,
    sendMessage,
    backToConversations,
    clearError,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const content = messageInput.trim();
    if (!content || isSending) return;

    try {
      setIsSending(true);
      setMessageInput("");
      await sendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return format(date, "HH:mm");
    } else {
      return format(date, "MMM dd, HH:mm");
    }
  };

  const renderMessage = (message, index) => {
    const isCurrentUser = message.senderId === "current_user";
    const previousMessage = messages[index - 1];
    const isFirstInGroup =
      !previousMessage ||
      previousMessage.senderId !== message.senderId ||
      new Date(message.timestamp).getTime() -
        new Date(previousMessage.timestamp).getTime() >
        300000; // 5 minutes

    return (
      <div
        key={message.id}
        className={cn(
          "flex items-end space-x-2 mb-2",
          isCurrentUser && "flex-row-reverse space-x-reverse",
        )}
      >
        {!isCurrentUser && isFirstInGroup && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentConversation?.participantAvatar} />
            <AvatarFallback className="text-xs">
              {currentConversation?.participantName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        {!isCurrentUser && !isFirstInGroup && <div className="w-6" />}

        <div
          className={cn(
            "max-w-[80%] px-3 py-2 rounded-lg text-sm break-words",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <p>{message.content}</p>
          <div
            className={cn(
              "flex items-center justify-end mt-1 space-x-1",
              isCurrentUser
                ? "text-primary-foreground/70"
                : "text-muted-foreground",
            )}
          >
            <span className="text-xs">
              {formatMessageTime(message.timestamp)}
            </span>
            {message.sending && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        </div>
      </div>
    );
  };

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={backToConversations}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentConversation.participantAvatar} />
            <AvatarFallback>
              {currentConversation.participantName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {currentConversation.isOnline && (
            <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 border border-background rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {currentConversation.participantName}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentConversation.isOnline ? "Online" : "Offline"}
          </p>
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

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                No messages yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex space-x-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageInput.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
