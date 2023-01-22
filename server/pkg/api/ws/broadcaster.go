package ws

import (
	"errors"

	"scrabble/internal/uuid"
)

var ErrNoRoom = errors.New("no room to broadcast to")

type broadCaster struct {
	room *room
	from uuid.UUID
}

func (bc *broadCaster) emit(a Action, msg any) error {
	if bc.room == nil {
		return ErrNoRoom
	}

	p := &packet{
		Action: a,
		RoomID: bc.room.id,
		Data:   msg,
	}

	for _, c := range bc.room.clients {
		if c.id == bc.from {
			continue
		}

		c.queueOp(func() error { return c.sendPacket(p) })
	}

	return nil
}
