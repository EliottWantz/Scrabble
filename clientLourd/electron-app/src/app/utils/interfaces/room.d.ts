import { ChatMessage } from "@app/utils/interfaces/chat-message";

export interface Room {
    ID: string;
    Name: string;
    UserIDs: string[];
    messages: ChatMessage[];
}