-- AlterTable
ALTER TABLE "FileData" ALTER COLUMN "senderEmail" DROP NOT NULL,
ALTER COLUMN "receiverEmail" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "FileData_status_idx" ON "FileData"("status");
