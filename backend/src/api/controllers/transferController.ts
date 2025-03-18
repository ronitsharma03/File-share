import { Request, Response } from "express";
import fileValidator from "../../services/file/validation";
import config from "../../config/config";
import { v4 as uuidv4 } from "uuid";
import transferService from "../../services/transfer/transferService";
import transferRepository from "../../db/repositories/transferRepository";
import s3 from "../../services/transfer/s3";
import emailService from "../../services/notifications/emailService";

class TransferController {
  public async createTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { fileName, fileSize, transferType, senderEmail, receiverEmail } =
        req.body;

      const validationResult = fileValidator.validateFile(
        fileName,
        fileSize,
        config.file.allowedTypes
      );
      if (!validationResult.valid) {
        res.status(400).json({
          error: validationResult.error,
        });
        return;
      }

      const roomId = uuidv4();

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + config.file.expiryHours);
      console.log("generated roomID: ", roomId);
      // create a transfer record
      console.log("Before transfer");
      const transfer = await transferService.createTransfer({
        fileName,
        fileSize,
        transferType,
        roomId,
        senderEmail,
        receiverEmail,
        expiresAt: expiryDate
      });
      console.log(transfer);

      res.status(201).json({
        id: transfer.id,
        roomId: transfer.roomId,
        expiresAt: transfer.expiresAt,
      });

    } catch (error) {
      res.status(500).json({ error: `Failed to create transfer: ${error}` });
    }
  }


  public async getTransferStatus(req: Request, res: Response): Promise<any> {
    try{
      const { id } = req.params;
      const transfer = await transferRepository.getTransferById(id);

      if(!transfer){
        res.status(404).json({
          error: 'Transfer not found'
        });
        return;
      }

      res.status(200).json({
        id: transfer.id,
        fileName: transfer.fileName,
        fileSize: transfer.fileSize,
        status: transfer.status,
        expiresAt: transfer.expiresAt,
        downloadUrl: transfer.downloadUrl
      });

    }catch(error){
      console.error(`Error: ${error}`);
      res.status(500).json({
        error: 'Failed to get the transfer status'
      });
    }
  }


  public async createS3UploadUrl(req: Request, res: Response): Promise<void>{
    try{
      const { fileName, contentType, transferId } = req.body;
      const {url, key} = await s3.generateUploadUrl(fileName, contentType);

      if(transferId){
        await transferService.updateTransferS3Key(transferId, key);
      }

      res.status(200).json({
        uploadUrl: url,
        key: key
      });
    }catch(error){
      console.error(`Error: ${error}`)
      res.status(500).json({
        error: 'Failed to create the S3 upload url'
      })
    }
  }

  public async completeS3Upload(req: Request, res: Response): Promise<void>{
    try{
      const { transferId, s3Key } = req.body;

      const transfer = await transferRepository.getTransferById(transferId);

      if(!transfer){
        res.status(404).json({
          error: 'Transfer not found'
        });
        return;
      }

      const downloadUrl = await s3.generateDownloadUrl(s3Key || transfer.s3Key, transfer.fileName);

      //Update the transfer with download url and status
      await transferRepository.updateDownloadUrl(transferId, downloadUrl);
      await transferService.updateTransferStatus(transferId, 'completed');

      // Send notification email to the receiver email if provided
      if(transfer.receiverEmail){
        await emailService.sendTransferNotification(transfer.receiverEmail, transfer.fileName, downloadUrl, transfer.expiresAt);
      }

      res.status(200).json({
        downloadUrl: downloadUrl
      });

    }catch(error){
      console.error(`Error: ${error}`);
      res.status(500).json({
        error: error
      })
    }
  }
}
 

export default new TransferController();