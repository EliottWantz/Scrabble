import { Event } from "@app/utils/events/events";
import { MoveInfo } from "@app/utils/interfaces/game/move"
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { Room } from "@app/utils/interfaces/room";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { User } from "@app/utils/interfaces/user";

export interface Packet {
    event: Event;
    payload: ClientPayload | ServerPayload;
}

export type ClientPayload = ChatMessage
| CreateRoomPayload
| JoinRoomPayload
| LeaveRoomPayload
| CreateDMRoomPayload
| LeaveDMRoomPayload
| CreateGamePayload
| JoinGamePayload
| LeaveGamePayload
| StartGamePayload
| PlayMovePayload
| IndicePayload;

export interface CreateRoomPayload {
    roomName: string;
    userIds: string[];
}

export interface JoinRoomPayload {
    roomId: string;
}


export interface LeaveRoomPayload {
    roomId: string;
}

export interface CreateDMRoomPayload {
    username: string;
    toId: string;
    toUsername: string;
}

export interface LeaveDMRoomPayload {
    roomId: string;
}

export interface CreateGamePayload {
    password: string;
    userIds: string[];
}

export interface JoinGamePayload {
    gameId: string;
    password: string;
}

export interface LeaveGamePayload {
    gameId: string;
}

export interface StartGamePayload {
    gameId: string;
}

export interface PlayMovePayload {
    gameId: string;
    moveInfo: MoveInfo;
}

export interface IndicePayload {
    gameId: string;
}

export type ServerPayload = JoinedRoomPayload
| LeftRoomPayload
| UserJoinedRoomPayload
| UserLeftRoomPayload
| JoinedDMRoomPayload
| LeftDMRoomPayload
| UserJoinedDMRoomPayload
| UserLeftDMRoomPayload
| ListUsersPayload
| NewUserPayload
| ListChatRoomsPayload
| ListJoinableGamesPayload
| JoinedGamePayload
| UserJoinedGamePayload
| LeftGamePayload
| UserLeftGamePayload
| GameUpdatePayload
| TimerUpdatePayload
| GameOverPayload
| FriendRequestPayload
| ServerIndicePayload
| ErrorPayload
| ListUsersOnlinePayload;

export interface JoinedRoomPayload {
    roomId: string;
    roomName: string;
    userIds: string[];
    messages: ChatMessage[];
}

export interface LeftRoomPayload {
    roomId: string;
}

export interface UserJoinedRoomPayload {
    roomId: string;
    userId: string;
}

export interface UserLeftRoomPayload {
    roomId: string;
    userId: string;
}

export interface JoinedDMRoomPayload {
    roomId: string;
    roomName: string;
    userIds: string[];
    messages: ChatMessage[];
}

export interface LeftDMRoomPayload {
    roomId: string;
}

export interface UserJoinedDMRoomPayload {
    roomId: string;
    userId: string;
}

export interface UserLeftDMRoomPayload {
    roomId: string;
    userId: string;
}

export interface ListUsersPayload {
    users: User[];
}

export interface NewUserPayload {
    user: User;
}

export interface ListChatRoomsPayload {
    rooms: Room[];
}

export interface ListJoinableGamesPayload {
    games: Game[];
}

export interface JoinedGamePayload {
    game: Game;
}

export interface UserJoinedGamePayload {
    gameId: string;
    userId: string;
}

export interface LeftGamePayload {
    gameId: string;
}

export interface UserLeftGamePayload {
    gameId: string;
    userId: string;
}

export interface GameUpdatePayload {
    game: ScrabbleGame;
}

export interface TimerUpdatePayload {
    timer: number;
}

export interface GameOverPayload {
    winnerId: string;
}

export interface FriendRequestPayload {
    fromId: string;
    fromUsername: string;
}

export interface ServerIndicePayload {
    moves: MoveInfo[];
}

export interface ErrorPayload {
    error: string;
}

export interface ListUsersOnlinePayload {
    users: User[];
}