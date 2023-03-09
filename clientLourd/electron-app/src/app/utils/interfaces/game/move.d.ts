import { Cover } from "@app/utils/interfaces/game/cover";

export interface MoveInfo {
    type: "playTile" | "exchange" | "pass";
    letters: string;
    covers: Cover[];
}