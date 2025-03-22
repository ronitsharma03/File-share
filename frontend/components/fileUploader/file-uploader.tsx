"use client";

import { Upload, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Toaster } from "sonner";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileLimitAlert, setFileLimitAlert] = useState<boolean>(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB limit

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileLimitAlert(true);
        return;
      }
      setFileLimitAlert(false);
      handleFile(selectedFile);
    }
  };

  const handleFile = (newFile: File) => {
    setFile(newFile);
    setUploadProgress(0);
    simulateUpload();
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10; // Fixed increment for smooth progress
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 300); // Completes in ~3 seconds
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <Card>
      <CardContent>
        {fileLimitAlert && <Toaster />}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Drag & drop files here</h3>
              <p className="text-sm text-muted-foreground">
                or click to browse file from your computer
              </p>
              <label htmlFor="file-upload">
                <div className="mt-2">
                  <Button
                    size={"sm"}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    Select file
                  </Button>
                </div>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Files will be shared P2P when possible, with S3 as fallback
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Uploading the file</h4>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-medium">{file.name}</p>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-6 w-6"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4 hover:cursor-pointer" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={uploadProgress} className="h-2" />
                <span className="text-xs text-muted-foreground w-10">
                  {Math.round(uploadProgress)} %
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
