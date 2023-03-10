package room

type Room struct {
	ID        string   `bson:"_id"`
	Name      string   `bson:"name"`
	CreatorID string   `bson:"creatorId"`
	UserIDs   []string `bson:"userIds"`
}
