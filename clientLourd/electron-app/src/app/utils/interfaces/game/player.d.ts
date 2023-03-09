import { Tile } from "@app/utils/interfaces/game/tile";

export interface Player {
    id: string;
    username: string;
    rack: Tile[];
    score: number;
	consecutiveExchanges: number;
	isBot: boolean;
}