package ws

import (
	"errors"

	"scrabble/internal/uuid"
)

var ErrNoRoom = errors.New("no room to broadcast to")

type Emitter interface {
	emit(a Action, msg any) error
}

type Listener interface {
	on(a Action, op operation)
}

type BroadCaster interface {
	Emitter
	Listener
}

type roomBroadCaster struct {
	room *room
	from uuid.UUID
}

var _ BroadCaster = (*roomBroadCaster)(nil)

func (rbc *roomBroadCaster) emit(a Action, msg any) error {
	if rbc.room == nil {
		return ErrNoRoom
	}

	p := &packet{
		Action: a,
		RoomID: rbc.room.id,
		Data:   msg,
	}

	for _, c := range rbc.room.clients {
		if c.id == rbc.from {
			continue
		}

		go func(c *client, p *packet) {
			c.queueOp(func() error { return c.sendPacket(p) })
		}(c, p)
	}

	return nil
}

func (rbc *roomBroadCaster) on(act Action, op operation) {
	panic("not implemented") // TODO: Implement
}
