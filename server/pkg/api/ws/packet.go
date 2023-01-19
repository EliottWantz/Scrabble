package ws

import "github.com/google/uuid"

type Action int

const (
	ActionJoinRoom Action = iota + 1
)

type Packet struct {
	Action Action    `json:"action,omitempty"`
	RoomID uuid.UUID `json:"roomId,omitempty"`
	Data   any       `json:"data,omitempty"`
}
