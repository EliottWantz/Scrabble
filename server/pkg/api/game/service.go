package game

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"scrabble/pkg/api/auth"
	"scrabble/pkg/api/user"
	"scrabble/pkg/scrabble"

	"github.com/google/uuid"
	"golang.org/x/exp/slices"
	"golang.org/x/exp/slog"
)

var (
	ErrNotPlayerTurn     = errors.New("not player's turn")
	ErrNotBotTurn        = errors.New("not bot's turn")
	ErrInvalidMove       = errors.New("invalid move")
	ErrInvalidPosition   = errors.New("invalid position")
	ErrGameNotStarted    = errors.New("game not started")
	ErrGameOver          = errors.New("game is over")
	ErrPrivateGame       = errors.New("game is private")
	ErrPublicGame        = errors.New("game is public")
	ErrGameHasNotStarted = errors.New("game has not started")
	ErrObserverNotFound  = errors.New("observer not found")

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

func (s *Service) NewGame(creatorID string) (*Game, error) {
	g := &Game{
		ID:        uuid.NewString(),
		CreatorID: creatorID,
		UserIDs:   []string{creatorID},
	}

	err := s.Repo.InsertGame(g)
	if err != nil {
		return nil, err
	}

	return g, nil
}

func (s *Service) NewProtectedGame(creatorID, password string) (*Game, error) {
	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}

	g, err := s.NewGame(creatorID)
	if err != nil {
		return nil, err
	}

	g.HashedPassword = hashedPassword
	g.IsProtected = true

	return g, nil
}

func (s *Service) ProtectGame(gID, password string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}
	if g.IsProtected {
		return nil, fmt.Errorf("game is already protected")
	}

	hashPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	g.IsProtected = true
	g.HashedPassword = hashPassword

	return g, nil
}

func (s *Service) UnprotectGame(gID string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	g.IsProtected = false
	g.HashedPassword = ""

	return g, nil
}

func (s *Service) AddUserToGame(gID, userID, password string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	if g.IsProtected && !auth.PasswordsMatch(g.HashedPassword, password) {
		return nil, fmt.Errorf("password mismatch")
	}

	g.UserIDs = append(g.UserIDs, userID)

	return g, nil
}

func (s *Service) AddUserToTournament(tID, userID, password string) (*Tournament, error) {
	t, err := s.Repo.FindTournament(tID)
	if err != nil {
		return nil, err
	}

	// if g.IsProtected && !auth.PasswordsMatch(g.HashedPassword, password) {
	// 	return nil, fmt.Errorf("password mismatch")
	// }

	t.UserIDs = append(t.UserIDs, userID)

	return t, nil
}

func (s *Service) RemoveUserFromGame(gID, userID string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	idx := slices.Index(g.UserIDs, userID)
	if idx == -1 {
		return nil, fmt.Errorf("user not found")
	}

	g.UserIDs = append(g.UserIDs[:idx], g.UserIDs[idx+1:]...)

	return g, nil
}

func (s *Service) RemoveUserFromTournament(gID, userID string) (*Tournament, error) {
	t, err := s.Repo.FindTournament(gID)
	if err != nil {
		return nil, err
	}

	idx := slices.Index(t.UserIDs, userID)
	if idx == -1 {
		return nil, fmt.Errorf("user not found")
	}

	t.UserIDs = append(t.UserIDs[:idx], t.UserIDs[idx+1:]...)

	return t, nil
}

func (s *Service) StartGame(g *Game) error {
	humanPlayers := len(g.UserIDs)
	if humanPlayers < 2 {
		return errors.New("must have at least 2 players")
	}
	botPlayers := 4 - humanPlayers
	slog.Info("Starting game", "ID", g.ID, "human", humanPlayers, "ai", botPlayers)

	g.ScrabbleGame = scrabble.NewGame(s.DAWG, &scrabble.HighScore{})
	for _, uID := range g.UserIDs {
		u, err := s.UserSvc.GetUser(uID)
		if err != nil {
			return err
		}
		g.ScrabbleGame.AddPlayer(scrabble.NewPlayer(u.ID, u.Username, g.ScrabbleGame.Bag))
	}
	for i := 0; i < botPlayers; i++ {
		g.ScrabbleGame.AddPlayer(scrabble.NewBot(uuid.NewString(), botNames[i], g.ScrabbleGame.Bag))
	}
	g.ScrabbleGame.Turn = g.ScrabbleGame.PlayerToMove().ID

	return nil
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

func (s *Service) ApplyPlayerMove(gID, pID string, req MoveInfo) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}
	if g.ScrabbleGame.IsOver() {
		return nil, ErrGameOver
	}
	player := g.ScrabbleGame.PlayerToMove()
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
		move = scrabble.NewTileMove(g.ScrabbleGame.Board, covers)
	case MoveTypeExchange:
		move = scrabble.NewExchangeMove(req.Letters)
	case MoveTypePass:
		move = scrabble.NewPassMove()
	default:
		return nil, fmt.Errorf("invalid move type: %s", req.Type)
	}

	if !move.IsValid(g.ScrabbleGame) {
		return nil, ErrInvalidMove
	}

	err = g.ScrabbleGame.ApplyValid(move)
	if err != nil {
		// Should not happen because move is valid
		return nil, fmt.Errorf("should not have ended up here. cannot apply move that was validated: %v", err)
	}

	return g, nil
}

