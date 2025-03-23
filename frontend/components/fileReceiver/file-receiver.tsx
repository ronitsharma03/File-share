import { toast, Toaster } from "sonner";
import { useTransferStore } from "../atoms/fileTransferAtoms";
import { connectToRoom } from "../services/WebSocketMessages";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect } from "react";

export default function FilReceiver() {
  const { roomId, setRoomId, setWebSocketConnection, wsConnection } =
    useTransferStore();

  const handleConnect = async () => {
    if (!roomId) {
      return;
    }
    try {
      // Use await to wait for the Promise to resolve
      const ws = await connectToRoom(roomId);

      if (!ws) {
        toast.error(`Cannot connect to Room: ${roomId}`);
        return;
      }

      toast.success(`Connected to the Room: ${roomId}`);
      setWebSocketConnection(ws);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'room-join',
            roomId: roomId,
          })
        );
        toast.success("Message sent succesfully");
      }
    } catch (error) {
      toast.error(`Error connecting to Room: ${error}`);
    }
  };

  return (
    <div className="flex w-full items-center space-x-4">
      <Toaster />
      {wsConnection ? (
        `Connected to ${roomId}`
      ) : (
        <div className="flex items-center max-w-sm space-x-4">
          <Input
            type="text"
            placeholder="Room Id"
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
          <Button type="submit" onClick={handleConnect}>
            Connect
          </Button>
          <p>{roomId}</p>
        </div>
      )}
    </div>
  );
}
