import { Player } from "@app/utils/interfaces/game/player";
import { Square } from "@app/utils/interfaces/square";
 
export interface ScrabbleGame {
    id: string;
    players: Player[];
    board: Square[][];
    finished: boolean;
    numPassMoves: number;
    turn: string;
    timer: number;
    tileCount: number;
}

export interface Game {
    id: string;
    creatorId: string;
    userIds: string[];
    isProtected: boolean;
    isPrivateGame: boolean;
    winnerId: string;
    tournamentId: string;
    botNames: string[];
    observateurIds: string[];
}