package user

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
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

	return u, nil
}

func (r *Repository) FindAll() ([]User, error) {
	users := make([]User, 0)
	res, err := r.coll.Find(context.TODO(), bson.M{})
	if err != nil {
		return nil, err
	}
	err = res.All(context.Background(), &users)
	if err != nil {
		return nil, err
	}

	return users, nil
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

	return true
}

func (r *Repository) Insert(u *User) error {
	_, err := r.coll.InsertOne(context.TODO(), u)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) Update(u *User) error {
	_, err := r.coll.UpdateOne(
		context.TODO(),
		bson.M{"_id": u.ID},
		bson.M{"$set": u},
	)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) AddJoinedRoom(roomID, userID string) error {
	_, err := r.coll.UpdateByID(
		context.Background(),
		userID,
		bson.M{"$addToSet": bson.M{"joinedChatRooms": roomID}},
	)
	return err
}

func (r *Repository) RemoveJoinedRoom(roomID, userID string) error {
	_, err := r.coll.UpdateByID(
		context.Background(),
		userID,
		bson.M{"$pull": bson.M{"joinedChatRooms": roomID}},
	)
	return err
}

func (r *Repository) AddJoinedDMRoom(roomID, userID string) error {
	_, err := r.coll.UpdateByID(
		context.Background(),
		userID,
		bson.M{"$addToSet": bson.M{"joinedDMRooms": roomID}},
	)
	return err
}

func (r *Repository) RemoveJoinedDMRoom(roomID, userID string) error {
	_, err := r.coll.UpdateByID(
		context.Background(),
		userID,
		bson.M{"$pull": bson.M{"joinedDMRooms": roomID}},
	)
	return err
}

func (r *Repository) Delete(ID string) error {
	_, err := r.coll.DeleteOne(context.TODO(), bson.M{"_id": ID})
	if err != nil {
		return err
	}

	return nil
}
