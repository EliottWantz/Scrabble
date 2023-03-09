import { Player } from "@app/utils/interfaces/game/player";

export interface Game {
    id: string;
    players: Player[];
}