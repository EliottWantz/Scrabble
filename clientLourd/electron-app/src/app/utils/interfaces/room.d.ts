import { ChatMessage } from "@app/utils/interfaces/chat-message";

export interface Room {
    ID: string;
    users: string[];
    messages: ChatMessage[];
    creatorID: string;
    isGameRoom: boolean;
}