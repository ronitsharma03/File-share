import { useTransferStore } from "../atoms/fileTransferAtoms";

export const connectToRoom = async (
  roomId: string,
  clientId?: string
): Promise<WebSocket | null> => {
  try {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
    const clientIdParam = clientId ? `&clientId=${clientId}` : "";
    const ws: WebSocket = new WebSocket(
      `${WS_URL}?roomId=${roomId}${clientIdParam}`
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("WebSocket connection timeout"));
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log("WebSocket connected");

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "room-join",
              roomId: roomId,
              clientId: clientId,
            })
          );
        }
        resolve(ws);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`WebSocket connection error: ${error}`);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error connecting to WebSocket:", error);
    return null;
  }
};

export const setUpWebSocketEventHandler = (
  ws: WebSocket,
  isSender: boolean,
  callbacks: {
    onClientJoined?: (clientId: string) => void;
    onFileMetaData?: (metadata: any) => void;
    onTransferProgress?: (progress: number) => void;
    onTransferComplete?: () => void;
    onTransferError?: (error: string) => void;
    onRoomJoined?: (clients: string[]) => void;
  }
) => {
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "room-joined":
          callbacks.onRoomJoined?.(message.clients);
          break;

        case "client-joined":
          callbacks.onClientJoined?.(message.clientId);
          break;

        case "file-metadata":
          callbacks.onFileMetaData?.(message);
          break;

        case "transfer-progress":
          callbacks.onTransferProgress?.(message.progress);
          break;

        case "transfer-complete":
          callbacks.onTransferComplete?.();
          break;

        case "transfer-error":
          callbacks.onTransferError?.(message.error);
          break;

        default:
          console.log("MEssage type not supported");
      }
    } catch (error) {
      console.error(`Error parsing websocket message: ${error}`);
    }
  };

  ws.onclose = () => {
    console.log(`WebSocket connection closed`);
  };


  // if(isSender){
  //   const { file } = useTransferStore.getState();
  //   if(file && ws.readyState === WebSocket.OPEN){
  //     setTimeout(() => {
  //       ws.send(JSON.stringify({
  //         type: 'file-metadata',
  //         roomId: useTransferStore.getState().roomId,
  //         fileName: file.name,
  //         fileSize: file.size,
  //         fromClientId: "sender"
  //       }))
  //     }, 2000);
  //   }
  // }

  return ws;
};
