package user

type Summary struct {
	NetworkLogs []NetworkLog `bson:"networkLogs" json:"networkLogs,omitempty"`
	GamesStats  []GameStats  `bson:"gamesStats" json:"gamesStats,omitempty"`
	UserStats   UserStats    `bson:"userStats" json:"userStats,omitempty"`
}

type NetworkLog struct {
	EventType string `bson:"eventType" json:"eventType,omitempty"`
	EventTime int64  `bson:"eventTime" json:"eventTime,omitempty"`
}
type GameStats struct {
	EventStartTime int64 `bson:"eventStartTime" json:"eventStartTime,omitempty"`
	EventEndTime   int64 `bson:"eventEndTime" json:"eventEndTime,omitempty"`
	GameWon        bool  `bson:"gameWon" json:"gameWon,omitempty"`
}

type UserStats struct {
	NbGamesPlayed        int   `bson:"nbGamesPlayed" json:"nbGamesPlayed,omitempty"`
	NbGamesWon           int   `bson:"nbGamesWon" json:"nbGamesWon,omitempty"`
	AveragePointsPerGame int   `bson:"averagePointsPerGame" json:"averagePointsPerGame,omitempty"`
	AverageTimePlayed    int64 `bson:"averageTimePlayed" json:"averageTimePlayed,omitempty"`
}

func (s *Service) AddNetworkingLog(u *User, eventType string, eventTime int64) {
	networkLogs := &u.Summary.NetworkLogs
	*networkLogs = append(*networkLogs, NetworkLog{
		EventType: eventType,
		EventTime: eventTime,
	})
	s.Repo.Update(u)
}

func (s *Service) AddGameStats(u *User, eventStartTime, eventEndTime int64, gameWon bool) {
	gamesStats := &u.Summary.GamesStats
	*gamesStats = append(*gamesStats, GameStats{
		EventStartTime: eventStartTime,
		EventEndTime:   eventEndTime,
		GameWon:        gameWon,
	})
	s.Repo.Update(u)

}

func (s *Service) UpdateUserStats(u *User, gameWon bool, points int, timePlayed int64) {
	userStats := &u.Summary.UserStats
	userStats.NbGamesPlayed++
	if gameWon {
		userStats.NbGamesWon++
	}
	userStats.AveragePointsPerGame = (userStats.AveragePointsPerGame + points) / userStats.NbGamesPlayed
	userStats.AverageTimePlayed = (userStats.AverageTimePlayed + timePlayed) / int64(userStats.NbGamesPlayed)
	s.Repo.Update(u)
}
