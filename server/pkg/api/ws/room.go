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

type Room struct {
	ID      string
	Manager *Manager
	Clients *haxmap.Map[string, *Client]
	SendCh  chan *Packet
	logger  *slog.Logger
}

func NewRoom(m *Manager) *Room {
	return NewRoomWithID(m, uuid.NewString())
}

func NewRoomWithID(m *Manager, ID string) *Room {
	r := &Room{
		ID:      ID,
		Manager: m,
		Clients: haxmap.New[string, *Client](),
		SendCh:  make(chan *Packet, 10),
	}
	r.logger = slog.With("room", r.ID)

	go func() {
		for p := range r.SendCh {
			r.Clients.ForEach(func(cID string, c *Client) bool {
				c.send(p)
				return true
			})
		}
	}()

	return r
}

func (r *Room) addClient(cID string) error {
	_, err := r.getClient(cID)
	if err == nil {
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

func (r *Room) removeClient(cID string) error {
	c, err := r.getClient(cID)
	if err != nil {
		return err
	}

	r.Clients.Del(cID)
	r.logger.Info("client removed from room", "client", c.ID)

	if r.Clients.Len() == 0 {
		if err := r.Manager.removeRoom(r.ID); err != nil {
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

func (r *Room) broadcast(p *Packet) {
	r.SendCh <- p
}

func (r *Room) has(cID string) bool {
	_, err := r.getClient(cID)
	return err == nil
}
