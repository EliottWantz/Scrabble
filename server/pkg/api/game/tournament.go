package game

import (
	"github.com/google/uuid"
)

type Tournament struct {
	ID         string   `json:"id"`
	CreatorID  string   `json:"creatorId"`
	UserIDs    []string `json:"userIds"`
	PoolGames  []*Game  `json:"poolGames"`
	Finale     *Game    `json:"finale"`
	HasStarted bool     `json:"hasStarted"`
	IsOver     bool     `json:"isOver"`
	WinnerID   string   `json:"winnerId"`
}

type TournamentGameInfo struct {
	TournamentID string `json:"tournamentId"`
}

func NewTournament(creatorID string, withUserIDs []string) *Tournament {
	t := &Tournament{
		ID:        uuid.NewString(),
		CreatorID: creatorID,
		UserIDs:   []string{creatorID},
		PoolGames: make([]*Game, 0),
	}
	t.UserIDs = append(t.UserIDs, withUserIDs...)

	return t
}

func (t *Tournament) PoolGamesWinners() []string {
	winners := make([]string, len(t.PoolGames))
	for i, g := range t.PoolGames {
		winners[i] = g.WinnerID
	}

	return winners
}
