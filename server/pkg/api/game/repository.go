package game

import "go.mongodb.org/mongo-driver/mongo"

type Repository struct {
	coll *mongo.Collection
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		coll: db.Collection("games"),
	}
}
