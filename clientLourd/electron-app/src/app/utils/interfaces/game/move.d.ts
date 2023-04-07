export interface MoveInfo {
    type: "playTile" | "exchange" | "pass";
    letters?: string;
    covers?: Cover;
    score?: number;
}

export type Cover = Record<string, string>;