import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import roomManager from "./webSocket/rooms/roomManager";
import { handleMessages } from "./webSocket/handlers/messageHandler";

const setupWebSocketServer = (server: HttpServer): WebSocketServer => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {
    const params = url.parse(req.url || "", true).query;
    const roomId = params.roomId as string;
    const clientId = (params.clientId as string) || uuidv4();

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessages(ws, message);
        console.log(`Message: ${data.toString()}`);
      } catch (error) {
        console.error(`Error: ${error}`);
      }
    });

    ws.on("close", () => {
      clearInterval(pingInterval);

      roomManager.removeClientFromRoom(ws);

      console.log("Client got disconnected");
    });
    ws.on("error", () => {
      console.error(`Error setting ws server`);
    });
  });

  return wss;
};

export default setupWebSocketServer;
