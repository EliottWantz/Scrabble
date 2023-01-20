package ws

import "scrabble/internal/uuid"

type Emitter interface {
	emit(to uuid.UUID, op operation)
}

type Listener interface {
	on(act Action, op operation)
}

type BroadCaster interface {
	Emitter
	Listener
}

type roomBroadCaster struct {
	room *Room
	from uuid.UUID
	to   uuid.UUID
	msg  any
}

var _ BroadCaster = (*roomBroadCaster)(nil)

func (rbc *roomBroadCaster) emit(to uuid.UUID, op operation) {
	panic("not implemented") // TODO: Implement
}

func (rbc *roomBroadCaster) on(act Action, op operation) {
	panic("not implemented") // TODO: Implement
}
