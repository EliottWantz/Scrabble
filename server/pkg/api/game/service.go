package game

import (
	"errors"
	"fmt"
	"strconv"

	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"
	"scrabble/pkg/scrabble"

	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var (
	ErrNotPlayerTurn   = errors.New("not player's turn")
	ErrInvalidMove     = errors.New("invalid move")
	ErrInvalidPosition = errors.New("invalid position")
)

type Service struct {
	repo    *Repository
	UserSvc *user.Service
	Dict    *scrabble.Dictionary
	DAWG    *scrabble.DAWG
}

type Game struct {
	ID           string             `json:"id"`
	Players      []*scrabble.Player `json:"players"`
	Board        *scrabble.Board    `json:"board"`
	Bag          *scrabble.Bag      `json:"bag"`
	Finished     bool               `json:"finished"`
	NumPassMoves int                `json:"numPassMoves"`
	Turn         string             `json:"turn"`
}

func NewService(repo *Repository, userSvc *user.Service) *Service {
	dict := scrabble.NewDictionary()
	dawg := scrabble.NewDawg(dict)

	s := &Service{
		repo:    repo,
		UserSvc: userSvc,
		Dict:    dict,
		DAWG:    dawg,
	}

	return s
}

func (s *Service) StartGame(room *room.Room) (*Game, error) {
	humanPlayers := len(room.UserIDs)
	if humanPlayers < 2 {
		return nil, errors.New("must have at least 2 players")
	}
	botPlayers := 4 - humanPlayers
	slog.Info("Starting game", "room", room.ID, "human", humanPlayers, "ai", botPlayers)

	botNames := []string{"Bot1", "Bot2"}

	g := scrabble.NewGame(room.ID, s.DAWG, &scrabble.HighScore{})
	for _, uID := range room.UserIDs {
		u, err := s.UserSvc.GetUser(uID)
		if err != nil {
			return nil, err
		}
		g.AddPlayer(scrabble.NewPlayer(u.ID, u.Username, g.Bag))
	}
	for i := 0; i < botPlayers; i++ {
		g.AddPlayer(scrabble.NewPlayer(uuid.NewString(), botNames[i], g.Bag))
	}
	g.Turn = g.PlayerToMove().ID

	err := s.repo.Insert(g)
	if err != nil {
		return nil, err
	}

	return &Game{
		ID:           g.ID,
		Players:      g.Players,
		Board:        g.Board,
		Bag:          g.Bag,
		Finished:     g.Finished,
		NumPassMoves: g.NumPassMoves,
	}, nil
}

type MoveInfo struct {
	Type    string                    `json:"type,omitempty"`
	Letters string                    `json:"letters,omitempty"`
	Covers  map[string]scrabble.Cover `json:"covers"`
}

const (
	MoveTypePlayTile = "playTile"
	MoveTypeExchange = "exchange"
	MoveTypePass     = "pass"
)

func (s *Service) ApplyPlayerMove(gID, pID string, req MoveInfo) (*Game, error) {
	g, err := s.repo.GetGame(gID)
	if err != nil {
		return nil, err
	}
	player := g.PlayerToMove()
	if player.ID != pID {
		return nil, ErrNotPlayerTurn
	}

	var move scrabble.Move
	switch req.Type {
	case MoveTypePlayTile:
		for _, letter := range req.Letters {
			if !player.Rack.Contains(letter) {
				return nil, ErrInvalidMove
			}
		}
		covers := make(scrabble.Covers)
		for pos, c := range req.Covers {
			row, err := strconv.Atoi(string(pos[0]))
			if err != nil {
				return nil, fmt.Errorf("invalid row: %w", err)
			}
			col, err := strconv.Atoi(string(pos[1]))
			if err != nil {
				return nil, fmt.Errorf("invalid col: %w", err)
			}
			covers[scrabble.Position{Row: row, Col: col}] = c
		}
		move = scrabble.NewTileMove(g.Board, covers)
	case MoveTypeExchange:
		move = scrabble.NewExchangeMove(req.Letters)
	case MoveTypePass:
		move = scrabble.NewPassMove()
	default:
		return nil, fmt.Errorf("invalid move type: %s", req.Type)
	}

	if !move.IsValid(g) {
		return nil, ErrInvalidMove
	}

	err = g.ApplyValid(move)
	if err != nil {
		// Should not happen because move is valid
		return nil, fmt.Errorf("should not have ended up here. cannot apply move that was validated: %v", err)
	}

	// if g.IsOver() {
	// 	// Send end game results by ws

	// TODO:  update user Gamestats
	// s.UserSvc.UpdateUserStats()

	// TODO : add new game stats
	// s.UserSvc.addGameStats()
	// }

	return &Game{
		ID:           g.ID,
		Players:      g.Players,
		Board:        g.Board,
		Bag:          g.Bag,
		Finished:     g.Finished,
		NumPassMoves: g.NumPassMoves,
	}, nil
}

// Not used, just for testing
// func (s *Service) simulateGame() {
// 	numGames := 10
// 	start := time.Now()

// 	botNames := []string{"Bot1", "Bot2", "Bot3", "Bot4"}

// 	wg := &sync.WaitGroup{}
// 	for i := 0; i < numGames; i++ {
// 		wg.Add(1)
// 		go func() {
// 			g := scrabble.NewGame(uuid.NewString(), s.DAWG, &scrabble.HighScore{})
// 			for i := 0; i < 4; i++ {
// 				g.AddPlayer(scrabble.NewPlayer(uuid.NewString(), botNames[i], g.Bag))
// 			}

// 			for i := 0; ; i++ {
// 				state := g.State()
// 				move := g.Engine.GenerateMove(state)
// 				err := g.ApplyValid(move)
// 				if err != nil {
// 					fmt.Println(err)
// 				}
// 				if g.IsOver() {
// 					break
// 				}
// 			}
// 			scoreA, scoreB, scoreC, scoreD := g.Players[0].Score, g.Players[1].Score, g.Players[2].Score, g.Players[3].Score
// 			fmt.Println("Bot1:", scoreA, "Bot2:", scoreB, "Bot3:", scoreC, "Bot4:", scoreD)
// 			wg.Done()
// 		}()
// 	}
// 	wg.Wait()

// 	elapsed := time.Since(start)
// 	fmt.Println("Took", elapsed)
// }
