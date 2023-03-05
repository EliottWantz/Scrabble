package user

type User struct {
	ID              string      `bson:"_id,omitempty" json:"id,omitempty"`
	Username        string      `bson:"username" json:"username,omitempty"`
	HashedPassword  string      `bson:"password" json:"-"`
	Email           string      `bson:"email" json:"email,omitempty"`
	Avatar          Avatar      `bson:"avatar" json:"avatar,omitempty"`
	Preferences     Preferences `bson:"preferences" json:"preferences,omitempty"`
	JoinedChatRooms []string    `bson:"joinedChatRooms" json:"joinedChatRooms"`
}

type PublicUser struct {
	ID       string `bson:"_id,omitempty" json:"id,omitempty"`
	Username string `bson:"username" json:"username,omitempty"`
	Avatar   Avatar `bson:"avatar" json:"avatar,omitempty"`
}
