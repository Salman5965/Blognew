import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Reply, Edit, Trash2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MessageContextMenu = ({
  message,
  isOwn,
  onDelete,
  onEdit,
  onReply,
  onReact,
  children,
}) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
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
            <MoreHorizontal className="h-3 w-3" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" side="top" align="center">
        <DropdownMenuItem onClick={() => onReact("❤️")}>
          <Heart className="h-4 w-4 mr-2" />
          React
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>

        {isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(message)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(message)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageContextMenu;
