import { Game } from "./game";

export interface Tournament {
    id: string;
    creatorId: string;
    userIds: string[];
    isPrivateGame: boolean;
    winnerId: string;
    tournamentId: string;
    games: Game[];
    finale: Game;
}