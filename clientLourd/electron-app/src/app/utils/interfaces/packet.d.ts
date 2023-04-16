import { Event } from "@app/utils/events/events";
import { MoveInfo, Position } from "@app/utils/interfaces/game/move"
import { ChatMessage } from "@app/utils/interfaces/chat-message";
import { Room } from "@app/utils/interfaces/room";
import { Game, ScrabbleGame } from "@app/utils/interfaces/game/game";
import { User } from "@app/utils/interfaces/user";
import { Tournament } from "./game/tournament";

export interface Packet {
    event: Event;
    payload: ClientPayload | ServerPayload;
}

export interface FirstMovePayload {
    gameId: string;
    coordinates: Position;
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
    | LeaveTournamentPayload
    | StartGamePayload
    | PlayMovePayload
    | IndicePayload
    | ReplaceBotByObserverPayload
    | FirstMovePayload
    | CreateTournamentPayload
    | JoinTournamentPayload
    | StartTournamentPayload
    | JoinTournamentAsObserverPayload
    | ListJoinableTournamentsPayload;

export interface CreateRoomPayload {
    roomName: string;
    userIds: string[];
}

export interface JoinRoomPayload {
    roomId: string;
}

export interface JoinTournamentPayload {
    tournamentId: string;
    password: string;
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
    isPrivate: boolean;
}

export interface CreateTournamentPayload {
    userIds: string[];
    isPrivate: boolean;
}
export interface JoinGamePayload {
    gameId: string;
    password: string;
}

export interface JoinTournamentAsObserverPayload {
    tournamentId: string;
    //password: string;
}

export interface LeaveGamePayload {
    gameId: string;
}

export interface LeaveTournamentPayload {
    tournamentId: string;
}

export interface JoinGameAsObserverPayload {
    gameId: string;
    password: string;
}



export interface LeaveGameAsObserverPayload {
    gameId: string;
}

export interface LeaveTournamentAsObserverPayload {
    tournamentId: string;
}

export interface StartGamePayload {
    gameId: string;
}

export interface StartTournamentPayload {
    tournamentId: string;
}

export interface PlayMovePayload {
    gameId: string;
    moveInfo: MoveInfo;
}

export interface IndicePayload {
    gameId: string;
}

export interface ReplaceBotByObserverPayload {
    gameId: string;
    botId: string;
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
    | JoinedTournamentPayload
    | UserJoinedGamePayload
    | LeftGamePayload
    | LeftTournamentPayload
    | UserLeftGamePayload
    | UserLeftTournamentPayload
    | GameUpdatePayload
    | TimerUpdatePayload
    | GameOverPayload
    | TournamentOverPayload
    | FriendRequestPayload
    | ServerIndicePayload
    | ErrorPayload
    | ListUsersOnlinePayload
    | ListObservableGamesPayload
    | ListObservableTournamentsPayload
    | UserRequestToJoinGamePayload
    | UserRequestToJoinTournamentPayload
    | VerdictJoinGameRequestPayload
    | VerdictJoinTournamentRequestPayload
    | RevokeJoinGameRequestPayload
    | JoinedGameAsObserverPayload
    | FirstMovePayload
    | InvitedToGamePayload
    | UserJoinedTournamentPayload;

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

export interface ListJoinableTournamentsPayload {
    tournaments: Tournament[];
}

export interface JoinedGamePayload {
    game: Game;
}

export interface JoinedTournamentPayload {
    tournament: Tournament;
}

export interface UserJoinedGamePayload {
    gameId: string;
    userId: string;
}

export interface UserJoinedTournamentPayload {
    tournamentId: string;
    userId: string;
}

export interface LeftGamePayload {
    gameId: string;
}

export interface LeftTournamentPayload {
    tournamentId: string;
}

export interface UserLeftGamePayload {
    gameId: string;
    userId: string;
}

export interface UserLeftTournamentPayload {
    tournamentId: string;
    userId: string;
}

export interface GameUpdatePayload {
    game: ScrabbleGame;
}

export interface TournamentUpdatePayload {
    tournament: Tournament;
}

export interface TimerUpdatePayload {
    timer: number;
}

export interface GameOverPayload {
    winnerId: string;
}

export interface TournamentOverPayload {
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

export interface ListObservableGamesPayload {
    games: Game[];
}

export interface ListObservableTournamentsPayload {
    tournaments: Tournament[];
}

export interface UserRequestToJoinGamePayload {
    gameId: string;
    userId: string;
    username: string;
}

export interface UserRequestToJoinTournamentPayload {
    tournamentId: string;
    userId: string;
    username: string;
}

export interface VerdictJoinGameRequestPayload {
    gameId: string;
    userId: string;
}

export interface VerdictJoinTournamentRequestPayload {
    tournamentId: string;
    userId: string;
}

export interface RevokeJoinGameRequestPayload {
    gameId: string;
    userId: string;
}

export interface JoinedGameAsObserverPayload {
    game: Game;
    gameUpdate: ScrabbleGame;
}

export interface InvitedToGamePayload {
    game: Game;
    inviterId: string;
}