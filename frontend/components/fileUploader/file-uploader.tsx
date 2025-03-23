"use client";

import { Upload, X, Send, Copy } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { toast, Toaster } from "sonner";
import fileValidator from "../services/fileValidator";
import { useTransferStore } from "../atoms/fileTransferAtoms";
import { createTransferEntry } from "../services/createTransferEntry";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const {
    file,
    setFile,
    roomId,
    setRoomId,
    transferId,
    setTransferId,
    uploadProgress,
    setUploadProgress,
    connnectionState,
    setConnectionState,
  } = useTransferStore();
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const fileValidationResult = fileValidator.validateFile(selectedFile);
      console.log(fileValidationResult);
      if (!fileValidationResult.valid) {
        toast.error(`${fileValidationResult.error}`);
        return;
      }
      handleFile(selectedFile);
    }
  };

  const handleFile = (newFile: File) => {
    setFile(newFile);
    setUploadProgress(0);
    setIsSending(false);
    setShowConfirmButtons(false);
    simulateUpload();
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10; // Fixed increment for smooth progress
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setShowConfirmButtons(true); // Show send/cancel buttons
        toast.success("File ready to send");
      }
      setUploadProgress(progress);
    }, 300); // Completes in ~3 seconds
  };

  const handleSend = async () => {
    setShowConfirmButtons(false);
    if (file) {
      const data = await createTransferEntry(file, "ronitkhajuria03@gmail.com");
      if (!data) {
        toast.error("Try again...");
        return;
      }
      setTransferId(data.transferId);
      setRoomId(data.roomId);
    }
    setIsSending(true);
  };

  const handleCancel = () => {
    setUploadProgress(0);
    setShowConfirmButtons(false);
    setFile(null);
  };

  const handleRoomIdCopy = () => {
    if(roomId){
      window.navigator.clipboard.writeText(roomId);
      toast.success(`Room Id: ${roomId} copied successfully`);
    }
  }

  return (
    <Card>
      <CardContent>
        <Toaster />
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
              <h4 className="text-sm font-medium">
                {isSending
                  ? "Sending to connected user..."
                  : "Uploading the file"}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-5">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs font-light">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-6 w-6"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 hover:cursor-pointer" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>

              {isSending ? (
                <div className="flex items-center gap-2 mt-4">
                  <Copy className="h-5 w-5 text-primary" onClick={handleRoomIdCopy}/>
                  <p className="text-sm text-primary">{roomId}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(uploadProgress)} %
                  </span>
                </div>
              )}

              {showConfirmButtons && (
                <div className="flex justify-center gap-4 mt-4">
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSend}>
                    Send
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
