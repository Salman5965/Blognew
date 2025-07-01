import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" side="top" align="center">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => onReact("❤️")}
          >
            <Heart className="h-4 w-4 mr-2" />
            React
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => onReply(message)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>

          {isOwn && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => onEdit(message)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => onDelete(message)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MessageContextMenu;
