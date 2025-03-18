import { FileData, StatusType } from '@prisma/client'
import prisma from './prismaClient';

export interface CreateTransferParams{
    fileName: string;
    fileSize: number;
    transferType: 'webrtc' | 's3';
    s3Key?: string;
    downloadUrl?: string;
    roomId: string;
    senderEmail?: string;
    receiverEmail?: string;
    expiresAt: Date;
}

export class TransferRepository{

    // Create a new entry in the db for new transfer
    async createTransfer(params: CreateTransferParams): Promise<FileData>{
        console.log("inside transfer repository");
        return prisma.fileData.create({
            data: {
                fileName: params.fileName,
                fileSize: params.fileSize,
                transferType: params.transferType,
                s3Key: params.s3Key,
                downloadUrl: params.downloadUrl,
                roomId: params.roomId,
                senderEmail: params.senderEmail,
                receiverEmail: params.receiverEmail,
                status: 'pending',
                expiresAt: params.expiresAt
            }
        });
    }

    // Getting a transfer by its ID
    async getTransferById(id: string): Promise<FileData | null>{
        return prisma.fileData.findFirst({
            where: {
                id: id
            }
        });
    }

    // Getting transfer by roomId
    async getTransferByRoomId(roomId: string): Promise<FileData | null> {
        return prisma.fileData.findUnique({
            where: {
                roomId: roomId
            }
        });
    }

    // Updating a transfer's status
    async updateTransferStatus(id: string, status: StatusType): Promise<FileData>{
        return prisma.fileData.update({
            where: {
                id: id
            },
            data: {
                status: status
            }
        });
    }

    // Update s3 key
    async updateTransferS3Key(transferId: string, key: string): Promise<FileData>{
        return prisma.fileData.update({
            where: {
                id: transferId
            },
            data: {
                s3Key: key
            }
        });
    }

    // Updating transfer's downloadUrl
    async updateDownloadUrl(id: string, downloadUrl: string): Promise<FileData>{
        return await prisma.fileData.update({
            where: {
                id: id
            },
            data: {
                downloadUrl: downloadUrl
            }
        });
    }

    // Get all the expired transfers
    async getExpiredTransfers(): Promise<FileData[]>{
        return prisma.fileData.findMany({
            where: {
                expiresAt: {
                    lt: new Date()
                },
                status: {
                    notIn: ['expired', 'completed']
                }
            }
        });
    }

    // Getting the transfers about to expire
    async getExpiringTransfers(hoursThreshold: number): Promise<FileData[]>{
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() + hoursThreshold);

        return prisma.fileData.findMany({
            where: {
                expiresAt: {
                    gt: new Date(),
                    lt: thresholdDate
                },
                status: {
                    notIn: ['expired', 'completed']
                }
            }
        });
    }

    // Mark transfer as expired
    async markExpiredTransfers(): Promise<number>{
        const result = await prisma.fileData.updateMany({
            where: {
                expiresAt: {
                    lt: new Date()
                },
                status: {
                    notIn: ['expired', 'completed']
                }
            },
            data: {
                status: 'expired'
            }
        });
        return result.count;
    }

    // Getting active transfers
    async getActiveTransfers(): Promise<FileData[]> {
        return prisma.fileData.findMany({
            where: {
                status: 'active'
            }
        });
    }
}

export default new TransferRepository();