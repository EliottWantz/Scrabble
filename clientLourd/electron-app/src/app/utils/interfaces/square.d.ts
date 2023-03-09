import { Piece } from "@app/utils/interfaces/piece";

export interface Square {
    piece: Piece;
    wordMultiplier: number;
    letterMultiplier: number;
}