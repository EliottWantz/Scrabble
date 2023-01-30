package user

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/exp/slog"
)

type Repository struct {
	coll *mongo.Collection
}

func (r *Repository) Find(username string) (*User, error) {
	u := &User{}
	res := r.coll.FindOne(
		context.TODO(),
		bson.M{"username": username},
	)
	if err := res.Err(); err != nil {
		return nil, err
	}

	if err := res.Decode(u); err != nil {
		return nil, err
	}

	slog.Info("Find user", "user", u)

	return u, nil
}

func (r *Repository) Insert(a *User) error {
	res, err := r.coll.InsertOne(context.TODO(), a)
	if err != nil {
		return err
	}

	slog.Info("Insert user", "user", res)

	return nil
}

func (r *Repository) Delete(username string) error {
	_, err := r.coll.DeleteOne(context.TODO(), bson.M{"username": username})
	if err != nil {
		return err
	}

	return nil
}
