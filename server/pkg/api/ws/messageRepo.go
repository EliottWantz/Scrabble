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

func NewRepository(db *mongo.Database) *MessageRepository {
	return &MessageRepository{
		coll: db.Collection("messages"),
	}
}

type messageHistory struct {
	RoomID   string        `bson:"_id"`
	Messages []ChatMessage `bson:"messages"`
}

// Insert the stored message into the bucket of id roomID. Each bucket holds
// 20 messages.
func (r *MessageRepository) InsertOne(roomID string, msg *ChatMessage) error {
	_, err := r.coll.UpdateOne(
		context.Background(),
		bson.M{
			"_id": roomID,
		},
		bson.M{
			"$push": bson.M{
				"messages": msg,
			},
		},
		options.Update().SetUpsert(true),
	)

	return err
}

func (r *MessageRepository) LatestMessage(roomID string) ([]ChatMessage, error) {
	roomMessage := &messageHistory{}
	res := r.coll.FindOne(
		context.Background(),
		bson.M{"_id": roomID},
	)
	if err := res.Err(); err != nil {
		return nil, err
	}
	if err := res.Decode(roomMessage); err != nil {
		return nil, err
	}

	return roomMessage.Messages, nil
}
