package ws

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type RoomRepository struct {
	coll *mongo.Collection
}

type RoomDB struct {
	ID       string   `bson:"_id"`
	UsersIDs []string `bson:"usersIds"`
}

func NewRoomRepository(db *mongo.Database) *RoomRepository {
	return &RoomRepository{
		coll: db.Collection("rooms"),
	}
}

func (r *RoomRepository) Insert(room *Room) error {
	roomDB := RoomDB{
		ID:       room.ID,
		UsersIDs: room.ListClientIDs(),
	}

	_, err := r.coll.InsertOne(context.Background(), roomDB)
	return err
}

func (r *RoomRepository) Get(roomID string) (*RoomDB, error) {
	var roomDB RoomDB
	err := r.coll.FindOne(
		context.Background(),
		bson.M{"_id": roomID},
	).Decode(&roomDB)
	if err != nil {
		return nil, err
	}

	return &roomDB, nil
}

func (r *RoomRepository) Update(room *Room) error {
	roomDB := RoomDB{
		ID:       room.ID,
		UsersIDs: room.ListClientIDs(),
	}

	_, err := r.coll.ReplaceOne(
		context.Background(),
		bson.M{"_id": room.ID},
		roomDB,
		options.Replace().SetUpsert(true),
	)

	return err
}
