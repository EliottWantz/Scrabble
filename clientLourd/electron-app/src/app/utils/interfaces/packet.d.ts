import { Event } from "@app/utils/events/events";
import { MoveInfo } from "@app/utils/interfaces/game/move"
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { Room } from "@app/utils/interfaces/room";
import { Game } from "@app/utils/interfaces/game/game";

export interface Packet {
    event: Event;
    payload: ClientPayload | ServerPayload;
}

export type ClientPayload = JoinRoomPayload | JoinDMPayload | CreateRoomPayload | LeaveRoomPayload | PlayMovePayload | ChatMessage;
export type ServerPayload = Room | ChatMessage | Game;

export interface JoinRoomPayload {
    roomID: string;
}

export interface JoinDMPayload {
    username: string;
    toID: string;
    toUsername: string;
}

export interface CreateRoomPayload {
    roomName: string;
    userIDs: string[];
}

export interface LeaveRoomPayload {
    roomID: string;
}

export interface PlayMovePayload {
    gameID: string;
    moveInfo: MoveInfo;
}