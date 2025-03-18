/*
  Warnings:

  - You are about to alter the column `fileSize` on the `FileData` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "FileData" ALTER COLUMN "fileSize" SET DATA TYPE INTEGER;
