package game

import "scrabble/pkg/scrabble"

type Game struct {
	ID             string         `json:"id"`
	CreatorID      string         `json:"creatorId"`
	UserIDs        []string       `json:"userIds"`
	ObservateurIDs []string       `json:"observateurIds"`
	IsPrivateGame  bool           `json:"isPrivateGame"`
	IsProtected    bool           `json:"isProtected"`
	HashedPassword string         `json:"-"`
	ScrabbleGame   *scrabble.Game `json:"-"`
}
