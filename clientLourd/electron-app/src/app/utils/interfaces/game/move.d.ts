export interface MoveInfo {
    type: "playTile" | "exchange" | "pass";
    letters?: string;
    covers?: Map<string, string>;
}