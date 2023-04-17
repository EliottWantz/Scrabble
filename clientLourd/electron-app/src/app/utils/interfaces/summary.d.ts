export interface Summary {
    networkLogs: NetworkLog[];
    gamesStats: GameStats[];
    userStats: UserStats;
}

export interface NetworkLog {
    eventType: string;
    eventTime: number;
}

export interface GameStats {
    gameStartTime: number;
    gameEndTime: number;
    gameWon: boolean;
}

export interface UserStats {
    nbGamesPlayed: number;
    nbGamesWon: number;
    averagePointsPerGame: number;
    averageTimePlayed: number;
}