import { ChatMessage } from "@app/utils/interfaces/chat-message";

export interface Room {
    id: string;
    userIds: string[];
    messages: ChatMessage[];
    creatorId: string;
    isGameRoom: boolean;
}