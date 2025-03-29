import { toast, Toaster } from "sonner";
import { useTransferStore } from "../atoms/fileTransferAtoms";
import {
  connectToRoom,
  setUpWebSocketEventHandler,
} from "../services/WebSocketMessages";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { Badge, Download, Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { formatFileSize } from "../services/fileFormat";
import { Progress } from "../ui/progress";
import { createPeerConnectionReceiver } from "../services/peerConnection";

export default function FilReceiver() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

  const {
    roomId,
    setRoomId,
    setWebSocketConnection,
    wsConnection,
    uploadProgress,
    setUploadProgress,
    connectionState,
    setConnectionState,
    isConnecting,
    setIsConnecting,
    downloadUrl,
    setDownloadUrl,
    fileMetaData,
    setFileMetaData,
    removeConnectedClient,
    userId,
    setUserId,
    clientId,
    setClientId,
    peerConnection,
    setPeerConnection,
  } = useTransferStore();

  useEffect(() => {
    const userId = uuidV4();
    setUserId(userId);
  }, []);

  useEffect(() => {
    if (peer) {
      peer.onconnectionstatechange = () => {
        toast.info("Connection state changed");
        console.log(
          "Connection state changed: ",
          peer.connectionState
        );
      };

      if (peer.connectionState === "connected") {
        toast.success("Peer-to-peer connection established");
      } else if (
        peer.connectionState === "disconnected" ||
        peer.connectionState === "failed"
      ) {
        toast.error("Peer connection lost");
      }

      peer.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peer.iceConnectionState);
      };
    }
  }, [peer]);

  const handleConnect = async () => {
    if (!roomId) {
      toast.error("Please enter a room ID");
      return;
    }
    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      const ws = await connectToRoom(roomId, userId);
      setSocket(ws);
      if (!ws) {
        toast.error(`Cannot connect to Room: ${roomId}`);
        setConnectionState("failed");
        setIsConnecting(false);
        return;
      }

      setUpWebSocketEventHandler(ws, false, {
        onRoomJoined: (clients) => {
          toast.success(`Connected to room: ${roomId}`);
          setConnectionState("connected");
        },
        onFileMetaData: (metadata) => {
          toast.info(`File ready to receive: ${metadata.fileName}`);
          setFileMetaData({
            fileName: metadata.fileName,
            fileSize: metadata.fileSize,
            fileType: metadata.fileType,
          });

          setClientId(metadata.fromClientId);
          // Send transfer-ready message
          // ws.send(
          //   JSON.stringify({
          //     type: "transfer-ready",
          //     roomId: roomId,
          //     fromClientId: userId,
          //     toClientId: metadata.fromClientId,
          //   })
          // );
        },
        onTransferProgress: (progress) => {
          setUploadProgress(progress);
        },
        onTransferComplete: () => {
          toast.success("File transfer completed!");
        },
        onTransferError: (error) => {
          toast.error(`Transfer error: ${error}`);
          setConnectionState("failed");
        },
        onClientLeft: (clientId) => {
          if (socket) {
            socket.send(
              JSON.stringify({
                type: "client-left",
                roomId: roomId,
                clientId: userId,
              })
            );
          }
          if (clientId === userId) {
            toast.info("Sender disconnected");
            setClientId("");
            setConnectionState("disconnected");
            setFileMetaData(null);
          }
        },
        onIceCandidate: async (message) => {
          if (peer && message.candidate) {
            try {
              await peer.addIceCandidate(message.candidate);
            } catch (error) {
              toast.error("Error receiving the file from sender");
            }
          }
        },
        onOffer: async (message) => {
          console.log("Received offer:", message);

          console.log("Creating peer connection with offer:", message.sdp);
          const pc = await createPeerConnectionReceiver(
            ws,
            message.roomId,
            userId,
            message.fromClientId,
            message.sdp
          );
          setPeer(pc)
          setPeerConnection(pc);
        },
       
      });

      
    } catch (error) {
      toast.error(`Error connecting to Room: ${error}`);
      setConnectionState("failed");
    } finally {
      setIsConnecting(false);
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
    <div className="space-y-4">
      <Toaster />

      {connectionState !== "connected" ? (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={roomId || ""}
              onChange={(e) => {
                setRoomId(e.target.value);
              }}
              disabled={isConnecting}
            />
            <Button
              type="submit"
              onClick={handleConnect}
              disabled={isConnecting || !roomId}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>

          {connectionState === "failed" && (
            <Badge fontVariant="destructive" className="self-start">
              Connection failed. Please try again.
            </Badge>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-2 ml-1 items-center">
              {" "}
              <p className="w-2 h-2 bg-green-500 rounded-full"></p>Connected to{" "}
              {roomId}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      type: "client-left",
                      roomId: roomId,
                      clientId: userId,
                    })
                  );
                  socket.close();
                  setSocket(null);
                  setWebSocketConnection(null);
                }
                setConnectionState("disconnected");
                setFileMetaData(null);
                setUploadProgress(0);
              }}
            >
              Disconnect
            </Button>
          </div>

          {fileMetaData ? (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{fileMetaData.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(fileMetaData.fileSize)}
                  </p>
                </div>

                {downloadUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Transfer Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center p-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">
                Waiting for sender to share a file...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
