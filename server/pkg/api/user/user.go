package user

type User struct {
	ID       string `bson:"_id,omitempty" json:"id,omitempty"`
	Username string `bson:"username" json:"username,omitempty"`
}
