package room

type Room struct {
	ID         string   `bson:"_id" json:"id"`
	Name       string   `bson:"name" json:"name"`
	CreatorID  string   `bson:"creatorId" json:"creatorId"`
	UserIDs    []string `bson:"userIds" json:"userIds"`
	IsGameRoom bool     `bson:"isGameRoom" json:"isGameRoom"`
}
