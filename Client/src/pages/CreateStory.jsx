import React, { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Upload,
  Image,
  Mic,
  MapPin,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Check,
  X,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import storiesService from "@/services/storiesService";

const CreateStory = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    location: "",
    coverImage: null,
    audioFile: null,
    isPublic: true,
    allowComments: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [errors, setErrors] = useState({});

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({ ...prev, coverImage: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an audio file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({ ...prev, audioFile: file }));

      // Create preview
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "recorded-audio.webm", {
          type: "audio/webm",
        });
        setFormData((prev) => ({ ...prev, audioFile: file }));

        const url = URL.createObjectURL(blob);
        setAudioPreview(url);
      };

      recorder.start();
      setAudioRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      audioRecorder.stream.getTracks().forEach((track) => track.stop());
      setAudioRecorder(null);
      setIsRecording(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Story content is required";
    } else if (formData.content.length < 100) {
      newErrors.content = "Story must be at least 100 characters";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Story excerpt is required";
    } else if (formData.excerpt.length < 20) {
      newErrors.excerpt = "Excerpt must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publishNow = false) => {
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form for any missing or invalid fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const storyData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        isPublished: publishNow,
        readTime: Math.ceil(formData.content.split(" ").length / 200), // ~200 WPM
        visibility: formData.isPublic ? "public" : "private",
        allowComments: formData.allowComments,
      };

      // Only include optional fields if they have values
      if (formData.coverImage && typeof formData.coverImage === "string") {
        storyData.coverImage = formData.coverImage.trim();
      }

      // Handle excerpt if provided
      if (formData.excerpt && formData.excerpt.trim()) {
        storyData.excerpt = formData.excerpt.trim();
      }

      console.log("CreateStory: Sending story data:", storyData);
      console.log("CreateStory: Original form data:", formData);

      await storiesService.createStory(storyData);

      toast({
        title: publishNow ? "Story published!" : "Story saved!",
        description: publishNow
          ? "Your story is now live and visible to the community"
          : "Your story has been saved as a draft",
      });

      navigate("/stories");
    } catch (error) {
      toast({
        title: "Failed to save story",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const estimatedReadTime = Math.ceil(formData.content.split(" ").length / 200);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/stories")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Stories
              </Button>
              <h1
                className="text-xl font-semibold"
                style={{ fontFamily: "Pacifico, cursive" }}
              >
                Share Your Story
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreview ? "Edit" : "Preview"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>

              <Button
                size="sm"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Publish Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isPreview ? (
          /* Preview Mode */
          <Card>
            <CardContent className="p-8">
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt="Story cover"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div className="flex items-center gap-2 mb-4">
                {formData.location && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {formData.location}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {estimatedReadTime} min read
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">
                {formData.title || "Your Story Title"}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 italic">
                {formData.excerpt || "Your story excerpt will appear here..."}
              </p>

              {audioPreview && (
                <div className="mb-6">
                  <audio controls className="w-full">
                    <source src={audioPreview} type="audio/webm" />
                    <source src={audioPreview} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="prose max-w-none">
                {formData.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph || <br />}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Title *
                </label>
                <Input
                  placeholder="What's your story about?"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Excerpt *
                </label>
                <Textarea
                  placeholder="A brief summary of your story (this will be shown in previews)"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  rows={3}
                  className={errors.excerpt ? "border-destructive" : ""}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.excerpt}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Story *
                </label>
                <Textarea
                  placeholder="Share your story here... Be authentic, be honest, be you."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={20}
                  className={errors.content ? "border-destructive" : ""}
                />
                {errors.content && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.content}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.content.split(" ").length} words • ~
                  {estimatedReadTime} min read
                </p>
              </div>

              {/* Media Upload */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Add Media (Optional)</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="cover-image"
                      />
                      <label htmlFor="cover-image">
                        <Button variant="outline" size="sm" asChild>
                          <span className="flex items-center gap-2 cursor-pointer">
                            <Image className="h-4 w-4" />
                            Choose Image
                          </span>
                        </Button>
                      </label>
                      {coverImagePreview && (
                        <div className="relative">
                          <img
                            src={coverImagePreview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => {
                              setCoverImagePreview(null);
                              setFormData((prev) => ({
                                ...prev,
                                coverImage: null,
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Audio Narration
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                        id="audio-file"
                      />
                      <label htmlFor="audio-file">
                        <Button variant="outline" size="sm" asChild>
                          <span className="flex items-center gap-2 cursor-pointer">
                            <Upload className="h-4 w-4" />
                            Upload Audio
                          </span>
                        </Button>
                      </label>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center gap-2 ${isRecording ? "text-red-500" : ""}`}
                      >
                        <Mic className="h-4 w-4" />
                        {isRecording ? "Stop Recording" : "Record"}
                      </Button>
                    </div>

                    {audioPreview && (
                      <div className="mt-2">
                        <audio controls className="w-full max-w-md">
                          <source src={audioPreview} type="audio/webm" />
                          <source src={audioPreview} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Story Details */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Story Details</h3>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location (Optional)
                    </label>
                    <Input
                      placeholder="Where did this happen?"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Writing Tips
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Be authentic and honest</li>
                    <li>• Share specific details and emotions</li>
                    <li>• Include what you learned or how you grew</li>
                    <li>• Consider how your story might help others</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStory;
