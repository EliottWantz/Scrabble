package ws

import (
	"context"
	"encoding/json"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository struct {
	coll *mongo.Collection
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		coll: db.Collection("messages"),
	}
}

type StoredMessage struct {
	RoomID  string          `bson:"roomId"`
	Payload json.RawMessage `bson:"payload"`
}

func newStoredMessage(roomID string, payload json.RawMessage) StoredMessage {
	return StoredMessage{
		RoomID:  roomID,
		Payload: payload,
	}
}

func (r *Repository) InsertOne(roomID string, payload json.RawMessage) error {
	_, err := r.coll.InsertOne(
		context.Background(),
		newStoredMessage(roomID, payload))
	return err
}

// Function that get the last 20 messages from a given room
// func (r *Repository) GetMessages(roomID string) ([]StoredMessage, error) {
// 	var messages []StoredMessage
// 	err := r.coll.Find(
// 		context.Background(),
// 		bson.M{
// 			"roomId": roomID,
// 		}).Sort("-timestamp").Limit(20).All(&messages)
// 	return messages, err
// }

// Function that get the last 2 messages from a given room
func (r *Repository) GetMessages(roomID string) ([]StoredMessage, error) {
	opts := options.Find().SetBatchSize(2)
	cursor, err := r.coll.Find(
		context.Background(),
		bson.M{
			"roomId": roomID,
		},
		opts)
	if err != nil {
		return nil, err
	}
	var messages []StoredMessage
	for cursor.Next(context.Background()) {
		var message StoredMessage
		cursor.Decode(&message)
		messages = append(messages, message)
	}
	return messages, nil
}
