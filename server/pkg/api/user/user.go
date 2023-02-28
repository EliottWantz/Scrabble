package user

type User struct {
	ID             string `bson:"_id,omitempty" json:"id,omitempty"`
	Username       string `bson:"username" json:"username,omitempty"`
	HashedPassword string `bson:"password" json:"-"`
	Email          string `bson:"email" json:"email,omitempty"`
	Avatar         Avatar `bson:"avatar" json:"avatar,omitempty"`
	Preferences    Preferences
}

type PublicUser struct {
	ID       string `bson:"_id,omitempty" json:"id,omitempty"`
	Username string `bson:"username" json:"username,omitempty"`
	Avatar   Avatar `bson:"avatar" json:"avatar,omitempty"`
}
