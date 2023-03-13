import { Event } from "@app/utils/events/events";
import { MoveInfo } from "@app/utils/interfaces/game/move"
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { Room } from "@app/utils/interfaces/room";
import { Game } from "@app/utils/interfaces/game/game";

export interface Packet {
    event: Event;
    payload: ClientPayload | ServerPayload;
}

export type ClientPayload = JoinRoomPayload | JoinDMPayload | CreateRoomPayload | LeaveRoomPayload | PlayMovePayload | ChatMessage | CreateGameRoomPayload | JoinGameRoomPayload;
export type ServerPayload = Room | ChatMessage | Game | JoinableGamesPayload | JoinedRoomPayload | number;

export interface JoinRoomPayload {
    roomId: string;
}

export interface JoinDMPayload {
    username: string;
    toId: string;
    toUsername: string;
}

export interface CreateRoomPayload {
    roomName: string;
    userIds: string[];
}

export interface CreateGameRoomPayload {
    userIds: string[];
}

export interface JoinGameRoomPayload {
    roomId: string;
}

export interface StartGame {
    roomId: string;
}

export interface LeaveRoomPayload {
    roomId: string;
}

export interface PlayMovePayload {
    gameId: string;
    moveInfo: MoveInfo;
}

export interface JoinableGamesPayload {
    games: Room[];
}

export interface JoinedRoomPayload {
    roomId: string;
    users: string[];
    messages: ChatMessage[];
    creatorID: string;
    isGameRoom: boolean;
}