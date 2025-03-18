import config from "../config/config";
import transferRepository from "../db/repositories/transferRepository";
import emailService from "../services/notifications/emailService";
import s3 from "../services/transfer/s3";



class NotificationJob{

    // hoursTHreshold value is the time left before the expiration of a transfer
    async sendExpirationReminders(hoursThreshold: number = 2): Promise<void>{
        try{
            const expiringTransfers = await transferRepository.getExpiringTransfers(hoursThreshold);
            console.log(`Found ${expiringTransfers.length} transfers about to expire within 2 hours`)

            let sentCount = 0;
            for(const transfer of expiringTransfers){
                if(!transfer.receiverEmail && !transfer.senderEmail){
                    console.log(`No email addresses found for transfer ${transfer.id}, skipping notification`);
                    continue;
                }

                let downloadUrl = transfer.downloadUrl;
                if(!downloadUrl && transfer.s3Key){
                    try{
                        downloadUrl = await s3.generateDownloadUrl(transfer.s3Key, transfer.fileName);
                        await transferRepository.updateDownloadUrl(transfer.id, downloadUrl);
                    }catch(error){
                        console.error(`Error generating the download url for the transfer ${transfer.id}`);
                        continue;
                    }
                }

                //  For webrtc transfers without url, create a web app url
                if(!downloadUrl && transfer.transferType === 'webrtc'){
                    downloadUrl = `${config.cors.origin}/transfers/${transfer.roomId}`;
                }

                // Skip if no downloadUrl found
                if(!downloadUrl){
                    console.log(`No download url found for transfer ${transfer.id}, skipping sending email notification`);
                    continue;
                }

                // send notification to the email id if available
                if(transfer.receiverEmail){
                    try{
                        const sent = await emailService.sendExpirationReminder(transfer.receiverEmail, transfer.fileName, downloadUrl, transfer.expiresAt);

                        if(sent){
                            console.log(`Expiration email sent to the receiver email`);
                            sentCount++;
                        }
                    }catch(error){
                        console.error(`Error sending the email notification to the receiver`)
                    }
                }

                if(transfer.senderEmail && transfer.senderEmail !== transfer.receiverEmail){
                    try{
                        const sent = await emailService.sendExpirationReminder(transfer.senderEmail, transfer.fileName, downloadUrl, transfer.expiresAt);

                        if(sent){
                            console.log(`Expiration email sent to the sender email`);
                            sentCount++;
                        }
                    }catch(error){
                        console.error(`Error sending the email notification to the sender`)
                    }
                }
            }
            console.log(`Successfully sent out ${sentCount} expiration reminder emails`);
        }catch(error){
            console.error(`Error sending the notification: ${error}`);
        }
    }
}

export default new NotificationJob();