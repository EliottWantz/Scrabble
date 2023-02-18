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

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		coll: db.Collection("users"),
	}
}

func (r *Repository) Find(ID string) (*User, error) {
	u := &User{}
	res := r.coll.FindOne(
		context.TODO(),
		bson.M{"_id": ID},
	)
	if err := res.Err(); err != nil {
		return nil, err
	}

	if err := res.Decode(u); err != nil {
		return nil, err
	}

	slog.Info("Find user", "user", u.Username)

	return u, nil
}

func (r *Repository) FindByUsername(username string) (*User, error) {
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

	slog.Info("Find user", "user", u.Username)

	return u, nil
}

func (r *Repository) Has(ID string) bool {
	u := &User{}
	res := r.coll.FindOne(
		context.TODO(),
		bson.M{"_id": ID},
	)
	if err := res.Err(); err != nil {
		return false
	}

	if err := res.Decode(u); err != nil {
		return false
	}

	slog.Info("Find user", "user", u.Username)

	return true
}

func (r *Repository) Insert(u *User) error {
	_, err := r.coll.InsertOne(context.TODO(), u)
	if err != nil {
		return err
	}

	slog.Info("Inserted user", "user", u.Username)

	return nil
}

func (r *Repository) Update(u *User) error {
	_, err := r.coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": u.Id},
		bson.M{"$set": u},
	)
	if err != nil {
		return err
	}

	slog.Info("Updated user", "user", u.Username)

	return nil
}

func (r *Repository) Delete(username string) error {
	_, err := r.coll.DeleteOne(context.TODO(), bson.M{"username": username})
	if err != nil {
		return err
	}

	slog.Info("Deleted user", "user", username)

	return nil
}
