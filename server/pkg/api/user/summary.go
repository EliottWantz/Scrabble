package user

type Summary struct {
	NetworkLogs []NetworkLog `bson:"networkLogs" json:"networkLogs,omitempty"`
	GamesStats  []GameStats  `bson:"gamesStats" json:"gamesStats,omitempty"`
	UserStats   UserStats    `bson:"userStats" json:"userStats,omitempty"`
}

type NetworkLog struct {
	EventType string `bson:"eventType" json:"eventType,omitempty"`
	EvenTime  int    `bson:"evenTime" json:"evenTime,omitempty"`
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

func (s *Service) addNetworkingLog(u *User, eventType string, eventTime int) {
	networkLogs := &u.Summary.NetworkLogs
	*networkLogs = append(*networkLogs, NetworkLog{
		EventType: eventType,
		EvenTime:  eventTime,
	})
	s.Repo.Update(u)
}

func (s *Service) addGameStats(u *User, eventDate int, gameWon bool) {
	gamesStats := &u.Summary.GamesStats
	*gamesStats = append(*gamesStats, GameStats{
		EventDate: eventDate,
		GameWon:   gameWon,
	})
	s.Repo.Update(u)

}

func (s *Service) updateUserStats(u *User, gameWon bool, points int, timePlayed int) {
	userStats := &u.Summary.UserStats
	userStats.NbGamesPlayed++
	if gameWon {
		userStats.NbGamesWon++
	}
	userStats.AveragePointsPerGame = (userStats.AveragePointsPerGame + points) / userStats.NbGamesPlayed
	userStats.AverageTimePlayed = (userStats.AverageTimePlayed + timePlayed) / userStats.NbGamesPlayed
	s.Repo.Update(u)
}
