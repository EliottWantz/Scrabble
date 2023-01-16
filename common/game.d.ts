import { Objective } from '@common/objectives';
import { Player, PlayerInfo } from '@common/player';
import { GameMode } from './game-mode';
import { Node } from './grid/node';

export interface GameOptions {
    playerName: string;
    playerId: string;
    time: number;
    dictionary: string;
    gameMode: GameMode;
    opponentName?: string;
    isMultiplayer: boolean;
}
export interface gameModeData {
    gameMode: GameMode;
}
export interface GameInfo {
    playerTime: number;
    dictionary: string;
}

export interface JoinMultiplayerOption {
    gameId: string;
    playerInfo: PlayerInfo;
}

export interface Game {
    id: string;
    creator: Player;
    opponent: Player | null;
    dict: string;
    grid: Node[][];
    letterReserve: string[];
    time: number;
    timer: number;
    capacity: number;
    skipCounter: number;
    hasEnded: boolean;
    mode: string;
    isMultiplayer: boolean;
    publicObjectives?: Objective[];
    startedTime?: Date;
    totalTime: number;
}

export interface ReconnectionInfo {
    id: string;
    game: Game;
}
