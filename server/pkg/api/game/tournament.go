package game

import (
	"github.com/google/uuid"
)

type Tournament struct {
	ID          string        `json:"id"`
	CreatorID   string        `json:"creatorId"`
	UserIDs     []string      `json:"userIds"`
	Rounds      map[int]Round `json:"rounds"`
	RoundNumber int           `json:"roundNumber"`
	HasStarted  bool          `json:"hasStarted"`
	IsOver      bool          `json:"isOver"`
	Winner      string        `json:"winner"`
}

type Round struct {
	RoundNumber int              `json:"roundNumber"`
	UserIDs     []string         `json:"userIds"`
	Games       map[string]*Game `json:"games"`
}

func NewTournament(creatorID string, withUserIDs []string) *Tournament {
	t := &Tournament{
		ID:          uuid.NewString(),
		CreatorID:   creatorID,
		UserIDs:     []string{creatorID},
		Rounds:      make(map[int]Round),
		RoundNumber: 1,
	}
	t.UserIDs = append(t.UserIDs, withUserIDs...)

	return t
}

func (t *Tournament) start() error {
	numPlayers := len(t.UserIDs)
	var numRounds int
	switch numPlayers {
	case 4:
		numRounds = 2
	case 8:
		numRounds = 3
	case 16:
		numRounds = 4
	}

	for roundNumber := 1; roundNumber <= numRounds; roundNumber++ {
		round := Round{
			RoundNumber: roundNumber,
			Games:       make(map[string]*Game),
		}

		// Determine the number of matches in this round
		numMatches := numPlayers / (1 << uint(roundNumber))

		// Create and print the matches
		for matchNumber := 1; matchNumber <= numMatches; matchNumber++ {
			game := &Game{ID: uuid.NewString()}
			if roundNumber == 1 {
				game.UserIDs = []string{
					t.UserIDs[matchNumber-1],
					t.UserIDs[numMatches*2-matchNumber],
				}
			}
			round.Games[game.ID] = game
		}

		t.Rounds[roundNumber] = round
	}

	return nil
}

func (t *Tournament) NumberOfRounds() int {
	return len(t.Rounds)
}
