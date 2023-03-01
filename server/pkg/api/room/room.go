package room

type Room struct {
	ID      string   `bson:"_id"`
	Name    string   `bson:"name"`
	UserIDs []string `bson:"userIds"`
}
