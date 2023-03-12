export interface Summary {
    networkLogs: NetworkLog[];
    gamesStats: GameStats[];
    userStats: UserStats;
}

export interface NetworkLog {
    eventType: string;
    evenTime: number;
}

export interface GameStats {
    eventDate: string;
    gameWon: boolean;
}

export interface UserStats {
    nbGamesPlayed: number;
    nbGamesWon: number;
    averagePointsPerGame: number;
    averageTimePlayed: number;
}