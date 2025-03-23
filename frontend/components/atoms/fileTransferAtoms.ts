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

    isSending: boolean;
    setIsSending: (value: boolean) => void;

    showConfirmButtons: boolean;
    setShowConfirmButtons: (value: boolean) => void;

    wsConnection: WebSocket | null;
    setWebSocketConnection: (ws: WebSocket) => void;

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
    setConnectionState: (state: ConnectionStateType) => set({connnectionState: state}),

    isSending: false,
    setIsSending: (value: boolean) => set({isSending: value}),

    showConfirmButtons: false,
    setShowConfirmButtons: (value: boolean) => set({showConfirmButtons: value}),

    wsConnection: null,
    setWebSocketConnection: (ws: WebSocket) => set({wsConnection: ws}),
}));