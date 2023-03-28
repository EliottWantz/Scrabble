package game

import (
	"github.com/google/uuid"
)

type Tournament struct {
	ID         string         `json:"id"`
	CreatorID  string         `json:"creatorId"`
	UserIDs    []string       `json:"userIds"`
	Rounds     map[int]*Round `json:"rounds"`
	HasStarted bool           `json:"hasStarted"`
	IsOver     bool           `json:"isOver"`
	WinnerID   string         `json:"winnerId"`
}

type Round struct {
	RoundNumber int              `json:"roundNumber"`
	UserIDs     []string         `json:"userIds"`
	Brackets    map[int]*Bracket `json:"brackets"`
	HasStarted  bool             `json:"hasStarted"`
}

type Bracket struct {
	BracketNumber int              `json:"bracketNumber"`
	UserIDs       []string         `json:"userIds"`
	Games         map[string]*Game `json:"games"`
	WinnersIDs    []string         `json:"winnersIds"`
}

type TournamentGameInfo struct {
	TournamentID  string `json:"tournamentId"`
	RoundNumber   int    `json:"roundNumber"`
	BracketNumber int    `json:"bracketNumber"`
}

func NewTournament(creatorID string, withUserIDs []string) *Tournament {
	t := &Tournament{
		ID:        uuid.NewString(),
		CreatorID: creatorID,
		UserIDs:   []string{creatorID},
		Rounds:    make(map[int]*Round),
	}
	t.UserIDs = append(t.UserIDs, withUserIDs...)

	return t
}

func (t *Tournament) NumberOfRounds() int {
	return len(t.Rounds)
}

func (r *Round) IsFinale() bool {
	if len(r.Brackets) != 1 {
		return false
	}
	return len(r.Brackets[0].Games) == 1
}
