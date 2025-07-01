import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Paperclip, Image as ImageIcon, FileText, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FileUpload = ({ onFileSelect, children, disabled = false }) => {
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = (type) => {
    const input =
      type === "image" ? imageInputRef.current : fileInputRef.current;
    input?.click();
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (type === "image" && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file, type);

    // Clear the input
    event.target.value = "";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" side="top" align="start">
          <DropdownMenuItem onClick={() => handleFileSelect("image")}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Photo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFileSelect("file")}>
            <FileText className="h-4 w-4 mr-2" />
            Document
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // For future implementation - camera access
              toast({
                title: "Camera",
                description: "Camera feature coming soon!",
              });
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "image")}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={(e) => handleFileChange(e, "file")}
        className="hidden"
      />
    </>
  );
};

export default FileUpload;
