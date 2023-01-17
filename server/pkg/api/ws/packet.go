package ws

import "github.com/google/uuid"

type Packet struct {
	Type   string    `json:"type,omitempty"`
	RoomID uuid.UUID `json:"roomId,omitempty"`
	Data   any       `json:"data,omitempty"`
}
