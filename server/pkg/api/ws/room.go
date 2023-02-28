package ws

import (
	"errors"

	"scrabble/pkg/api/user"

	"github.com/alphadose/haxmap"
	"github.com/google/uuid"
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
	logger  *slog.Logger
}

func NewRoom(m *Manager) *Room {
	return NewRoomWithID(m, uuid.NewString())
}

func NewRoomWithID(m *Manager, ID string) *Room {
	r := &Room{
		ID:      ID,
		Name:    "room-" + ID,
		Manager: m,
		Clients: haxmap.New[string, *Client](),
	}
	r.logger = slog.With("room", r.ID)

	return r
}

func (r *Room) broadcast(p *Packet) {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		c.send(p)
		return true
	})
}

func (r *Room) broadcastSkipSelf(p *Packet, selfID string) {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		if c.ID != selfID {
			c.send(p)
		}
		return true
	})
}

func (r *Room) addClient(cID string) error {
	_, err := r.getClient(cID)
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

		slog.Info("packet", "name", payload.Name, "users", payload.Users, "msg", payload.Messages)
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
		r.broadcastSkipSelf(p, c.ID)
	}

	return nil
}

func (r *Room) removeClient(cID string) error {
	if r.ID == cID {
		return ErrLeavingOwnRoom
	}
	if r.ID == r.Manager.GlobalRoom.ID {
		return ErrLeavingGloabalRoom
	}

	c, err := r.getClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Del(cID)
	r.logger.Info("client removed from room", "client", c.ID)

	if r.Clients.Len() == 0 && r.ID != r.Manager.GlobalRoom.ID {
		if err := r.Manager.RemoveRoom(r.ID); err != nil {
			return err
		}
	}

	return nil
}

func (r *Room) getClient(cID string) (*Client, error) {
	c, ok := r.Clients.Get(cID)
	if !ok {
		return nil, ErrNotInRoom
	}

	return c, nil
}

func (r *Room) has(cID string) bool {
	_, err := r.getClient(cID)
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
