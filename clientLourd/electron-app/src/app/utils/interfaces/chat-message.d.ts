export interface ChatMessage {
    roomID: string;
    message: string;
    from: string;
    fromID: string;
    timestamp?: string;
}