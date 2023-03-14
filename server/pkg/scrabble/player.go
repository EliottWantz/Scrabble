package scrabble

type Player struct {
	ID                   string `json:"id"`
	Username             string `json:"username"`
	Rack                 *Rack  `json:"rack"`
	Score                int    `json:"score"`
	ConsecutiveExchanges int    `json:"consecutiveExchanges"`
	IsBot                bool   `json:"isBot"`
}

func NewPlayer(ID, username string, b *Bag) *Player {
	return &Player{
		ID:       ID,
		Username: username,
		Rack:     NewRack(b),
	}
}

func NewBot(ID, username string, b *Bag) *Player {
	return &Player{
		ID:       ID,
		Username: username,
		Rack:     NewRack(b),
		IsBot:    true,
	}
}
