package ws

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MessageRepository struct {
	coll *mongo.Collection
}

type RoomRepository struct {
	coll *mongo.Collection
}

func NewMessageRepository(db *mongo.Database) *MessageRepository {
	return &MessageRepository{
		coll: db.Collection("messages"),
	}
}

func NewRoomRepository(db *mongo.Database) *RoomRepository {
	return &RoomRepository{
		coll: db.Collection("rooms"),
	}
}

type Bucket struct {
	RoomID  string        `bson:"roomId"`
	Count   int           `bson:"count"`
	History []ChatMessage `bson:"history"`
}

// Insert the stored message into the bucket of id roomID. Each bucket holds
// 20 messages.
func (r *MessageRepository) InsertOne(roomID string, msg *ChatMessage) error {
	_, err := r.coll.UpdateOne(
		context.Background(),
		bson.M{
			"roomId": roomID,
			"count": bson.M{
				"$lt": 20,
			},
		},
		bson.M{
			"$push": bson.M{
				"history": msg,
			},
			"$inc": bson.M{
				"count": 1,
			},
		},
		options.Update().SetUpsert(true),
	)

	return err
}

func (r *MessageRepository) LatestMessage(roomID string, skip int) ([]ChatMessage, error) {
	var b Bucket
	if err := r.coll.FindOne(
		context.Background(),
		bson.M{
			"roomId": roomID,
		},
		options.FindOne().SetSort(
			bson.D{{Key: "_id", Value: -1}},
		).SetSkip(int64(skip)),
	).Decode(&b); err != nil {
		return nil, err
	}
	return b.History, nil
}
