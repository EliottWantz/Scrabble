import { Node } from '@common/grid/node';

export const enum SCORE_PERCENTILE {
    EIGHTIETH_PERCENTILE_SCORE = 0.8,
    SEVENTIETH_PERCENTILE_SCORE = 0.7,
    SIXTIETH_PERCENTILE_SCORE = 0.6,
}

export interface Position {
    row: number;
    col: number;
}

export interface PlayableWord {
    word: string;
    position: Position;
    direction: string;
    score?: number;
}

export interface ClueFunctionParams {
    playableWords: PlayableWord[];
    anchors: Position[];
    grid: Node[][];
    playerLetters: string[];
    wordDirection: string;
    prefixLimit: number;
}
