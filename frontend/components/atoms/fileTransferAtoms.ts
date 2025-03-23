import { create } from 'zustand';


type ConnectionStateType = 'disconnected' | 'connected' | 'pending' | 'failed' | null;

interface TransferStore {
    transferId: string | null;
    setTransferId: (id: string) => void;

    roomId: string | null;
    setRoomId: (id: string) => void;

    file: File | null;
    setFile: (file: File | null) => void;

    uploadProgress : number;
    setUploadProgress: (progress: number) => void;

    connnectionState: ConnectionStateType;
    setConnectionState: (state: ConnectionStateType) => void;

}

export const useTransferStore = create<TransferStore>((set) => ({
    transferId: null,
    setTransferId: (id: string) => set({transferId: id}),

    roomId: null,
    setRoomId: (id: string) => set({roomId: id}),

    file: null,
    setFile: (file: File | null) => set({file: file}),

    uploadProgress: 0,
    setUploadProgress: (progress: number) => set({uploadProgress: progress}),

    connnectionState: 'disconnected',
    setConnectionState: (state: ConnectionStateType) => set({connnectionState: state})
}));