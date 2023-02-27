package ws

import (
	"scrabble/pkg/api/user"

	"go.mongodb.org/mongo-driver/mongo"
)

type RoomRepository struct {
	coll *mongo.Collection
}

type RoomDB struct {
	ID    string             `bson:"_id"`
	Users []*user.PublicUser `bson:"users"`
}

func NewRoomRepository(db *mongo.Database) *RoomRepository {
	return &RoomRepository{
		coll: db.Collection("rooms"),
	}
}

// func (r *RoomRepository) AddRoom(room *Room) error {
// 	var (
// 		roomDB RoomDB
// 		users  []*user.PublicUser
// 	)

// }
