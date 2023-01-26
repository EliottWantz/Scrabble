package game

import (
	"flag"
	"fmt"
	"time"

	"scrabble/pkg/scrabble"
)

var numGames = flag.Int("n", 1, "Number of games to simulate")

type Service struct {
	repo *Repository
}

func (gs *Service) StartGame() {
	start := time.Now()
	flag.Parse()

	dict := scrabble.NewDictionary()
	tileSet := scrabble.DefaultTileSet
	dawg := scrabble.NewDawg(dict)

	var winsA, winsB int

	for i := 0; i < *numGames; i++ {
		scoreA, scoreB := gs.simulateGame(tileSet, dawg)
		if scoreA > scoreB {
			winsA++
		}
		if scoreB > scoreA {
			winsB++
		}
	}

	elapsed := time.Since(start)
	fmt.Printf("%v games were played\nRobot A won %v games, and Robot B won %v games; %v games were draws.\n",
		*numGames,
		winsA,
		winsB,
		*numGames-winsA-winsB,
	)
	fmt.Println("Took", elapsed)
}

func (gs *Service) simulateGame(tileSet *scrabble.TileSet, dawg *scrabble.DAWG) (scoreA, scoreB int) {
	g := scrabble.NewGame(tileSet, dawg)

	highScoreEngine := scrabble.NewEngine(&scrabble.HighScore{})
	p1 := scrabble.NewPlayer("Alphonse", g.Bag)
	p2 := scrabble.NewPlayer("Sylvestre", g.Bag)
	g.Players[0], g.Players[1] = p1, p2

	for i := 0; ; i++ {
		state := g.State()
		// Ask robotA or robotB to generate a move
		move := highScoreEngine.GenerateMove(state)
		err := g.ApplyValid(move)
		if err != nil {
			fmt.Println(err)
		}
		fmt.Println(move)
		fmt.Println(g.Board)
		if g.IsOver() {
			fmt.Printf("Game over!\n\n")
			break
		}
	}
	scoreA, scoreB = g.Players[0].Score, g.Players[1].Score
	return scoreA, scoreB
}
