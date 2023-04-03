package game

import (
	"github.com/google/uuid"
)

type Tournament struct {
	ID             string   `json:"id"`
	CreatorID      string   `json:"creatorId"`
	UserIDs        []string `json:"userIds"`
	ObservateurIDs []string `json:"observerIds"`
	PoolGames      []*Game  `json:"poolGames"`
	Finale         *Game    `json:"finale"`
	HasStarted     bool     `json:"hasStarted"`
	IsOver         bool     `json:"isOver"`
	WinnerID       string   `json:"winnerId"`
	IsPrivate      bool     `json:"isPrivate"`
}

type TournamentGameInfo struct {
	TournamentID string `json:"tournamentId"`
}

func NewTournament(creatorID string, withUserIDs []string, isPrivate bool) *Tournament {
	t := &Tournament{
		ID:        uuid.NewString(),
		CreatorID: creatorID,
		UserIDs:   []string{creatorID},
		PoolGames: make([]*Game, 0, 2),
		IsPrivate: isPrivate,
	}
	t.UserIDs = append(t.UserIDs, withUserIDs...)

	return t
}

func (t *Tournament) PoolGamesWinners() []string {
	winners := make([]string, 0)
	for _, g := range t.PoolGames {
		if g.WinnerID == "" {
			continue
		}
		winners = append(winners, g.WinnerID)
	}

	return winners
}
