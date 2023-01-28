package account

type Account struct {
	Id       string `bson:"_id,omitempty" json:"id,omitempty"`
	Username string `bson:"username" json:"username"`
	Password string `bson:"password" json:"password"`
}
