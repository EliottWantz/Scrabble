package ws

import (
	"encoding/json"
	"fmt"
	"time"
)

type Packet struct {
	Event   string          `json:"event,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

func NewPacket(event string, payload any) (*Packet, error) {
	p, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return &Packet{
		Event:   event,
		Payload: p,
	}, nil
}

func (p *Packet) setPayload(payload any) error {
	raw, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("can't create payload: %w", err)
	}
	p.Payload = raw

	return nil
}

// Client events payloads
type JoinPayload struct {
	RoomID string `json:"roomId,omitempty"`
}
type LeavePayload = JoinPayload

type ChatMessage struct {
	RoomID    string    `json:"roomId,omitempty" bson:"roomId"`
	Message   string    `json:"message,omitempty" bson:"message"`
	From      string    `json:"from,omitempty" bson:"from"`
	Timestamp time.Time `json:"timestamp,omitempty" bson:"timestamp"`
}

// Server events payloads
type JoinedGlobalRoomPayload struct {
	RoomID string `json:"roomId,omitempty"`
}
