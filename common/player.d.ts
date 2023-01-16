import { Letter } from '@common/grid/node';
import { Objective } from '@common/objectives';
import { GameMode } from './game-mode';
import { VirtualPlayerType } from './virtualPlayer';

export interface PlayerInfo {
    name: string;
    id: string;
    virtualPlayerType?: VirtualPlayerType;
}

export interface Player {
    name: string;
    id: string;
    completedWords: string[];
    easel: Letter[];
    isPlaying: boolean;
    score: number;
    hasAbandon: boolean;
    isVirtual: boolean;
    privateObjective?: Objective;
    virtualPlayerType?: VirtualPlayerType;
}
interface VirtualPlayerName {
    name: string;
    type: VirtualPlayerType;
    isReadonly: boolean;
}

interface GameHistory {
    started: Date;
    duration: number;
    creator: Player;
    creatorScore: number;
    oponentScore: number;
    opponent: Player;
    mode: GameMode;
    gameAbandoned: boolean;
}
