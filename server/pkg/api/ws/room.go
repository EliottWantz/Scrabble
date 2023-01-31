package ws

import (
	"errors"

	"github.com/alphadose/haxmap"
	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var (
	ErrAlreadyInRoom = errors.New("client already in room")
	ErrNotInRoom     = errors.New("client not in room")
)

type room struct {
	ID      string
	Manager *Manager
	Clients *haxmap.Map[string, *client]
	logger  *slog.Logger
}

func NewRoom(m *Manager) (*room, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	r := &room{
		ID:      id.String(),
		Manager: m,
		Clients: haxmap.New[string, *client](),
	}
	r.logger = slog.With("room", r.ID)

	return r, nil
}

func (r *room) addClient(cID string) error {
	c, _ := r.getClient(cID)
	if c != nil {
		return ErrAlreadyInRoom
	}

	c, err := r.Manager.getClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Set(cID, c)
	c.Rooms.Set(r.ID, r)
	r.logger.Info("client added in room", "client", c.ID)

	return nil
}

func (r *room) removeClient(cID string) error {
	c, err := r.getClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Del(cID)
	r.logger.Info("client removed from room", "client", c.ID)

	if r.Clients.Len() == 0 {
		err := r.Manager.removeRoom(r.ID)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *room) getClient(cID string) (*client, error) {
	c, ok := r.Clients.Get(cID)
	if !ok {
		return nil, ErrNotInRoom
	}

	return c, nil
}

func (r *room) broadcast(p *Packet, senderID string) error {
	r.Clients.ForEach(func(cID string, c *client) bool {
		// Don't send packet to the sender
		if cID == senderID {
			return true
		}

		c.send(p)

		return true
	})

	return nil
}

func (r *room) has(cID string) bool {
	_, err := r.getClient(cID)
	return err == nil
}
