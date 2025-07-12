import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ImageUpload = ({ onImageSelect, children, disabled = false }) => {
  const imageInputRef = useRef(null);
  const { toast } = useToast();

  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    onImageSelect(file);

    // Clear the input
    event.target.value = "";
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full"
        onClick={handleImageSelect}
        disabled={disabled}
        title="Send image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </>
  );
};

export default ImageUpload;
