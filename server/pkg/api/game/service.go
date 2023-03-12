package game

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"
	"scrabble/pkg/scrabble"

	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var (
	ErrNotPlayerTurn   = errors.New("not player's turn")
	ErrNotBotTurn      = errors.New("not bot's turn")
	ErrInvalidMove     = errors.New("invalid move")
	ErrInvalidPosition = errors.New("invalid position")

	botNames = []string{"Bot1", "Bot2", "Bot3", "Bot4"}
)

type Service struct {
	Repo    *Repository
	UserSvc *user.Service
	Dict    *scrabble.Dictionary
	DAWG    *scrabble.DAWG
}

func NewService(repo *Repository, userSvc *user.Service) *Service {
	dict := scrabble.NewDictionary()
	dawg := scrabble.NewDawg(dict)

	s := &Service{
		Repo:    repo,
		UserSvc: userSvc,
		Dict:    dict,
		DAWG:    dawg,
	}

	return s
}

func (s *Service) StartGame(room *room.Room) (*scrabble.Game, error) {
	humanPlayers := len(room.UserIDs)
	if humanPlayers < 2 {
		return nil, errors.New("must have at least 2 players")
	}
	botPlayers := 4 - humanPlayers
	slog.Info("Starting game", "room", room.ID, "human", humanPlayers, "ai", botPlayers)

	g := scrabble.NewGame(room.ID, s.DAWG, &scrabble.HighScore{})
	for _, uID := range room.UserIDs {
		u, err := s.UserSvc.GetUser(uID)
		if err != nil {
			return nil, err
		}
		g.AddPlayer(scrabble.NewPlayer(u.ID, u.Username, g.Bag))
	}
	for i := 0; i < botPlayers; i++ {
		g.AddPlayer(scrabble.NewBot(uuid.NewString(), botNames[i], g.Bag))
	}
	g.Turn = g.PlayerToMove().ID

	err := s.Repo.Insert(g)
	if err != nil {
		return nil, err
	}

	return g, nil
}

type MoveInfo struct {
	Type    string            `json:"type,omitempty"`
	Letters string            `json:"letters,omitempty"`
	Covers  map[string]string `json:"covers"`
}

const (
	MoveTypePlayTile = "playTile"
	MoveTypeExchange = "exchange"
	MoveTypePass     = "pass"
)

func (s *Service) ApplyPlayerMove(gID, pID string, req MoveInfo) (*scrabble.Game, error) {
	g, err := s.Repo.GetGame(gID)
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
		covers := make(scrabble.Covers)
		for pos, letter := range req.Covers {
			if !player.Rack.ContainsAsString(letter) {
				if letter == strings.ToUpper(letter) && !player.Rack.Contains('*') {
					return nil, ErrInvalidMove
				}
			}

			p, err := parsePoint(pos)
			if err != nil {
				return nil, fmt.Errorf("invalid coordinate: %w", err)
			}
			covers[p] = []rune(letter)[0]
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

	return g, nil
}

func (s *Service) ApplyBotMove(gID string) (*scrabble.Game, error) {
	g, err := s.Repo.GetGame(gID)
	if err != nil {
		return nil, err
	}

	if !g.PlayerToMove().IsBot {
		return nil, ErrNotBotTurn
	}

	// Make the bot think
	time.Sleep(time.Second * 1)

	state := g.State()
	move := g.Engine.GenerateMove(state)
	err = g.ApplyValid(move)
	if err != nil {
		slog.Error("apply bot move", err)
	}

	return g, nil
}

func (s *Service) ReplacePlayerWithBot(gID, pID string) (*scrabble.Game, error) {
	g, err := s.Repo.GetGame(gID)
	if err != nil {
		return nil, err
	}

	p, err := g.GetPlayer(pID)
	if err != nil {
		return nil, err
	}
	if !p.IsBot {
		return nil, fmt.Errorf("player %s is not a bot", pID)
	}

	p.IsBot = true
	p.Username = "Bot " + p.Username

	return g, nil
}

func (s *Service) DeleteGame(gID string) error {
	err := s.Repo.Delete(gID)
	if err != nil {
		return err
	}

	return nil
}

func parsePoint(str string) (scrabble.Position, error) {
	var p scrabble.Position
	parts := strings.Split(str, "/")
	if len(parts) != 2 {
		return p, fmt.Errorf("invalid position format: %s", str)
	}
	row, err := strconv.Atoi(parts[0])
	if err != nil {
		return p, fmt.Errorf("invalid row value: %s", parts[0])
	}
	col, err := strconv.Atoi(parts[1])
	if err != nil {
		return p, fmt.Errorf("invalid col value: %s", parts[1])
	}
	p.Row = row
	p.Col = col
	return p, nil
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
