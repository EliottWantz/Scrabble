export interface MoveInfo {
    type: "playTile" | "exchange" | "pass";
    letters?: string;
    covers?: Cover;
}

export type Cover = Record<string, string>;