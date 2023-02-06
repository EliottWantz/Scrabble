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

func (p *Packet) marshallPayload(payload any) error {
	raw, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("can't create broadcast payload: %w", err)
	}
	p.Payload = raw

	return nil
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
