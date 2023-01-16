export type MessageType = 'player' | 'opponent' | 'system' | 'reserve' | 'help';

export interface ChatMessage {
    playerName?: string;
    data: string;
    from: MessageType;
}
