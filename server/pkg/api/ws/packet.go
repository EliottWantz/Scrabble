package ws

import (
	"encoding/json"
	"fmt"
	"time"

	"scrabble/pkg/api/game"
	"scrabble/pkg/api/user"
)

type Packet struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

func NewPacket(event string, payload any) (*Packet, error) {
	p, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("can't create payload: %w", err)
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

type ChatMessage struct {
	RoomID    string    `json:"roomId" bson:"roomId"`
	Message   string    `json:"message" bson:"message"`
	From      string    `json:"from" bson:"from"`
	FromID    string    `json:"fromId" bson:"fromId"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
}

type PlayMovePayload struct {
	GameID   string        `json:"gameId"`
	PlayerID string        `json:"playerId"`
	MoveInfo game.MoveInfo `json:"moveInfo"`
}

// Server events payloads
type JoinedRoomPayload struct {
	RoomID   string            `json:"roomId"`
	Users    []user.PublicUser `json:"users"`
	Messages []ChatMessage     `json:"messages"`
}

func NewJoinedRoomPacket(payload JoinedRoomPayload) (*Packet, error) {
	p, err := NewPacket(ServerEventJoinedRoom, payload)
	if err != nil {
		return nil, err
	}
	return p, nil
}

type UserJoinedPayload struct {
	RoomID string          `json:"roomId"`
	User   user.PublicUser `json:"user"`
}

func NewUserJoinedPacket(payload UserJoinedPayload) (*Packet, error) {
	p, err := NewPacket(ServerEventUserJoined, payload)
	if err != nil {
		return nil, err
	}
	return p, nil
}

type ListUsersPayload struct {
	Users []user.PublicUser `json:"users"`
}

func NewListUsersPacket(payload ListUsersPayload) (*Packet, error) {
	p, err := NewPacket(ServerEventListUsers, payload)
	if err != nil {
		return nil, err
	}
	return p, nil
}

type GameUpdatePayload struct {
	Game *game.Game `json:"game"`
}

func NewGameUpdatePacket(payload GameUpdatePayload) (*Packet, error) {
	p, err := NewPacket(ServerEventGameUpdate, payload)
	if err != nil {
		return nil, err
	}
	return p, nil
}
