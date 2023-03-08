package scrabble

import "fmt"

const (
	MaxPassMoves                 int = 6
	MaxHumanConsecutivePassMoves int = 2
)

type Game struct {
	ID           string
	Players      []*Player
	Board        *Board
	Bag          *Bag
	DAWG         *DAWG
	TileSet      *TileSet
	MoveList     []*MoveItem
	Engine       *Engine
	Finished     bool
	NumPassMoves int
	Turn         string
}

// GameState contains the bare minimum of information
// that is needed for a robot player to decide on a move
// in a Game.
type GameState struct {
	DAWG            *DAWG
	TileSet         *TileSet
	Board           *Board
	Rack            *Rack
	ExchangeAllowed bool
}

// MoveItem is an entry in the MoveList of a Game.
// It contains the player's Rack as it was before the move,
// as well as the move itself.
type MoveItem struct {
	RackBefore string
	Move       Move
}

func NewGame(ID string, dawg *DAWG, botStrategy Strategy) *Game {
	g := &Game{
		ID:      ID,
		Board:   NewBoard(),
		DAWG:    dawg,
		Bag:     NewBag(DefaultTileSet),
		TileSet: DefaultTileSet,
		Engine:  NewEngine(botStrategy),
	}

	return g
}

func (g *Game) AddPlayer(p *Player) {
	g.Players = append(g.Players, p)
}

// PlayerToMove returns the player which player's move it is
func (g *Game) PlayerToMove() *Player {
	return g.Players[len(g.MoveList)%4]
}

// Returns the player that just played his move. Must be called after the move has been applied.
func (g *Game) PlayerThatPlayed() *Player {
	return g.Players[(len(g.MoveList)-1)%4]
}

// PlayTile moves a tile from the player's rack to the board
func (g *Game) PlayTile(t *Tile, pos Position, r *Rack) error {
	err := r.Remove(t.Letter)
	if err != nil {
		return err
	}

	err = g.Board.PlaceTile(t, pos)
	if err != nil {
		return err
	}

	return nil
}

// ApplyValid applies an already validated Move to a Game,
// appends it to the move list, replenishes the player's Rack
// if needed, and updates scores.
func (g *Game) ApplyValid(move Move) error {
	// Be careful to call PlayerToMove() before appending
	// a move to the move list (this reverses the players)
	playerToMove := g.PlayerToMove()
	rackBefore := playerToMove.Rack.AsString()
	if err := move.Apply(g); err != nil {
		// Should not happen because it should be a valid move
		return err
	}

	// Update the scores and append to the move list
	g.scoreMove(rackBefore, move)
	g.Turn = g.PlayerToMove().ID

	// DEBUG PRINTS
	fmt.Println("Player:", playerToMove.Username, "Move:", move)
	fmt.Println(g.Board)

	// TODO: What to do with a game of 4 players?
	// if g.IsOver() {
	// 	// The game is now over: add the FinalMoves
	// 	rackPlayer := playerToMove.Rack.AsString()
	// 	rackOpp := g.Players[1-g.PlayerToMoveIndex()].Rack.AsString()

	// 	multiplyFactor := 2
	// 	if len(rackPlayer) > 0 {
	// 		// The game is not finishing by the final player
	// 		// completing his rack: both players then get the
	// 		// opponent's remaining tile scores
	// 		multiplyFactor = 1
	// 	}
	// 	// Add a final move for the finishing player
	// 	g.scoreMove(rackPlayer, NewFinalMove(rackOpp, multiplyFactor))
	// 	// Add a final move for the opponent
	// 	g.scoreMove(rackOpp, NewFinalMove(rackPlayer, multiplyFactor))
	// }
	return nil
}

// scoreMove updates the scores and appends a given Move
// to the Game's MoveList
func (g *Game) scoreMove(rackBefore string, move Move) {
	// Calculate the score
	score := move.Score(g.State())
	// Update the player's score
	g.PlayerToMove().Score += score
	// Append to the move list
	moveItem := &MoveItem{RackBefore: rackBefore, Move: move}
	g.MoveList = append(g.MoveList, moveItem)
}

// IsOver returns true if the Game is over after the last
// move played
func (g *Game) IsOver() bool {
	i := len(g.MoveList)
	if i == 0 {
		// No moves yet: cannot be over
		return false
	}
	// TODO: Check for resignation
	if g.NumPassMoves == MaxPassMoves {
		return true
	}

	lastPlayer := g.PlayerThatPlayed()
	if lastPlayer.ConsecutiveExchanges >= MaxHumanConsecutivePassMoves {
		return true
	}
	if lastPlayer.Rack.IsEmpty() {
		return true
	}

	return false
}

// State returns a new GameState instance describing the state of the
// game in a minimal manner so that a robot player can decide on a move
func (g *Game) State() *GameState {
	return &GameState{
		DAWG:            g.DAWG,
		TileSet:         g.TileSet,
		Board:           g.Board,
		Rack:            g.PlayerToMove().Rack,
		ExchangeAllowed: g.Bag.ExchangeAllowed(),
	}
}

func (gs *GameState) GenerateMoves() []Move {
	leftParts := gs.DAWG.FindLeftParts(gs.Rack.AsString())

	resultsCh := make(chan []Move)

	for i := 0; i < BoardSize; i++ {
		go func(row int) {
			gs.GenerateMovesOnAxis(row, true, leftParts, resultsCh)
		}(i)
		go func(col int) {
			gs.GenerateMovesOnAxis(col, false, leftParts, resultsCh)
		}(i)
	}

	var moves []Move
	for i := 0; i < BoardSize*2; i++ {
		moves = append(moves, <-resultsCh...)
	}

	return moves
}

func (gs *GameState) GenerateMovesOnAxis(index int, horizontal bool, leftParts [][]*LeftPart, moveCh chan<- []Move) {
	var axis Axis
	axis.Init(gs, index, horizontal)
	moveCh <- axis.GenerateMoves(leftParts)
}
