package storage

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ErrNoDocumentsFound = errors.New("no documents found")

func OpenDB(uri, dbName string, timeout time.Duration) (*mongo.Database, error) {
	opts := options.Client().ApplyURI(uri)
	opts.SetTimeout(timeout)
	client, err := mongo.Connect(context.Background(), opts)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(context.Background(), nil); err != nil {
		return nil, err
	}

	return client.Database(dbName), nil
}

func CloseDB(db *mongo.Database) error {
	return db.Client().Disconnect(context.Background())
}
