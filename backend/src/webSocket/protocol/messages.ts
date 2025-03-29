export type MessageType =
  | "room-join"
  | "room-joined"
  | "room-leave"
  | "client-joined"
  | "client-left"
  | "offer"
  | "answer"
  | "ice-candidate"
  | "file-metadata"
  | "transfer-ready"
  | "transfer-progress"
  | "transfer-complete"
  | "transfer-error"
  | "fallback-initiated";

export interface BaseMessage {
  type: MessageType;
  roomId: string;
}

export interface RoomJoinMessage extends BaseMessage {
  type: "room-join";
  clientId: string;
}

export interface RoomJoinedMessage extends BaseMessage {
  type: "room-joined";
  clients: string[];
}

export interface RoomLeaveMessage extends BaseMessage {
  type: "room-leave";
  clientId: string;
}

export interface ClientJoinMessage extends BaseMessage {
  type: "client-joined";
  clientId: string;
}

export interface ClientLeaveMessage extends BaseMessage {
  type: "client-left";
  clientId: string;
}

export interface OfferMessage extends BaseMessage {
  type: "offer";
  sdp: string;
  fromClientId: string;
  toClientId: string;
}

export interface AnswerMessage extends BaseMessage {
  type: "answer";
  sdp: string;
  fromClientId: string;
  toClientId: string;
}

export interface IceCandidateMessage extends BaseMessage {
  type: "ice-candidate";
  candidate: any;
  fromClientId: string;
  toClientId: string;
}

export interface FileMetadataMessage extends BaseMessage {
  type: "file-metadata";
  fileName: string;
  fileSize: number;
  fileType: string;
  fromClientId: string;
}

export interface TransferReadyMessage extends BaseMessage {
  type: "transfer-ready";
  fromClientId: string;
  toClientId: string;
}

export interface TransferProgressMessage extends BaseMessage {
  type: "transfer-progress";
  progress: number;
  fromClientId: string;
  toClientId: string;
}

export interface TransferCompleteMessage extends BaseMessage {
  type: "transfer-complete";
  fromClientId: string;
  toClientId: string;
}

export interface TransferErrorMessage extends BaseMessage {
  type: "transfer-error";
  error: string;
  fromClientId: string;
  toClientId: string;
}

export interface FallbackInitiatedMessage extends BaseMessage {
  type: "fallback-initiated";
  downloadUrl: string;
  expiresAt: string;
  fromClientId: string;
  toClientId: string;
}

export type WebSocketMessage =
  | RoomJoinMessage
  | RoomJoinedMessage
  | RoomLeaveMessage
  | ClientLeaveMessage
  | ClientJoinMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | FileMetadataMessage
  | TransferReadyMessage
  | TransferProgressMessage
  | TransferCompleteMessage
  | TransferErrorMessage
  | FallbackInitiatedMessage;
