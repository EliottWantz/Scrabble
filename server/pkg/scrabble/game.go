package scrabble

import (
	"errors"
	"fmt"
	"sort"
	"time"
)

const (
	MaxPassMoves                 int = 6
	MaxHumanConsecutivePassMoves int = 2
)

var ErrPlayerNotFound = errors.New("player not found")

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
	Timer        *GameTimer
}

type GameTimer struct {
	Timer  *time.Timer
	Ticker *time.Ticker
	tickFn func()
	doneFn func()
	end    time.Time
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
		ID:       ID,
		Players:  []*Player{},
		Board:    NewBoard(),
		Bag:      NewBag(DefaultTileSet),
		DAWG:     dawg,
		TileSet:  DefaultTileSet,
		MoveList: []*MoveItem{},
		Engine:   NewEngine(botStrategy),
		Timer:    NewGameTimer(),
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

func (g *Game) SkipTurn() {
	move := NewPassMove()
	g.ApplyValid(move)
}

func (g *Game) GetPlayer(pID string) (*Player, error) {
	for _, p := range g.Players {
		if p.ID == pID {
			return p, nil
		}
	}
	return nil, ErrPlayerNotFound
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
	g.Timer.Reset()

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

func (g *Game) Winner() *Player {
	// Return the player with the highest score
	// sortedPlayer := g.Players
	var sortedPlayer []*Player = make([]*Player, len(g.Players))
	copy(sortedPlayer, g.Players)
	sort.Slice(sortedPlayer, func(i, j int) bool {
		return sortedPlayer[i].Score > sortedPlayer[j].Score
	})

	return sortedPlayer[0]
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

func NewGameTimer() *GameTimer {
	return &GameTimer{
		Ticker: time.NewTicker(time.Second), // Fires every second
		Timer:  time.NewTimer(time.Minute),  // Fires every minute
		end:    time.Now().Add(time.Minute),
	}
}

func (t *GameTimer) Reset() {
	t.Timer.Reset(time.Minute)
	t.end = time.Now().Add(time.Minute)
}

func (t *GameTimer) Stop() {
	t.Timer.Stop()
	t.Ticker.Stop()
}

func (t *GameTimer) TimeRemaining() time.Duration {
	return time.Until(t.end).Abs().Round(time.Second)
}

func (t *GameTimer) OnTick(tickFn func()) {
	t.tickFn = tickFn
}

func (t *GameTimer) OnDone(doneFn func()) {
	t.doneFn = doneFn
}

func (t *GameTimer) Start() {
	t.Reset()
	go func() {
		for {
			select {
			case <-t.Timer.C:
				t.doneFn()
				time.Sleep(time.Second)
				t.Reset()
			case <-t.Ticker.C:
				t.tickFn()
				// fmt.Printf("\r%v", t.TimeRemaining())
			}
		}
	}()
}
