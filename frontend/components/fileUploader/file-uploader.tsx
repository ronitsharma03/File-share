"use client";

import {
  Upload,
  X,
  Send,
  Copy,
  Badge,
  Loader2,
  Loader,
  User,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { toast, Toaster } from "sonner";
import fileValidator from "../services/fileValidator";
import { useTransferStore } from "../atoms/fileTransferAtoms";
import { createTransferEntry } from "../services/createTransferEntry";
import {
  connectToRoom,
  setUpWebSocketEventHandler,
} from "../services/WebSocketMessages";
import { v4 as uuidV4 } from "uuid";
import { formatFileSize } from "../services/fileFormat";
import { createPeerConnectionSender } from "../services/peerConnection";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isCreatingTransfer, setIsCreatingTransfer] = useState(false);
  const [receiverConnected, setReceiverConnected] = useState(false);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [fileChannel, setFileChannel] = useState<RTCDataChannel | null>(null);

  const {
    file,
    setFile,
    roomId,
    setRoomId,
    transferId,
    setTransferId,
    uploadProgress,
    setUploadProgress,
    connectionState,
    setConnectionState,
    isSending,
    setIsSending,
    showConfirmButtons,
    setShowConfirmButtons,
    wsConnection,
    setWebSocketConnection,
    connectedClients,
    addConnectedClient,
    userId,
    setUserId,
    clientId,
    setClientId,
    removeConnectedClient,
    peerConnection,
    setPeerConnection,
    channel,
    setChannel,
  } = useTransferStore();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB limit

  useEffect(() => {
    const userId = uuidV4();
    setUserId(userId);
  }, []);

  useEffect(() => {
    if (pc) {
      pc.onconnectionstatechange = () => {
        toast.info("Connection state changed");
        console.log(
          "Connection state changed: ",
          pc.connectionState
        );
      };

      if (pc.connectionState === "connected") {
        toast.success("Peer-to-peer connection established");
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        toast.error("Peer connection lost");
      }

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
      };
    }
  }, [pc]);

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
    setShowConfirmButtons(true);
  };

  const handleSend = async () => {
    setShowConfirmButtons(false);
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setIsCreatingTransfer(true);
    setConnectionState("connecting");
    setReceiverConnected(false);

    try {
      const response = await createTransferEntry(
        file,
        "ronitkhajuria03@gmail.com"
      );
      if (!response?.status || !response?.data) {
        toast.error(
          `Error in initiating transfer: ${response?.error || "Unknown error"}`
        );
        setConnectionState("failed");
        setIsCreatingTransfer(false);
        return;
      }

      setTransferId(response.data.transferId);
      setRoomId(response.data.roomId);
      const currentRoomId = response.data.roomId;

      // const clientId = userId;
      const ws = await connectToRoom(response.data.roomId, userId);
      setSocket(ws);
      if (!ws) {
        toast.error(`Failed to connect to the room: ${response.data.roomId}`);
        setConnectionState("failed");
        setIsCreatingTransfer(false);
        return;
      }

      setUpWebSocketEventHandler(ws, true, {
        onClientJoined: (clientId) => {
          toast.success(`Receiver connected: ${clientId}`);
          setClientId(clientId);
          addConnectedClient(clientId);
          setReceiverConnected(true);

          const { pc, dataChannel } = createPeerConnectionSender(
            ws,
            currentRoomId,
            userId,
            clientId,
            (offer: string) => {
              ws.send(
                JSON.stringify({
                  type: "offer",
                  roomId: response.data?.roomId,
                  sdp: offer,
                  fromClientId: userId,
                  toClientId: clientId,
                })
              );
            }
          );
          setPc(pc);
          
          setFileChannel(dataChannel);
          setChannel(dataChannel);

          // Store references
          setPeerConnection(pc);

          // Send file metadata for UI purposes (not for the actual transfer)
          if (file) {
            ws.send(
              JSON.stringify({
                type: "file-metadata",
                roomId: response.data?.roomId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fromClientId: userId,
              })
            );
          }

          // Set up handlers for the data channel

          // Set up a handler for when the connection state changes
          pc.onconnectionstatechange = () => {
            console.log(`Connection state changed to: ${pc.connectionState}`);

            if (pc.connectionState === "connected") {
              toast.success("Peer connection established");
              // Connection handling is done in dataChannel.onopen
            } else if (
              pc.connectionState === "disconnected" ||
              pc.connectionState === "failed"
            ) {
              toast.error(`Connection ${pc.connectionState}`);
              setReceiverConnected(false);
            }
          };
          
        },

        onTransferProgress: (progress: number) => {
          setUploadProgress(progress);
        },

        onTransferComplete: () => {
          toast.success(`File Transfer completed`);
          setIsSending(false);
          setConnectionState("disconnected");
          setReceiverConnected(false);
        },

        onTransferError: (error) => {
          toast.error(`Transfer error: ${error}`);
          setConnectionState("failed");
          setReceiverConnected(false);
        },
        onRoomJoined: (clients) => {
          toast.success(`Connected to the room: ${response.data?.roomId}`);
          setConnectionState("connected");
        },
        onClientLeft: (clientId) => {
          toast.info(`Receiver disconnected: ${clientId}`);
          removeConnectedClient(clientId);
          setReceiverConnected(false);
          setClientId("");
        },
        onIceCandidate: async (message) => {
          if (pc && message.candidate) {
            try {
              console.log("Generated ICE candidate:", message.candidate.candidate);
              await pc.addIceCandidate(message.candidate);
              console.log("Adding ice candidates");
            } catch (error) {
              toast.error("Error connecting to the receiver");
            }
          }
        },
        onAnswer: async (message: any) => {
          // if (peerConnection && message.sdp) {
            try {
              console.log("Setting remote description with answer:", message.sdp);
              await pc?.setRemoteDescription({type: 'answer', sdp: message.sdp});
              console.log("Remote description set successfully");
          } catch (error) {
            console.error("Error setting remote description:", error);
            toast.error("Failed to establish connection with receiver");
          }
          // }
        },
        
      });

      setWebSocketConnection(ws);
      setIsSending(true);

      toast.success(
        `Ready for transfer share the roomID: ${response.data.roomId}`
      );
    } catch (error) {
      console.error("Error in handleSend:", error);
      toast.error(`Error: ${error}`);
      setConnectionState("failed");
      setReceiverConnected(false);
    } finally {
      setIsCreatingTransfer(false);
    }
  };

  const handleCancel = () => {
    setUploadProgress(0);
    setShowConfirmButtons(false);
    setFile(null);
    setReceiverConnected(false);
    setConnectionState("disconnected");
  };

  const handleRoomIdCopy = () => {
    if (roomId) {
      window.navigator.clipboard.writeText(roomId);
      toast.success(`Room Id: ${roomId} copied to clipboard`);
    }
  };

  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

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
                  ? receiverConnected
                    ? `${clientId} Connected`
                    : "Waiting for the user to connect..."
                  : "File ready to send"}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{file.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 hover:cursor-pointer" />
                </Button>
              </div>

              {isSending && (
                <div className="mt-4 space-y-4">
                  {roomId && (
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <code className="text-sm">{roomId}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRoomIdCopy}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {showConfirmButtons && (
                <div className="flex justify-center gap-4 mt-4">
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={isCreatingTransfer}
                  >
                    {isCreatingTransfer ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Transfer...
                      </>
                    ) : (
                      "Send"
                    )}
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
