import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Paperclip, FileText, File, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FileUpload = ({ onFileSelect, children, disabled = false }) => {
  const documentInputRef = useRef(null);
  const archiveInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = (type) => {
    const input =
      type === "archive" ? archiveInputRef.current : documentInputRef.current;
    input?.click();
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (25MB limit for documents)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 25MB",
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
            <div
              role="button"
              tabIndex={0}
              className={`rounded-full cursor-pointer hover:bg-muted flex items-center justify-center h-8 w-8 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Paperclip className="h-5 w-5" />
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" side="top" align="start">
          <DropdownMenuItem onClick={() => handleFileSelect("document")}>
            <FileText className="h-4 w-4 mr-2" />
            Document
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFileSelect("file")}>
            <File className="h-4 w-4 mr-2" />
            Other file
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFileSelect("archive")}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
        onChange={(e) => handleFileChange(e, "document")}
        className="hidden"
      />
      <input
        ref={archiveInputRef}
        type="file"
        accept=".zip,.rar,.7z,.tar,.gz"
        onChange={(e) => handleFileChange(e, "archive")}
        className="hidden"
      />
    </>
  );
};

export default FileUpload;
