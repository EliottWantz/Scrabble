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

type CreateRoomPayload struct {
	RoomName string   `json:"roomName"`
	UserIDs  []string `json:"userIds"`
}

type JoinRoomPayload struct {
	RoomID string `json:"roomId"`
}

type LeaveRoomPayload struct {
	RoomID string `json:"roomId"`
}

type CreateDMRoomPayload struct {
	Username   string `json:"username"`
	ToID       string `json:"toId"`
	ToUsername string `json:"toUsername"`
}

type LeaveDMRoomPayload struct {
	RoomID string `json:"roomId"`
}

type CreateGamePayload struct {
	Password string   `json:"password,omitempty"`
	UserIDs  []string `json:"userIds"`
}

type JoinGamePayload struct {
	GameID   string `json:"gameId"`
	Password string `json:"password,omitempty"`
}
type joinGameAsObserverPayload struct {
	GameID string `json:"gameId"`
}

type MakeGamePrivatePayload struct {
	GameID string `json:"gameId"`
}

type MakeGamePublicPayload struct {
	GameID string `json:"gameId"`
}

type LeaveGamePayload struct {
	GameID string `json:"gameId"`
}

type StartGamePayload struct {
	GameID string `json:"gameId"`
}

type PlayMovePayload struct {
	GameID   string        `json:"gameId"`
	MoveInfo game.MoveInfo `json:"moveInfo"`
}

type IndicePayload struct {
	GameID string `json:"gameId"`
}

// Server events payloads
type JoinedRoomPayload struct {
	RoomID   string        `json:"roomId"`
	RoomName string        `json:"roomName"`
	UserIDs  []string      `json:"userIds"`
	Messages []ChatMessage `json:"messages"`
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

type UserJoinedRoomPayload struct {
	RoomID string `json:"roomId"`
	UserID string `json:"userId"`
}

func NewUserJoinedRoomPacket(payload UserJoinedRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventUserJoinedRoom, payload)
}

type UserLeftRoomPayload struct {
	RoomID string `json:"roomId"`
	UserID string `json:"userId"`
}

func NewUserLeftRoomPacket(payload UserLeftRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventUserLeftRoom, payload)
}

type JoinedDMRoomPayload struct {
	RoomID   string        `json:"roomId"`
	RoomName string        `json:"roomName"`
	UserIDs  []string      `json:"userIds"`
	Messages []ChatMessage `json:"messages"`
}

func NewJoinedDMRoomPacket(payload JoinedDMRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventJoinedDMRoom, payload)
}

type LeftDMRoomPayload struct {
	RoomID string `json:"roomId"`
}

func NewLeftDMRoomPacket(payload LeftDMRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventLeftDMRoom, payload)
}

type UserJoinedDMRoomPayload struct {
	RoomID string `json:"roomId"`
	UserID string `json:"userId"`
}

func NewUserJoinedDMRoomPacket(payload UserJoinedDMRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventUserJoinedDMRoom, payload)
}

type UserLeftDMRoomPayload struct {
	RoomID string `json:"roomId"`
	UserID string `json:"userId"`
}

func NewUserLeftDMRoomPacket(payload UserLeftDMRoomPayload) (*Packet, error) {
	return NewPacket(ServerEventUserLeftDMRoom, payload)
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
	Games []*game.Game `json:"games"`
}

func NewJoinableGamesPacket(payload ListJoinableGamesPayload) (*Packet, error) {
	return NewPacket(ServerEventJoinableGames, payload)
}

type JoinedGamePayload struct {
	Game *game.Game `json:"game"`
}

func NewJoinedGamePacket(payload JoinedGamePayload) (*Packet, error) {
	return NewPacket(ServerEventJoinedGame, payload)
}

type UserJoinedGamePayload struct {
	GameID string `json:"gameId"`
	UserID string `json:"userId"`
}

func NewUserJoinedGamePacket(payload UserJoinedGamePayload) (*Packet, error) {
	return NewPacket(ServerEventUserJoinedGame, payload)
}

type LeftGamePayload struct {
	GameID string `json:"gameId"`
}

func NewLeftGamePacket(payload LeftGamePayload) (*Packet, error) {
	return NewPacket(ServerEventLeftGame, payload)
}

type UserLeftGamePayload struct {
	GameID string `json:"gameId"`
	UserID string `json:"userId"`
}

func NewUserLeftGamePacket(payload UserLeftGamePayload) (*Packet, error) {
	return NewPacket(ServerEventUserLeftGame, payload)
}

type GamePayload struct {
	ID           string                  `json:"id"`
	Players      []*scrabble.Player      `json:"players"`
	Board        [15][15]scrabble.Square `json:"board"`
	Finished     bool                    `json:"finished"`
	NumPassMoves int                     `json:"numPassMoves"`
	Turn         string                  `json:"turn"`
	Timer        time.Duration           `json:"timer"`
}

func makeGamePayload(g *game.Game) *GamePayload {
	return &GamePayload{
		ID:           g.ID,
		Players:      g.ScrabbleGame.Players,
		Board:        g.ScrabbleGame.Board.Squares,
		Finished:     g.ScrabbleGame.Finished,
		NumPassMoves: g.ScrabbleGame.NumPassMoves,
		Turn:         g.ScrabbleGame.Turn,
		Timer:        g.ScrabbleGame.Timer.TimeRemaining(),
	}
}

type GameUpdatePayload struct {
	Game *GamePayload `json:"game"`
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

type ServerIndicePayload struct {
	Moves []game.MoveInfo `json:"moves"`
}

func NewServerIndicePacket(payload ServerIndicePayload) (*Packet, error) {
	return NewPacket(ServerEventIndice, payload)
}

func NewErrorPacket(err error) (*Packet, error) {
	type ErrorPayload struct {
		Error string `json:"error"`
	}
	return NewPacket(ServerEventError, ErrorPayload{err.Error()})
}
