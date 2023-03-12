package scrabble

type Player struct {
	ID                   string
	Username             string
	Rack                 *Rack
	Score                int
	ConsecutiveExchanges int
	IsBot                bool
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
