import s3 from "../services/transfer/s3";
import transferRepository from "../db/repositories/transferRepository";

export class CleanupJob{
    async cleanExpiredTransfers(): Promise<void>{
        try{
            const expiredTransfers = await transferRepository.getExpiredTransfers();
            if(!expiredTransfers){
                return;
            }

            console.log(`Found ${expiredTransfers.length} expipred transfers to clean`);
            for(const transfer of expiredTransfers){
                if(transfer.transferType === 's3' && transfer.s3Key){
                    try{
                        await s3.deleteFile(transfer.s3Key);
                    }catch(error){
                        console.error(`Error cleaning expired S3 transfer: ${error}`);
                    }
                }
                // Update the transfer status to expired

                await transferRepository.updateTransferStatus(transfer.id, 'expired');
                console.log(`Cleaned up expired transfer ${transfer.id}`);
            }

            // Bulk update for the remaining expired transfers
            const updatedCount = await transferRepository.markExpiredTransfers();
            if(updatedCount > 0){
                console.log(`Marked ${updatedCount} additional transfers as expired`);
            }

        }catch(error){
            console.error(`Error cleaning expired transfers: ${error}`);
        }
    }
}

export default new CleanupJob();