package ws

import (
	"errors"
)

var ErrRoomNotRegistered = errors.New("room is not registered")

type broadCaster struct {
	room *room
	from string
}

func (bc *broadCaster) emit(a Action, msg any) error {
	if bc.room == nil {
		return ErrRoomNotRegistered
	}

	p := &packet{
		Action: a,
		RoomID: bc.room.ID,
		Data:   msg,
	}

	for _, c := range bc.room.Clients {
		if c.ID == bc.from {
			continue
		}

		c.sendPacket(p)
	}

	return nil
}
