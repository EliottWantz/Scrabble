import { Tile } from "@app/utils/interfaces/game/tile";

export interface Square {
    piece: Tile;
    wordMultiplier: number;
    letterMultiplier: number;
    x: number;
    y: number;
}