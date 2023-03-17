package game

import (
	"errors"
	"sync"

	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrGameNotFound       = errors.New("game not found")
	ErrInsertExistingGame = errors.New("game already exists, cannot insert")
)

type Repository struct {
	mu    sync.Mutex
	games map[string]*Game
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		games: make(map[string]*Game),
	}
}

func (r *Repository) Find(ID string) (*Game, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	g, ok := r.games[ID]
	if !ok {
		return nil, ErrGameNotFound
	}

	return g, nil
}

func (r *Repository) FindAll() ([]*Game, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	games := make([]*Game, 0, len(r.games))
	for _, g := range r.games {
		games = append(games, g)
	}

	return games, nil
}

func (r *Repository) Insert(g *Game) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, ok := r.games[g.ID]
	if ok {
		return ErrInsertExistingGame
	}

	r.games[g.ID] = g

	return nil
}

func (r *Repository) Delete(ID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, ok := r.games[ID]
	if !ok {
		return ErrGameNotFound
	}

	delete(r.games, ID)

	return nil
}
