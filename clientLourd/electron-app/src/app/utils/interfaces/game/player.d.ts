import { Rack } from "@app/utils/interfaces/game/rack";

export interface Player {
    id: string;
    username: string;
    rack: Rack;
    score: number;
	consecutiveExchanges: number;
	isBot: boolean;
}