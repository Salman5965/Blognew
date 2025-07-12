import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cloudinaryService } from "@/services/cloudinaryService";
import {
  Camera,
  Upload,
  Loader2,
  X,
  AlertCircle,
  ImageIcon,
  Crop,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ImageUpload = ({
  currentImage,
  onImageUpload,
  onImageRemove,
  userId,
  className = "",
  size = "lg", // sm, md, lg, xl
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropDialog, setShowCropDialog] = useState(false);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = cloudinaryService.validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setSelectedFile(file);
    setError(null);
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadProfileImage(
        selectedFile,
        userId,
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call parent callback with the new image URL
      if (onImageUpload) {
        await onImageUpload(result.url, result);
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

      setShowCropDialog(false);
      setPreviewImage(null);
      setSelectedFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (onImageRemove) {
        await onImageRemove();
      }

      toast({
        title: "Success",
        description: "Profile picture removed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove profile picture",
        variant: "destructive",
      });
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <Avatar
          className={`${sizeClasses[size]} border-4 border-background shadow-lg`}
        >
          <AvatarImage
            src={currentImage}
            alt="Profile picture"
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
            <ImageIcon className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>

        {/* Upload Button Overlay */}
        <div className="absolute -bottom-2 -right-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full w-10 h-10 p-0 bg-background shadow-lg border-2 hover:scale-105 transition-transform"
            onClick={triggerFileSelect}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Current Image Actions */}
      {currentImage && !isUploading && (
        <div className="mt-4 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Change
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}

      {/* No Image Actions */}
      {!currentImage && !isUploading && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Picture
          </Button>
        </div>
      )}

      {/* Crop/Preview Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Preview your new profile picture before uploading.
            </DialogDescription>
          </DialogHeader>

          {previewImage && (
            <div className="flex justify-center py-6">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-48 h-48 rounded-full object-cover border-4 border-border shadow-lg"
                />
                <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Crop className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Your image will be automatically resized and optimized</p>
            <p className="mt-1">
              Recommended: Square image, at least 400x400px
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCropDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Picture
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
