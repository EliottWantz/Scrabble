package ws

import (
	"errors"

	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var (
	ErrAlreadyInRoom = errors.New("client already in room")
	ErrNotInRoom     = errors.New("client not in room")
	ErrRoomNotFound  = errors.New("room not found")
)

type Room struct {
	ID        string
	Name      string
	CreatorID string
	Manager   *Manager
	Clients   *haxmap.Map[string, *Client]
	logger    *slog.Logger
}

func NewRoom(m *Manager, dbRoom *room.Room) *Room {
	return &Room{
		ID:        dbRoom.ID,
		Name:      dbRoom.Name,
		CreatorID: dbRoom.CreatorID,
		Manager:   m,
		Clients:   haxmap.New[string, *Client](),
		logger:    slog.With("room", dbRoom.ID),
	}
}

func (r *Room) Broadcast(p *Packet) {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		c.send(p)
		return true
	})
}

func (r *Room) BroadcastSkipSelf(p *Packet, selfID string) {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		if c.ID != selfID {
			c.send(p)
		}
		return true
	})
}

func (r *Room) AddClient(cID string) error {
	_, err := r.GetClient(cID)
	if err == nil {
		return ErrAlreadyInRoom
	}

	c, err := r.Manager.GetClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Set(cID, c)
	c.Rooms.Set(r.ID, r)
	r.logger.Info("client added in room", "client", c.ID)
	dbRoom, _ := r.Manager.RoomSvc.Find(r.ID)

	{
		payload := JoinedRoomPayload{
			RoomID:     r.ID,
			RoomName:   r.Name,
			CreatorID:  r.CreatorID,
			Users:      r.ListUsers(),
			IsGameRoom: dbRoom.IsGameRoom,
		}
		msgs, err := r.Manager.MessageRepo.LatestMessage(r.ID, 0)
		if err != nil || len(msgs) == 0 {
			msgs = make([]ChatMessage, 0)
		}
		payload.Messages = msgs

		p, err := NewJoinedRoomPacket(payload)
		if err != nil {
			r.logger.Error("creating packet", err)
			return nil
		}
		c.send(p)
	}

	{
		u, err := r.Manager.UserSvc.Repo.Find(cID)
		if err != nil {
			r.logger.Error("find user that joined", err)
		}

		payload := UserJoinedPayload{
			RoomID: r.ID,
			User:   u,
		}
		p, err := NewUserJoinedPacket(payload)
		if err != nil {
			r.logger.Error("creating packet", err)
			return nil
		}
		r.BroadcastSkipSelf(p, c.ID)
	}

	return nil
}

func (r *Room) RemoveClient(cID string) error {
	c, err := r.GetClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Del(cID)
	r.logger.Info("client removed from room", "client", c.ID)

	if r.Clients.Len() == 0 && r.ID != r.Manager.GlobalRoom.ID {
		if err := r.Manager.RemoveRoom(r.ID); err != nil {
			return err
		}
		if err := r.Manager.RoomSvc.Delete(r.ID); err != nil {
			return err
		}
		return r.Manager.GameSvc.DeleteGame(r.ID)
	}

	return nil
}

func (r *Room) GetClient(cID string) (*Client, error) {
	c, ok := r.Clients.Get(cID)
	if !ok {
		return nil, ErrNotInRoom
	}

	return c, nil
}

func (r *Room) has(cID string) bool {
	_, err := r.GetClient(cID)
	return err == nil
}

func (r *Room) ListUsers() []*user.User {
	users := make([]*user.User, 0, r.Clients.Len())
	dbRoom, err := r.Manager.RoomSvc.Find(r.ID)
	if err != nil {
		return users
	}

	for _, uID := range dbRoom.UserIDs {
		u, err := r.Manager.UserSvc.Repo.Find(uID)
		if err != nil {
			r.logger.Error("list users", err)
			continue
		}
		users = append(users, u)
	}

	return users
}

func (r *Room) ListClientIDs() []string {
	clientIDs := make([]string, 0, r.Clients.Len())
	r.Clients.ForEach(func(cID string, c *Client) bool {
		clientIDs = append(clientIDs, c.ID)
		return true
	})

	return clientIDs
}

func createRoomWithUsers(c *Client, roomName string, userIDs ...string) error {
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(
		uuid.NewString(),
		roomName,
		c.ID,
		userIDs...,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	r := c.Manager.AddRoom(dbRoom)
	for _, uID := range dbRoom.UserIDs {
		if err := c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, uID); err != nil {
			slog.Error("add user to room", err)
		}
		if err := r.AddClient(uID); err != nil {
			slog.Error("add client to ws room", err)
		}
	}

	return nil
}

func createGameRoomWithUsers(c *Client, roomName string, userIDs ...string) error {
	dbRoom, err := c.Manager.RoomSvc.CreateGameRoom(
		uuid.NewString(),
		roomName,
		c.ID,
		userIDs...,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	r := c.Manager.AddRoom(dbRoom)
	for _, uID := range dbRoom.UserIDs {
		if err := r.AddClient(uID); err != nil {
			slog.Error("add client to ws room", err)
		}
	}

	return nil
}
