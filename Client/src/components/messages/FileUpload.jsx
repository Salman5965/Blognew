import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
      <Popover>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" side="top" align="start">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleFileSelect("image")}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleFileSelect("file")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Document
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
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
            </Button>
          </div>
        </PopoverContent>
      </Popover>

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
