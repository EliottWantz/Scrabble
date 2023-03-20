import { ChatMessage } from "@app/utils/interfaces/chat-message";

export interface Room {
    id: string;
    name: string;
    userIds: string[];
    messages: ChatMessage[];
}