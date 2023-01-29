package user

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	coll *mongo.Collection
}

func (r *Repository) Find(username string) (*User, error) {
	a := &User{}
	res := r.coll.FindOne(
		context.TODO(),
		bson.M{"username": username},
	)
	if err := res.Err(); err != nil {
		log.Println("Find error:", err)
		return nil, err
	}

	if err := res.Decode(a); err != nil {
		log.Println("Find decode error:", err)
		return nil, err
	}

	log.Println("Find:", a)

	return a, nil
}

func (r *Repository) Insert(a *User) error {
	res, err := r.coll.InsertOne(context.TODO(), a)
	if err != nil {
		log.Println("Insert error:", err)
		return err
	}
	log.Println("Insert:", res)

	return nil
}
