package room

type Room struct {
	ID      string   `bson:"_id"`
	UserIDs []string `bson:"usersIds"`
}
