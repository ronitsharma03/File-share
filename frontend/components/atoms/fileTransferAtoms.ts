import { create } from 'zustand';


type ConnectionStateType = 'disconnected' | 'connected' | 'connecting' | 'failed' | null;

interface fileMetaDataType {
    fileName: string;
    fileSize: number;
    fileType: string;
};
interface TransferStore {
    transferId: string | null;
    setTransferId: (id: string) => void;

    roomId: string | null;
    setRoomId: (id: string) => void;

    file: File | null;
    setFile: (file: File | null) => void;

    uploadProgress : number;
    setUploadProgress: (progress: number) => void;

    connectionState: ConnectionStateType;
    setConnectionState: (state: ConnectionStateType) => void;

    isSending: boolean;
    setIsSending: (value: boolean) => void;

    showConfirmButtons: boolean;
    setShowConfirmButtons: (value: boolean) => void;

    wsConnection: WebSocket | null;
    setWebSocketConnection: (ws: WebSocket | null) => void;

    connectedClients: string[];
    addConnectedClient: (clientId: string) => void;
    removeConnectedClient: (clientId: string) => void;

    isConnecting: boolean;
    setIsConnecting: (value: boolean) => void;

    fileMetaData: fileMetaDataType | null;
    setFileMetaData: (fileData: fileMetaDataType | null) => void;

    downloadUrl: string | null;
    setDownloadUrl: (url: string) => void;

    userId: string;
    setUserId: (id: string) => void;

    clientId: string;
    setClientId: (id: string) => void;

    peerConnection: RTCPeerConnection | null;
    setPeerConnection: (peer: RTCPeerConnection) => void;

    channel: RTCDataChannel | null;
    setChannel: (dataChannel: RTCDataChannel) => void;

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

    connectionState: null,
    setConnectionState: (state: ConnectionStateType) => set({connectionState: state}),

    isSending: false,
    setIsSending: (value: boolean) => set({isSending: value}),

    showConfirmButtons: false,
    setShowConfirmButtons: (value: boolean) => set({showConfirmButtons: value}),

    wsConnection: null,
    setWebSocketConnection: (ws: WebSocket | null) => set({wsConnection: ws}),

    connectedClients: [],
    addConnectedClient: (clientId: string) => set((state) => ({
        connectedClients: [...state.connectedClients, clientId]
    })),
    removeConnectedClient: (clientId: string) => set((state) => ({
        connectedClients: state.connectedClients.filter(id => id !== clientId)
    })),

    isConnecting: false,
    setIsConnecting: (value: boolean) => set({isConnecting: value}),

    fileMetaData: null,
    setFileMetaData: (fileData: fileMetaDataType | null) => set({fileMetaData: fileData}),

    downloadUrl: null,
    setDownloadUrl: (url: string) => set({downloadUrl: url}),

    userId: '',
    setUserId: (id: string) => set({userId: id}),

    clientId: '',
    setClientId: (id: string) => set({clientId: id}),

    peerConnection: null,
    setPeerConnection: (peer: RTCPeerConnection) => set({peerConnection: peer}),

    channel: null,
    setChannel: (dataChannel: RTCDataChannel) => set({channel: dataChannel}),
    

}));