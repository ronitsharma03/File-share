import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";

interface client {
  ws: WebSocket;
  id: string;
}

class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Map<string, client>>;
  private clientRooms: Map<WebSocket, { roomId: string; clientId: string }>;

  private constructor() {
    this.rooms = new Map();
    this.clientRooms = new Map();
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public createRoom(): string {
    const roomId = uuidv4();
    this.rooms.set(roomId, new Map<string, client>());
    return roomId;
  }

  public addClientToRoom(
    ws: WebSocket,
    roomId: string,
    clientId: string = uuidv4()
  ): string {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map<string, client>();
      this.rooms.set(roomId, room);
    }

    room.set(clientId, { ws, id: clientId });
    this.clientRooms.set(ws, { roomId, clientId });

    return clientId;
  }

  public removeClientFromRoom(ws: WebSocket): void {
    const clientInfo = this.clientRooms.get(ws);
    if (!clientInfo) {
      return;
    }

    const { clientId, roomId } = clientInfo;
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(clientId);

    if (room.size === 0) {
      this.rooms.delete(roomId);
    }

    this.clientRooms.delete(ws);
  }

  public getOtherClientsInRoom(roomId: string, senderWs: WebSocket): client[] {
    const senderInfo = this.clientRooms.get(senderWs);
    if (!senderInfo) return [];

    return Array.from(this.rooms.get(roomId)?.values() || []).filter(
      (client) => client.id !== senderInfo.clientId
    );
  }

  public getClientsInRoom(roomId: string): client[] {
    return Array.from(this.rooms.get(roomId)?.values() || []);
  }

  public getClientIdsInRoom(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId)?.keys() || []);
  }

  public getClientById(roomId: string, clientId: string): client | undefined {
    return this.rooms.get(roomId)?.get(clientId);
  }

  public getClientInfo(ws: WebSocket): { roomId: string, clientId: string } | undefined {
    return this.clientRooms.get(ws);
  }

  public roomExists(roomId: string): boolean{
    return this.rooms.has(roomId);
  }
}

export default RoomManager.getInstance();