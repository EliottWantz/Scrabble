package ws

import (
	"errors"
	"strings"

	"github.com/google/uuid"
)

type ID struct {
	uuid.UUID
}

func (my *ID) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "" {
		my.UUID = uuid.Nil
	} else {
		id, err := uuid.Parse(s)
		if err != nil {
			return errors.New("could not parse UUID")
		}
		my.UUID = id
	}

	return nil
}
