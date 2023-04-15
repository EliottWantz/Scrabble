import { Game } from "./game";

export interface Tournament {
    id: string;
    creatorId: string;
    userIds: string[];
    isPrivate: boolean;
    winnerId: string;
    games: Game[];
    finale: Game | undefined;
    observerIds: string[];
}