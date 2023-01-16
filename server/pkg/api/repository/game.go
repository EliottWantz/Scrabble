package repository

type GameRepository struct {
	db map[int]int
}

// Juste pour une exemple
func (gr *GameRepository) GetAllGames() []int {
	var games []int

	for _, v := range gr.db {
		games = append(games, v)
	}

	return games
}
