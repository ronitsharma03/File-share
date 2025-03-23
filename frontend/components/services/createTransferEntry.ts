import axios from 'axios';
import { toast } from 'sonner';

interface FileData {
    transferId: string;
    roomId: string;
    expiresAt: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export const createTransferEntry = async (fileData: File, senderEmail: string): Promise<FileData | null> => {
    try{
        const response = await axios.post(`${API_URL}/api/v1/transfers`, {
            fileName: fileData.name,
            fileSize: fileData.size,
            transferType: 'webrtc',
            senderEmail: senderEmail
        });

        if(!response.data){
            toast.error("Error initiating a transfer..");
            return null;
        }

        toast.success("Successfully initiated a transfer..")
        return response.data;
    }catch(error){
        console.error("Error creating a transfer");
        toast.error("Error initiating a transfer..");
        return null;
    }
}