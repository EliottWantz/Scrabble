import { Event } from "@app/utils/events/events";
import { MoveInfo } from "@app/utils/interfaces/game/move"
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { Room } from "@app/utils/interfaces/room";
import { Game } from "@app/utils/interfaces/game/game";
import { User } from "@app/utils/interfaces/user";

export interface Packet {
    event: Event;
    payload: ClientPayload | ServerPayload;
}

export type ClientPayload = JoinRoomPayload | JoinDMPayload | CreateRoomPayload | LeaveRoomPayload | PlayMovePayload | ChatMessage | CreateGameRoomPayload | JoinGameRoomPayload | IndiceClientPayload;
export type ServerPayload = Room
| ChatMessage
| GameUpdatePayload
| JoinableGamesPayload
| JoinedRoomPayload
| TimerUpdatePayload
| UserJoinedPayload
| ErrorPayload
| IndiceServerPayload
| {users: User[]}
| {user: User};

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
    users: User[];
    messages: ChatMessage[];
    creatorId: string;
    isGameRoom: boolean;
}

export interface UserJoinedPayload {
    roomId: string;
    user: User;
}

export interface GameUpdatePayload {
    game: Game;
}

export interface TimerUpdatePayload {
    timer: number;
}

export interface ErrorPayload {
    error: string;
}

export interface IndiceClientPayload {
    gameId: string;
}

export interface IndiceServerPayload {
    moves: MoveInfo[];
}