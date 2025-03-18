import { WebSocketMessage } from "../protocol/messages";
import { WebSocket, WebSocketServer } from "ws";
import roomManager from "../rooms/roomManager";
import transferService, { FileMetaDataType } from "../../services/transfer/transferService";
import transferRepository from "../../db/repositories/transferRepository";

export const handleMessages = async (
  ws: WebSocket,
  message: WebSocketMessage
): Promise<void> => {
  try {
    switch (message.type) {
      case "room-join":
        handleRoomJoin(ws, message);
        break;

      case "room-joined":
        break;

      case "room-leave":
        handleRoomLeave(ws);
        break;

      case "client-joined":
        break;

      case "client-left":
        break;

      case "offer":
        handleOffer(ws, message);
        break;

      case "answer":
        handleAnswer(ws, message);
        break;

      case "ice-candidate":
        handleIceCandidate(ws, message);
        break;

      case "file-metadata":
        handleFileMetaData(ws, message);
        break;

      case "transfer-ready":
        handleTransferReady(ws, message);
        break;

      case "transfer-progress":
        handleTransferProgress(ws, message);
        break;

      case "transfer-complete":
        handleTransferComplete(ws, message);
        break;

      case "transfer-error":
        handleTransferError(ws, message);
        break;

      case "fallback-initiated":
        break;

      default:
        console.warn(
          `Warning: ${(message as any).type} message-type not supported`
        );
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const handleRoomJoin = (
  ws: WebSocket,
  message: WebSocketMessage & { type: "room-join" }
): void => {
  const { roomId, clientId } = message;

  const assignedClientId = roomManager.addClientToRoom(ws, roomId);

  ws.send(
    JSON.stringify({
      type: "room-joined",
      roomId,
      clients: roomManager.getClientIdsInRoom(roomId),
    })
  );

  // Notify other clients in the same room
  const otherClients = roomManager.getOtherClientsInRoom(roomId, ws);
  otherClients.forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "client-joined",
        roomId,
        clientId: assignedClientId,
      })
    );
  });
};

const handleRoomLeave = (ws: WebSocket): void => {
  const clientInfo = roomManager.getClientInfo(ws);
  if (!clientInfo) return;

  const { roomId, clientId } = clientInfo;

  roomManager.removeClientFromRoom(ws);

  const otherClients = roomManager.getOtherClientsInRoom(roomId, ws);
  otherClients.forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "client-left",
        roomId,
        clientId,
      })
    );
  });
};

const handleOffer = (
  ws: WebSocket,
  message: WebSocketMessage & { type: "offer" }
): void => {
  const { roomId, toClientId, fromClientId, sdp } = message;
  const targetClient = roomManager.getClientById(roomId, toClientId);
  if (targetClient) {
    targetClient.ws.send(
      JSON.stringify({
        type: "offer",
        roomId,
        sdp,
        fromClientId,
        toClientId,
      })
    );
  }
};

const handleAnswer = (
  ws: WebSocket,
  message: WebSocketMessage & { type: "answer" }
): void => {
  const { roomId, toClientId, fromClientId, sdp } = message;
  const targetClient = roomManager.getClientById(roomId, toClientId);
  if (targetClient) {
    targetClient.ws.send(
      JSON.stringify({
        type: "answer",
        roomId,
        sdp,
        fromClientId,
        toClientId,
      })
    );
  }
};

const handleIceCandidate = (
  ws: WebSocket,
  message: WebSocketMessage & { type: "ice-candidate" }
): void => {
  const { roomId, candidate, toClientId, fromClientId } = message;
  const targetClient = roomManager.getClientById(roomId, toClientId);
  if (targetClient) {
    targetClient.ws.send(
      JSON.stringify({
        type: "ice-candidate",
        roomId,
        candidate,
        fromClientId,
        toClientId,
      })
    );
  }
};

const handleFileMetaData = async (
  ws: WebSocket,
  message: WebSocketMessage & { type: "file-metadata" }
): Promise<void> => {
  const { roomId, fileName, fileSize, fileType, fromClientId } = message;

  // store the file Metadata
  const fileMetaDataExists = await transferRepository.getTransferByRoomId(roomId);
  if(!fileMetaDataExists){
    const metaData: FileMetaDataType = {
      fileName,
      fileSize,
      fileType,
      senderClient: fromClientId
    }

  await transferService.storeFileMetaData(roomId, metaData);
    console.log(`New transfer created for room id: ${roomId}`);
  }
  else{
    console.log(`Filemetadata already exists for the transfer for roomid: ${roomId}`);
  }
  // Broadcast filemetadata to the other clients in room
  const otherClients = roomManager.getOtherClientsInRoom(roomId, ws);
  if (otherClients) {
    otherClients.forEach((client) => {
      client.ws.send(
        JSON.stringify({
          type: "file-metadata",
          roomId,
          fileName,
          fileSize,
          fileType,
          fromClientId,
        })
      );
    });
  }
};

const handleTransferReady = (
  ws: WebSocket,
  message: WebSocketMessage & { type: "transfer-ready" }
): void => {
  const { roomId, toClientId, fromClientId } = message;
  const targetClient = roomManager.getClientById(roomId, toClientId);
  if (targetClient) {
    targetClient.ws.send(
      JSON.stringify({
        type: "transfer-ready",
        roomId,
        fromClientId,
        toClientId,
      })
    );
  }
};

const handleTransferProgress = (
  ws: WebSocket,
  message: WebSocketMessage & { type: "transfer-progress" }
): void => {
  const { roomId, toClientId, fromClientId, progress } = message;
  const targetClient = roomManager.getClientById(roomId, toClientId);
  if(targetClient){
    targetClient.ws.send(JSON.stringify({
      type: 'transfer-progress',
      roomId,
      fromClientId,
      toClientId,
      progress
    }));
  }
};


const handleTransferComplete = async (ws: WebSocket, message: WebSocketMessage & { type: 'transfer-complete' }): Promise<void> => {
  const { roomId, fromClientId, toClientId } = message;

  // Update transfer Status also here
  await transferService.updateTransferStatus(roomId, 'completed');
  // Broadcast the message to targetClient
  const targetClient = roomManager.getClientById(roomId, toClientId);
  if(targetClient){
    targetClient.ws.send(JSON.stringify({
      type: 'transfer-complete',
      roomId,
      fromClientId,
      toClientId
    }));
  }

}

const handleTransferError = (ws: WebSocket, message: WebSocketMessage & { type: 'transfer-error'}): void => {
  const { roomId, toClientId, fromClientId, error } = message;
  // Update the status of transfer

  // Broadcast the message
  const targetCleint = roomManager.getClientById(roomId, toClientId);
  if(targetCleint){
    targetCleint.ws.send(JSON.stringify({
      type: 'transfer-error',
      roomId,
      toClientId,
      fromClientId,
      error
    }));
  }
}
