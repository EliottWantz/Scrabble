package game

import (
	"scrabble/pkg/scrabble"
)

type Game struct {
	ID                 string              `json:"id"`
	CreatorID          string              `json:"creatorId"`
	UserIDs            []string            `json:"userIds"`
	ObservateurIDs     []string            `json:"observateurIds"`
	IsPrivateGame      bool                `json:"isPrivateGame"`
	IsProtected        bool                `json:"isProtected"`
	Winner             string              `json:"winner"`
	HashedPassword     string              `json:"-"`
	ScrabbleGame       *scrabble.Game      `json:"-"`
	TournamentGameInfo *TournamentGameInfo `json:"tournamentGameInfo,omitempty"`
}

func (g *Game) IsTournamentGame() bool {
	return g.TournamentGameInfo != nil
}

func (g *Game) IsJoinable() bool {
	if g.ScrabbleGame != nil {
		return false
	}
	return len(g.UserIDs) < 4
}
