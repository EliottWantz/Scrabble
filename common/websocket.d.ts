import { Command, PlaceCommand } from '@common/command';
import { Game, JoinMultiplayerOption } from '@common/game';
import { Letter } from '@common/grid/node';
import { GameHistory, Player, PlayerInfo, VirtualPlayerName } from '@common/player';
import { ChatMessage } from './chatMessage';
import { DictHeaders } from './dictionary';

export interface ClientEvents {
    message: (msg: string, room: string) => void;
    command: (command: Command, room: string) => void;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
    removeOpponent: (room: string) => void;
    deleteGame: (room: string) => void;
    abandonGame: (room: string) => void;
    validateName: (joinMultiplayerOption: JoinMultiplayerOption) => void;
    updateName: (playerName: string) => void;
    updateScore: (score: number, gameId: string) => void;
    updateEasel: (easel: Letter[], playerId: string, gameId: string) => void;
    shadowPlaceLetters: (placeCommand: PlaceCommand, game: Game, playerId: string) => void;
    requestGameUpdate: (gameId: string) => void;
}

export interface ServerEvents {
    message: (msg: ChatMessage) => void;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
    playerJoined: (player: PlayerInfo) => void;
    playerInfo: (player: PlayerInfo) => void;
    playerLeft: (player: PlayerInfo) => void;
    playerAbandoned: () => void;
    startGame: (game: Game) => void;
    rejected: (player: PlayerInfo) => void;
    updateGamesAvailable: () => void;
    validName: (isValid: boolean) => void;
    nameUpdated: () => void;
    commandSuccess: (success: boolean, command: Command) => void;
    updateGame: (game: Game) => void;
    updateTimer: (timer: number) => void;
    endOfGame: () => void;
    shadowPlaceLetters: (command: PlaceCommand) => void;
    badPlaceCommandPosition: () => void;
    virtualPlayerChange: (virtualPlayers: VirtualPlayerName[]) => void;
    resetHistory: (History: GameHistory[]) => void;
    newDict: (dict: DictHeaders[]) => void;
    nonExistingDict: () => void;
}

export interface SocketInfo {
    gameId: string;
    player: Player;
}

export interface SocketAuth {
    playerName: string;
    lastPlayerInfo?: PlayerInfo;
}
