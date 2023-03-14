package room

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	coll *mongo.Collection
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{coll: db.Collection("rooms")}
}

func (r *Repository) Insert(room *Room) error {
	_, err := r.coll.InsertOne(context.Background(), room)
	return err
}

func (r *Repository) Find(ID string) (*Room, error) {
	var roomDB Room
	err := r.coll.FindOne(
		context.Background(),
		bson.M{"_id": ID},
	).Decode(&roomDB)
	if err != nil {
		return nil, err
	}

	return &roomDB, nil
}

func (r *Repository) FindAll() ([]Room, error) {
	rooms := make([]Room, 0)
	cursor, err := r.coll.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var roomDB Room
		err := cursor.Decode(&roomDB)
		if err != nil {
			return nil, err
		}
		if roomDB.ID == "global" {
			continue
		}
		rooms = append(rooms, roomDB)
	}

	return rooms, nil
}

func (r *Repository) AddUser(roomID, userID string) error {
	_, err := r.coll.UpdateByID(
		context.Background(),
		roomID,
		bson.M{"$addToSet": bson.M{"userIds": userID}},
	)
	return err
}

func (r *Repository) RemoveUser(roomID, userID string) error {
	_, err := r.coll.UpdateByID(
		context.Background(),
		roomID,
		bson.M{"$pull": bson.M{"userIds": userID}},
	)
	return err
}

func (r *Repository) Delete(ID string) error {
	_, err := r.coll.DeleteOne(
		context.Background(),
		bson.M{"_id": ID},
	)

	return err
}
