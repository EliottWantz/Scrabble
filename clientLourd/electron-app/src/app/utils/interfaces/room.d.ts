import { ChatMessage } from "@app/utils/interfaces/chat-message";

export interface Room {
    roomId: string;
    users: string[];
    messages: ChatMessage[];
}