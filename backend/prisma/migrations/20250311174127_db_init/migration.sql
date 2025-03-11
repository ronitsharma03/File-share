-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('pending', 'expired', 'completed');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('webrtc', 's3');

-- CreateTable
CREATE TABLE "FileData" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "transferType" "TransferType" NOT NULL,
    "s3Key" TEXT,
    "downloadUrl" TEXT,
    "roomId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "status" "StatusType" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileData_roomId_key" ON "FileData"("roomId");

-- CreateIndex
CREATE INDEX "FileData_expiresAt_idx" ON "FileData"("expiresAt");
