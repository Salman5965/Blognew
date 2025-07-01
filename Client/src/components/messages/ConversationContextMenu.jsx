import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pin,
  VolumeX,
  Trash2,
  MoreHorizontal,
  Archive,
  Bell,
  BellOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConversationContextMenu = ({
  conversation,
  onDelete,
  onMute,
  onPin,
  onArchive,
  children,
}) => {
  const { toast } = useToast();

  const handleMute = () => {
    onMute(conversation);
    toast({
      title: conversation.isMuted
        ? "Conversation unmuted"
        : "Conversation muted",
      description: conversation.isMuted
        ? "You'll receive notifications again"
        : "You won't receive notifications",
    });
  };

  const handlePin = () => {
    onPin(conversation);
    toast({
      title: conversation.isPinned
        ? "Conversation unpinned"
        : "Conversation pinned",
      description: conversation.isPinned
        ? "Conversation moved to normal list"
        : "Conversation pinned to top",
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this conversation? This action cannot be undone.",
      )
    ) {
      onDelete(conversation);
    }
  };

  const handleArchive = () => {
    onArchive(conversation);
    toast({
      title: conversation.isArchived
        ? "Conversation unarchived"
        : "Conversation archived",
      description: conversation.isArchived
        ? "Conversation moved back to inbox"
        : "Conversation moved to archive",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <div
            role="button"
            tabIndex={0}
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded hover:bg-muted flex items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" side="right" align="start">
        <DropdownMenuItem onClick={handlePin}>
          <Pin className="h-4 w-4 mr-2" />
          {conversation.isPinned ? "Unpin" : "Pin"} conversation
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleMute}>
          {conversation.isMuted ? (
            <Bell className="h-4 w-4 mr-2" />
          ) : (
            <BellOff className="h-4 w-4 mr-2" />
          )}
          {conversation.isMuted ? "Unmute" : "Mute"} notifications
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="h-4 w-4 mr-2" />
          {conversation.isArchived ? "Unarchive" : "Archive"} conversation
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConversationContextMenu;
