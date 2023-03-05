import { Event } from "@app/utils/events/events";
//import { ChatMessage } from "@app/utils/interfaces/chat-message";
//import { Room } from "@app/utils/interfaces/room";

export interface Packet {
    event: Event;
    payload: any;
}