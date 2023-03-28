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

func (t *Tournament) Setup(s *Service) error {
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

	gameCounter := 1
	for roundNumber := 1; roundNumber <= numRounds; roundNumber++ {
		round := &Round{
			RoundNumber: roundNumber,
			Brackets:    make(map[int]*Bracket, 0),
			UserIDs:     make([]string, 0),
		}
		if roundNumber == 1 {
			round.UserIDs = t.UserIDs
		}

		numGames := numPlayers / (1 << uint(roundNumber))
		numBrackets := numGames / 2
		gamesPerBracket := 2
		if numBrackets == 0 {
			gamesPerBracket = 1
			numBrackets = 1
		}

		for bracketNumber := 1; bracketNumber <= numBrackets; bracketNumber++ {
			bracket := &Bracket{
				BracketNumber: bracketNumber,
				UserIDs:       make([]string, 0),
				Games:         make(map[string]*Game),
				WinnersIDs:    make([]string, 0, 2),
			}
			for len(bracket.Games) < gamesPerBracket {
				game := &Game{
					ID: uuid.NewString(),
					TournamentGameInfo: &TournamentGameInfo{
						TournamentID:  t.ID,
						RoundNumber:   roundNumber,
						BracketNumber: bracketNumber,
					},
				}
				if roundNumber == 1 {
					game.UserIDs = []string{
						t.UserIDs[gameCounter-1],
						t.UserIDs[numGames*2-gameCounter],
					}
				}
				if err := s.Repo.InsertGame(game); err != nil {
					return err // Should never happen
				}

				bracket.Games[game.ID] = game
				gameCounter++
			}
			round.Brackets[bracketNumber] = bracket
		}
		t.Rounds[roundNumber] = round
	}

	return nil
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
