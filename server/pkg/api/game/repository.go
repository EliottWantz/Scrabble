package game

import "go.mongodb.org/mongo-driver/mongo"

type Repository struct {
	coll *mongo.Collection
}
