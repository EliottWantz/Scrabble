package scrabble

import (
	"sort"
)

// Strategy is an interface that implements a playing strategy to pick a
// move	given a list of legal tile moves.
type Strategy interface {
	PickMove(state *GameState, moves []Move) Move
}

type Engine struct {
	Strategy
}

func NewEngine(s Strategy) *Engine {
	return &Engine{
		Strategy: s,
	}
}

// GenerateMove generates a list of legal tile moves, then picks a move from
// with the current bot's strategy
func (e *Engine) GenerateMove(state *GameState) Move {
	moves := state.GenerateMoves()
	return e.PickMove(state, moves)
}

// GenerateMove generates a list of legal tile moves, then picks the 3 best
// moves from with the current bot's strategy
func (e *Engine) GenerateBestTileMoves(state *GameState) []Move {
	moves := state.GenerateMoves()
	return e.PickBestTileMoves(state, moves)
}

// HighScore strategy always picks the highest-scoring move available, or
// exchanges all tiles if there is no valid tile move, or passes if exchange is
// not allowed.
type HighScore struct{}

// Sort the moves by score
type byScore struct {
	state *GameState
	moves []Move
}

func (list byScore) Len() int {
	return len(list.moves)
}

func (list byScore) Swap(i, j int) {
	list.moves[i], list.moves[j] = list.moves[j], list.moves[i]
}

func (list byScore) Less(i, j int) bool {
	// We want descending order, so we reverse the comparison
	return list.moves[i].Score(list.state) > list.moves[j].Score(list.state)
}

// PickMove for a HighScore picks the highest scoring move available,
// or an exchange move, or a pass move as a last resort
func (hs *HighScore) PickMove(state *GameState, moves []Move) Move {
	if len(moves) > 0 {
		// Sort by score and return the highest scoring move
		sort.Sort(byScore{state, moves})
		return moves[0]
	}
	// No valid tile moves
	if state.ExchangeAllowed {
		// Exchange all tiles, since that is allowed
		return NewExchangeMove(state.Rack.AsString())
	}
	// Exchange forbidden: Return a pass move
	return NewPassMove()
}

// PickBestTileMoves picks the best 5 moves from the current game state
func (e *Engine) PickBestTileMoves(state *GameState, moves []Move) []Move {
	if len(moves) > 0 {
		// Sort by score
		sort.Sort(byScore{state, moves})
		// Cut the list down to 5, if it is longer than that
		if len(moves) > 5 {
			moves = moves[:5]
		}
		return moves
	}
	return []Move{}
}