func (s *Service) ApplyBotMove(gID string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	if !g.ScrabbleGame.PlayerToMove().IsBot {
		return nil, ErrNotBotTurn
	}

	// Make the bot think
	time.Sleep(time.Second * 1)

	state := g.ScrabbleGame.State()
	move := g.ScrabbleGame.Engine.GenerateMove(state)
	err = g.ScrabbleGame.ApplyValid(move)
	if err != nil {
		slog.Error("apply bot move", err)
	}

	return g, nil
}

func (s *Service) ReplacePlayerWithBot(gID, pID string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	p, err := g.ScrabbleGame.GetPlayer(pID)
	if err != nil {
		return nil, err
	}
	if p.IsBot {
		return nil, fmt.Errorf("player %s is a bot", pID)
	}

	p.IsBot = true
	p.Username = "Bot " + p.Username

	return g, nil
}

func (s *Service) GetIndices(gID string) ([]MoveInfo, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	moves := g.ScrabbleGame.Engine.GenerateBestTileMoves(g.ScrabbleGame.State())
	var indices []MoveInfo
	for _, move := range moves {
		tileMove := move.(*scrabble.TileMove)
		covers := make(map[string]string)
		for pos, letter := range tileMove.Covers {
			covers[stringifyPoint(pos)] = string(letter)
		}
		info := MoveInfo{
			Type:    MoveTypePlayTile,
			Letters: tileMove.Word,
			Covers:  covers,
		}
		indices = append(indices, info)
	}

	return indices, nil
}

func (s *Service) DeleteGame(gID string) error {
	err := s.Repo.DeleteGame(gID)
	if err != nil {
		return err
	}

	return nil
}

func (s *Service) AddObserver(gID string, oId string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}

	if g.ScrabbleGame == nil {
		return nil, ErrGameNotStarted
	}

	if g.IsPrivateGame == true {
		return nil, ErrPrivateGame
	}

	if g.ScrabbleGame.IsOver() {
		return nil, ErrGameOver
	}
	g.ObservateurIDs = append(g.ObservateurIDs, oId)
	return g, nil
}

func (s *Service) RemoveObserver(gID string, oId string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}
	if g.IsPrivateGame == true {
		return nil, ErrPrivateGame
	}
	if g.ScrabbleGame.IsOver() {
		return nil, ErrGameOver
	}
	for i, v := range g.ObservateurIDs {
		if v == oId {
			g.ObservateurIDs = append(g.ObservateurIDs[:i], g.ObservateurIDs[i+1:]...)
			return g, nil
		}
	}
	return nil, ErrObserverNotFound
}

func (s *Service) ReplaceBotByObserver(gID string, oId string) (*Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, err
	}
	if g.IsPrivateGame == true {
		return nil, ErrPrivateGame
	}
	if g.ScrabbleGame.IsOver() {
		return nil, ErrGameOver
	}
	user, err := s.UserSvc.GetUser(oId)
	if err != nil {
		return nil, err
	}

	for i, p := range g.ScrabbleGame.Players {
		if p.IsBot == true {
			g.ScrabbleGame.Players[i].IsBot = false
			g.ScrabbleGame.Players[i].Username = user.Username
			g.ScrabbleGame.Players[i].ID = user.ID
			for i, v := range g.ObservateurIDs {
				if v == oId {
					g.ObservateurIDs = append(g.ObservateurIDs[:i], g.ObservateurIDs[i+1:]...)
					break
				}
			}

			return g, nil
		}
	}
	return nil, errors.New("no bot in that game")
}

func (s *Service) MakeGamePrivate(gId string) (*Game, error) {
	g, err := s.Repo.FindGame(gId)
	if err != nil {
		return nil, err
	}
	if g.IsPrivateGame == true {
		return nil, ErrPrivateGame
	}
	if g.ScrabbleGame.IsOver() {
		return nil, ErrGameOver
	}
	g.IsPrivateGame = true
	return g, nil
}

func (s *Service) MakeGamePublic(gId string) (*Game, error) {
	g, err := s.Repo.FindGame(gId)
	if err != nil {
		return nil, err
	}
	if g.IsPrivateGame == false {
		return nil, ErrPublicGame
	}
	if g.ScrabbleGame.IsOver() {
		return nil, ErrGameOver
	}
	g.IsPrivateGame = false
	return g, nil
}

