package user

type User struct {
	Id       string `bson:"_id,omitempty" json:"id,omitempty"`
	Username string `bson:"username" json:"username"`
	Password string `bson:"password" json:"-"`
	Token    string `bson:"token" json:"token"`
}
