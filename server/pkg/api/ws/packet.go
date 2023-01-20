package ws

import "scrabble/internal/uuid"

type Action int

const (
	ActionNoAction Action = iota
	ActionJoinRoom
	ActionBroadCast
)

type Packet struct {
	Action Action    `json:"action,omitempty"`
	RoomID uuid.UUID `json:"roomId,omitempty"`
	Data   any       `json:"data,omitempty"`
}
