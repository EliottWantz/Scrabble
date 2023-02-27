package ws

import "go.mongodb.org/mongo-driver/mongo"

type RoomRepository struct {
	coll *mongo.Collection
}

func NewRoomRepository(db *mongo.Database) *RoomRepository {
	return &RoomRepository{
		coll: db.Collection("rooms"),
	}
}
