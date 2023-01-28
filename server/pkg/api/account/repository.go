package account

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	coll *mongo.Collection
}

func (r *Repository) Find(username string) (*Account, error) {
	a := &Account{}
	err := r.coll.FindOne(
		context.TODO(),
		bson.D{{Key: "username", Value: username}},
	).Decode(a)
	log.Println("Find:", a, "Error:", err)

	return a, err
}
