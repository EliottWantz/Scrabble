package ws

import (
	"encoding/json"
	"fmt"
	"time"

	"scrabble/pkg/api/game"
	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"
	"scrabble/pkg/scrabble"
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

type JoinRoomPayload struct {
	RoomID string `json:"roomId"`
}

type JoinDMPayload struct {
	Username   string `json:"username"`
	ToID       string `json:"toId"`
	ToUsername string `json:"toUsername"`
}

type CreateRoomPayload struct {
	RoomName string   `json:"roomName"`
	UserIDs  []string `json:"userIds"`
}

type CreateGameRoomPayload struct {
	UserIDs []string `json:"userIds"`
}

type LeaveRoomPayload struct {
	RoomID string `json:"roomId"`
}

type PlayMovePayload struct {
	GameID   string        `json:"gameId"`
	MoveInfo game.MoveInfo `json:"moveInfo"`
}

type StartGamePayload struct {
	RoomID string `json:"roomId"`
}

// Server events payloads
type JoinedRoomPayload struct {
	RoomID    string        `json:"roomId"`
	RoomName  string        `json:"roomName"`
	CreatorID string        `json:"creatorId"`
	Users     []*user.User  `json:"users"`
	Messages  []ChatMessage `json:"messages"`
}

func NewJoinedRoomPacket(payload JoinedRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventJoinedRoom, payload)
}

type LeftRoomPayload struct {
	RoomID string `json:"roomId"`
}

func NewLeftRoomPacket(payload LeftRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventLeftRoom, payload)
}

type UserJoinedPayload struct {
	RoomID string     `json:"roomId"`
	User   *user.User `json:"user"`
}

func NewUserJoinedPacket(payload UserJoinedPayload) (*Packet, error) {
	return NewPacket(ServerEventUserJoined, payload)
}

type ListUsersPayload struct {
	Users []user.User `json:"users"`
}

func NewListUsersPacket(payload ListUsersPayload) (*Packet, error) {
	return NewPacket(ServerEventListUsers, payload)
}

type NewUserPayload struct {
	User *user.User `json:"user"`
}

func NewNewUserPacket(payload NewUserPayload) (*Packet, error) {
	return NewPacket(ServerEventNewUser, payload)
}

type ListChatRoomsPayload struct {
	Rooms []room.Room `json:"rooms"`
}

func NewListChatRoomsPacket(payload ListChatRoomsPayload) (*Packet, error) {
	return NewPacket(ServerEventListChatRooms, payload)
}

type ListJoinableGamesPayload struct {
	Games []room.Room `json:"games"`
}

func NewJoinableGamesPacket(payload ListJoinableGamesPayload) (*Packet, error) {
	return NewPacket(ServerEventJoinableGames, payload)
}

type Game struct {
	ID           string                  `json:"id"`
	Players      []*scrabble.Player      `json:"players"`
	Board        [15][15]scrabble.Square `json:"board"`
	Finished     bool                    `json:"finished"`
	NumPassMoves int                     `json:"numPassMoves"`
	Turn         string                  `json:"turn"`
	Timer        time.Duration           `json:"timer"`
}

func makeGamePayload(g *scrabble.Game) *Game {
	return &Game{
		ID:           g.ID,
		Players:      g.Players,
		Board:        g.Board.Squares,
		Finished:     g.Finished,
		NumPassMoves: g.NumPassMoves,
		Turn:         g.Turn,
		Timer:        g.Timer.TimeRemaining(),
	}
}

type GameUpdatePayload struct {
	Game *Game `json:"game"`
}

func NewGameUpdatePacket(payload GameUpdatePayload) (*Packet, error) {
	return NewPacket(ServerEventGameUpdate, payload)
}

type TimerUpdatePayload struct {
	Timer time.Duration `json:"timer"`
}

func NewTimerUpdatePacket(payload TimerUpdatePayload) (*Packet, error) {
	return NewPacket(ServerEventTimerUpdate, payload)
}

type GameOverPayload struct {
	WinnerID string `json:"winnerId"`
}

func NewGameOverPacket(payload GameOverPayload) (*Packet, error) {
	return NewPacket(ServerEventGameOver, payload)
}

type FriendRequestPayload struct {
	FromID       string `json:"fromId"`
	FromUsername string `json:"fromUsername"`
}

func NewFriendRequestPacket(payload FriendRequestPayload) (*Packet, error) {
	return NewPacket(ServerEventFriendRequest, payload)
}

func AcceptFRiendRequestPacket(payload FriendRequestPayload) (*Packet, error) {
	return NewPacket(ServerEventAcceptFriendRequest, payload)
}

func DeclineFriendRequestPacket(payload FriendRequestPayload) (*Packet, error) {
	return NewPacket(ServerEventDeclineFriendRequest, payload)
}

func NewErrorPacket(err error) (*Packet, error) {
	type ErrorPayload struct {
		Error string `json:"error"`
	}
	return NewPacket(ServerEventError, ErrorPayload{err.Error()})
}
