import { Player } from "@app/utils/interfaces/game/player";
import { Square } from "@app/utils/interfaces/square";
import { Tile } from "@app/utils/interfaces/game/tile";
 
export interface Game {
    id: string;
    players: Player[];
    board: Square[][];
    finished: boolean;
    numPassMoves: number;
    turn: string;
    timer: number;
}