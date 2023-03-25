package game

import (
	"errors"
	"sync"

	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrGameNotFound             = errors.New("game not found")
	ErrTournamentNotFound       = errors.New("tournament not found")
	ErrInsertExistingGame       = errors.New("game already exists, cannot insert")
	ErrInsertExistingTournament = errors.New("tournament already exists, cannot insert")
)

type Repository struct {
	mu    sync.Mutex
	games map[string]*Game

	tmu         sync.Mutex
	tournaments map[string]*Tournament
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		games: make(map[string]*Game),
	}
}

func (r *Repository) FindGame(ID string) (*Game, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	g, ok := r.games[ID]
	if !ok {
		return nil, ErrGameNotFound
	}

	return g, nil
}

func (r *Repository) FindAllGames() ([]*Game, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	games := make([]*Game, 0, len(r.games))
	for _, g := range r.games {
		games = append(games, g)
	}

	return games, nil
}

func (r *Repository) InsertGame(g *Game) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, ok := r.games[g.ID]
	if ok {
		return ErrInsertExistingGame
	}

	r.games[g.ID] = g

	return nil
}

func (r *Repository) DeleteGame(ID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, ok := r.games[ID]
	if !ok {
		return ErrGameNotFound
	}

	delete(r.games, ID)

	return nil
}

func (r *Repository) FindTournament(ID string) (*Tournament, error) {
	r.tmu.Lock()
	defer r.tmu.Unlock()

	t, ok := r.tournaments[ID]
	if !ok {
		return nil, ErrTournamentNotFound
	}

	return t, nil
}

func (r *Repository) FindAllTournaments() ([]*Tournament, error) {
	r.tmu.Lock()
	defer r.tmu.Unlock()

	tournaments := make([]*Tournament, 0, len(r.tournaments))
	for _, t := range r.tournaments {
		tournaments = append(tournaments, t)
	}

	return tournaments, nil
}

func (r *Repository) InsertTournament(t *Tournament) error {
	r.tmu.Lock()
	defer r.tmu.Unlock()

	_, ok := r.tournaments[t.ID]
	if ok {
		return ErrInsertExistingTournament
	}

	r.tournaments[t.ID] = t

	return nil
}

func (r *Repository) DeleteTournament(ID string) error {
	r.tmu.Lock()
	defer r.tmu.Unlock()

	_, ok := r.tournaments[ID]
	if !ok {
		return ErrTournamentNotFound
	}

	delete(r.tournaments, ID)

	return nil
}
