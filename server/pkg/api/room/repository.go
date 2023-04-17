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

func (r *Repository) Update(room *Room) error {
	_, err := r.coll.UpdateByID(context.Background(), room.ID, bson.M{"$set": room})
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
	room, err := r.Find(roomID)
	if err != nil {
		return err
	}

	// Remove user from room
	for i, id := range room.UserIDs {
		if id == userID {
			room.UserIDs = append(room.UserIDs[:i], room.UserIDs[i+1:]...)
			break
		}
	}

	// Delete room if no user left
	if room.UserIDs == nil || len(room.UserIDs) == 0 {
		if err := r.Delete(roomID); err != nil {
			return err
		}
	}

	// Update room
	if err := r.Update(room); err != nil {
		return err
	}
	return nil
}

func (r *Repository) Delete(ID string) error {
	_, err := r.coll.DeleteOne(
		context.Background(),
		bson.M{"_id": ID},
	)

	return err
}
