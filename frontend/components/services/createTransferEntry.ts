import axios from "axios";
import { toast } from "sonner";

interface FileData {
  transferId: string;
  roomId: string;
  expiresAt: Date;
}

interface result {
  data: FileData | null;
  status: boolean;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export const createTransferEntry = async (
  fileData: File,
  senderEmail: string
): Promise<result | null> => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/transfers`, {
      fileName: fileData.name,
      fileSize: fileData.size,
      transferType: "webrtc",
      senderEmail: senderEmail,
    });

    if (!response.data) {
      return null;
    }
    return { data: response.data, status: true };
  } catch (error) {
    console.error("Error creating a transfer");
    return { data: null, status: false, error: `${error}` };
  }
};
