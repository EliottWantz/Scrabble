package ws

import (
	"errors"

	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"

	"github.com/alphadose/haxmap"
	"golang.org/x/exp/slog"
)

var (
	ErrAlreadyInRoom = errors.New("client already in room")
	ErrNotInRoom     = errors.New("client not in room")
)

type Room struct {
	ID      string
	Name    string
	Manager *Manager
	Clients *haxmap.Map[string, *Client]
	UserIDs []string
	logger  *slog.Logger
	DBRoom  *room.Room
}

func NewRoomWithID(m *Manager, r *room.Room) *Room {
	return &Room{
		ID:      r.ID,
		Name:    r.Name,
		Manager: m,
		Clients: haxmap.New[string, *Client](),
		UserIDs: r.UserIDs,
		logger:  slog.With("room", r.ID),
		DBRoom:  r,
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

	err = r.Manager.RoomSvc.AddUserToRoom(r.ID, cID)
	if err != nil {
		return err
	}

	{
		payload := JoinedRoomPayload{
			RoomID: r.ID,
			Name:   r.Name,
			Users:  r.ListUsers(),
		}
		msgs, err := r.Manager.MessageRepo.LatestMessage(r.ID, 0)
		if err != nil {
			r.logger.Error("get latest messages", err)
		}
		if len(msgs) == 0 {
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
		res, err := r.Manager.UserRepo.Find(cID)
		if err != nil {
			r.logger.Error("find user that joined", err)
		}

		payload := UserJoinedPayload{
			RoomID: r.ID,
			User: user.PublicUser{
				ID:       res.ID,
				Username: res.Username,
				Avatar:   res.Avatar,
			},
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

	if r.Clients.Len() == 0 && r.ID != r.Manager.GlobalRoom.ID && r.ID != c.ID {
		if err := r.Manager.RemoveRoom(r.ID); err != nil {
			return err
		}
		return r.Manager.RoomSvc.Delete(r.ID)
	}

	if err := r.Manager.RoomSvc.RemoveUserFromRoom(r.ID, cID); err != nil {
		return err
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

func (r *Room) ListUsers() []user.PublicUser {
	users := make([]user.PublicUser, 0, r.Clients.Len())
	r.Clients.ForEach(func(cID string, c *Client) bool {
		res, err := r.Manager.UserRepo.Find(cID)
		if err != nil {
			r.logger.Error("list users", err)
		}
		pubUser := user.PublicUser{
			ID:       res.ID,
			Username: res.Username,
			Avatar:   res.Avatar,
		}
		users = append(users, pubUser)
		return true
	})

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
