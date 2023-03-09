package game

import (
	"errors"
	"sync"

	"scrabble/pkg/scrabble"

	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrGameNotFound       = errors.New("game not found")
	ErrInsertExistingGame = errors.New("game already exists, cannot insert")
)

type Repository struct {
	coll *mongo.Collection

	mu    sync.Mutex
	games map[string]*scrabble.Game
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		coll:  db.Collection("games"),
		games: make(map[string]*scrabble.Game),
	}
}

func (r *Repository) GetGame(ID string) (*scrabble.Game, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	g, ok := r.games[ID]
	if !ok {
		return nil, ErrGameNotFound
	}

	return g, nil
}

func (r *Repository) Insert(g *scrabble.Game) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, ok := r.games[g.ID]
	if ok {
		return ErrInsertExistingGame
	}

	r.games[g.ID] = g

	return nil
}
