package ws

import (
	"encoding/json"
	"time"
)

type Packet struct {
	Event   string          `json:"event,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

func NewPacket(event string, payload any) *Packet {
	p, _ := json.Marshal(payload)
	return &Packet{
		Event:   event,
		Payload: p,
	}
}

// Client events payloads
type JoinPayload struct {
	RoomID string `json:"roomId,omitempty"`
}
type LeavePayload = JoinPayload

type BroadcastPayload struct {
	RoomID    string    `json:"roomId,omitempty"`
	Message   string    `json:"message,omitempty"`
	From      string    `json:"from,omitempty"`
	Timestamp time.Time `json:"timestamp,omitempty"`
}

// Server events payloads
type JoinedGlobalRoomPayload struct {
	RoomID string `json:"roomId,omitempty"`
}
