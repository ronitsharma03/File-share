import config from "../../config/config";
import transferRepository from "../../db/repositories/transferRepository";
import { FileData } from '@prisma/client';

export interface FileMetaDataType {
    fileName: string;
    fileSize: number;
    fileType: string;
    senderClient: string;
}

export interface CreateTransferParams {
  fileName: string;
  fileSize: number;
  transferType: 'webrtc' | 's3';
  roomId: string;
  senderEmail?: string;
  receiverEmail?: string;
  expiresAt: Date;
}

class TransferService {

  async createTransfer(params: CreateTransferParams): Promise<FileData> {
    console.log("inside transfer service")
    return transferRepository.createTransfer({
      fileName: params.fileName,
      fileSize: params.fileSize,
      transferType: params.transferType,
      s3Key: "",  // Will be updated later if S3
      roomId: params.roomId,
      senderEmail: params.senderEmail,
      receiverEmail: params.receiverEmail,
      expiresAt: params.expiresAt
    });
  }

  async storeFileMetaData(
    roomId: string,
    metadata: FileMetaDataType
  ): Promise<FileData> {
    return transferRepository.createTransfer({
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      transferType: "webrtc",
      s3Key: "",
      roomId: roomId,
      expiresAt: new Date(Date.now() + config.file.expiryHours * 60*60*1000),
    });
  }

  async updateTransferStatus(
    roomId: string,
    status: "pending" | "active" | "completed" | "expired",
    error?: string
  ): Promise<FileData | null> {
    const transfer = await transferRepository.getTransferByRoomId(roomId);
    if (transfer) {
      return transferRepository.updateTransferStatus(transfer.id, status);
    }
    return null;
  }


  async updateTransferS3Key(id: string, key: string): Promise<boolean> {
    const updateTransferS3Key = transferRepository.updateTransferS3Key(id, key);
    if(!updateTransferS3Key){
      return false;
    }
    return true;
  }
}

export default new TransferService();
