package user

type User struct {
	Id             string `bson:"_id,omitempty" json:"id,omitempty"`
	Username       string `bson:"username" json:"username,omitempty"`
	HashedPassword string `bson:"password" json:"-"`
}