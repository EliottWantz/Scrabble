package user

type Summary struct {
	NetworkLogs []NetworkLog `bson:"networkLogs" json:"networkLogs,omitempty"`
	GamesStats  []GameStats  `bson:"gamesStats" json:"gamesStats,omitempty"`
	UserStats   UserStats    `bson:"userStats" json:"userStats,omitempty"`
}

type NetworkLog struct {
	EventType string `bson:"eventType" json:"eventType,omitempty"`
	EvenTime  string `bson:"evenTime" json:"evenTime,omitempty"`
}
type GameStats struct {
	EventDate int  `bson:"eventDate" json:"eventDate,omitempty"`
	GameWon   bool `bson:"gameWon" json:"gameWon,omitempty"`
}

type UserStats struct {
	NbGamesPlayed        int `bson:"nbGamesPlayed" json:"nbGamesPlayed,omitempty"`
	NbGamesWon           int `bson:"nbGamesWon" json:"nbGamesWon,omitempty"`
	AveragePointsPerGame int `bson:"averagePointsPerGame" json:"averagePointsPerGame,omitempty"`
	AverageTimePlayed    int `bson:"averageTimePlayed" json:"averageTimePlayed,omitempty"`
}
