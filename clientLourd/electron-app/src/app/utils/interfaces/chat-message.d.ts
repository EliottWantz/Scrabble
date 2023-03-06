export interface ChatMessage {
    roomId: string;
    message: string;
    from: string;
    fromId: string;
    timestamp?: string;
}