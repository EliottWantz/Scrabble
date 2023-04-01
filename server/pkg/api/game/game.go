package game

import (
	"scrabble/pkg/scrabble"
)

type Game struct {
	ID             string         `json:"id"`
	CreatorID      string         `json:"creatorId"`
	UserIDs        []string       `json:"userIds"`
	ObservateurIDs []string       `json:"observateurIds"`
	IsPrivateGame  bool           `json:"isPrivateGame"`
	IsProtected    bool           `json:"isProtected"`
	WinnerID       string         `json:"winnerId"`
	HashedPassword string         `json:"-"`
	ScrabbleGame   *scrabble.Game `json:"-"`
	StartTime      int64          `json:"startTime"`
	TournamentID   string         `json:"tournamentId"`
}

func (g *Game) IsTournamentGame() bool {
	return g.TournamentID != ""
}

func (g *Game) IsJoinable() bool {
	if g.ScrabbleGame != nil {
		return false
	}
	if g.TournamentID != "" {
		return false
	}
	return len(g.UserIDs) < 4
}