func (s *Service) NewTournament(creatorID string, withUserIDs []string) (*Tournament, error) {
	t := NewTournament(creatorID, withUserIDs)
	err := s.Repo.InsertTournament(t)

	return t, err
}

func (s *Service) StartTournament(t *Tournament) error {
	numPlayers := len(t.UserIDs)
	var numRounds int
	switch numPlayers {
	case 4:
		numRounds = 2
	case 8:
		numRounds = 3
	case 16:
		numRounds = 4
	}

	gameCounter := 1
	for roundNumber := 1; roundNumber <= numRounds; roundNumber++ {
		round := &Round{
			RoundNumber: roundNumber,
			Brackets:    make(map[int]*Bracket, 0),
			UserIDs:     make([]string, 0),
		}
		if roundNumber == 1 {
			round.UserIDs = t.UserIDs
		}

		numGames := numPlayers / (1 << uint(roundNumber))
		numBrackets := numGames / 2
		gamesPerBracket := 2
		if numBrackets == 0 {
			gamesPerBracket = 1
			numBrackets = 1
		}

		for bracketNumber := 1; bracketNumber <= numBrackets; bracketNumber++ {
			bracket := &Bracket{
				BracketNumber: bracketNumber,
				UserIDs:       make([]string, 0),
				Games:         make(map[string]*Game),
				WinnersIDs:    make([]string, 0, 2),
			}
			for len(bracket.Games) < gamesPerBracket {
				g := &Game{
					ID: uuid.NewString(),
					TournamentGameInfo: &TournamentGameInfo{
						TournamentID:  t.ID,
						RoundNumber:   roundNumber,
						BracketNumber: bracketNumber,
					},
				}
				if roundNumber == 1 {
					g.UserIDs = []string{
						t.UserIDs[gameCounter-1],
						t.UserIDs[numGames*2-gameCounter],
					}
					g.ScrabbleGame = scrabble.NewGame(s.DAWG, &scrabble.HighScore{})
					for _, uID := range g.UserIDs {
						u, err := s.UserSvc.GetUser(uID)
						if err != nil {
							return err
						}
						g.ScrabbleGame.AddPlayer(scrabble.NewPlayer(u.ID, u.Username, g.ScrabbleGame.Bag))
					}
					g.ScrabbleGame.Turn = g.ScrabbleGame.PlayerToMove().ID
				}
				if err := s.Repo.InsertGame(g); err != nil {
					return err // Should never happen
				}

				bracket.Games[g.ID] = g
				gameCounter++
			}
			round.Brackets[bracketNumber] = bracket
		}
		t.Rounds[roundNumber] = round
	}

	t.HasStarted = true
	t.Rounds[1].HasStarted = true

	return nil
}

func (s *Service) UpdateTournamentGameOver(gID string) (*Tournament, *Game, error) {
	g, err := s.Repo.FindGame(gID)
	if err != nil {
		return nil, nil, err
	}

	if !g.IsTournamentGame() {
		return nil, nil, errors.New("not a tournament game")
	}

	t, err := s.Repo.FindTournament(g.TournamentGameInfo.TournamentID)
	if err != nil {
		return nil, nil, err
	}

	currentRound := t.Rounds[g.TournamentGameInfo.RoundNumber]
	currentBracket := currentRound.Brackets[g.TournamentGameInfo.BracketNumber]
	currentBracket.WinnersIDs = append(currentBracket.WinnersIDs, g.ScrabbleGame.Winner().ID)

	if len(currentBracket.WinnersIDs) == 2 {
		nextRound, ok := t.Rounds[currentRound.RoundNumber+1]
		if !ok {
			// It was the finale
			t.IsOver = true
			return t, nil, nil
		}
		// Start next round with both winners
		nextRound.HasStarted = true
		nextRound.UserIDs = currentBracket.WinnersIDs

		nextBracketNum := int(math.Round(float64(currentBracket.BracketNumber) / 2))
		nextBracket := nextRound.Brackets[nextBracketNum]

		// Create new nextGame with both winners
		nextGame := &Game{
			ID: uuid.NewString(),
			TournamentGameInfo: &TournamentGameInfo{
				TournamentID:  t.ID,
				RoundNumber:   nextRound.RoundNumber,
				BracketNumber: nextBracket.BracketNumber,
			},
			UserIDs: currentBracket.WinnersIDs,
		}
		if err := s.Repo.InsertGame(nextGame); err != nil {
			return nil, nextGame, err // Should never happen
		}

		nextBracket.Games[nextGame.ID] = nextGame
	}

	return t, nil, nil
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

func stringifyPoint(point scrabble.Position) string {
	return fmt.Sprintf("%d/%d", point.Row, point.Col)
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
