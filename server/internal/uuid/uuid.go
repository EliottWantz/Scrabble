package uuid

import (
	"strings"

	googleuuid "github.com/google/uuid"
)

var Nil UUID

type UUID struct {
	googleuuid.UUID
}

func (uuid *UUID) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "" {
		uuid.UUID = googleuuid.Nil
	} else {
		id, err := googleuuid.Parse(s)
		if err != nil {
			return err
		}
		uuid.UUID = id
	}

	return nil
}

func New() UUID {
	return UUID{googleuuid.New()}
}

func (uuid UUID) String() string {
	return uuid.UUID.String()
}
