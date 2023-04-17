package room

type Room struct {
	ID      string   `bson:"_id" json:"id"`
	Name    string   `bson:"name" json:"name"`
	UserIDs []string `bson:"userIds" json:"userIds"`
}
