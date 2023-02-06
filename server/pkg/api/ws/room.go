package ws

import (
	"errors"
	"fmt"

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
	logger  *slog.Logger
}

func NewRoom(m *Manager) (*Room, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	r := &Room{
		ID:      id.String(),
		Manager: m,
		Clients: haxmap.New[string, *Client](),
	}
	r.logger = slog.With("room", r.ID)

	return r, nil
}

func NewRoomWithID(m *Manager, ID string) *Room {
	r := &Room{
		ID:      ID,
		Manager: m,
		Clients: haxmap.New[string, *Client](),
	}
	r.logger = slog.With("room", r.ID)

	return r
}

func (r *Room) addClient(cID string) error {
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

func (r *Room) removeClient(cID string) error {
	if r.ID == r.Manager.GlobalRoom.ID {
		return fmt.Errorf("cannot remove client from global room")
	}

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

func (r *Room) getClient(cID string) (*Client, error) {
	c, ok := r.Clients.Get(cID)
	if !ok {
		return nil, ErrNotInRoom
	}

	return c, nil
}

func (r *Room) broadcast(p *Packet, senderID string) error {
	r.Clients.ForEach(func(cID string, c *Client) bool {
		// Actually send the packet to the client so that it can handle it
		// properly, i.e. get the confirmation that the packet has been sent,
		// and have the timestamp

		// Don't send packet to the sender
		// if cID == senderID {
		// 	return true
		// }

		c.send(p)

		return true
	})

	return nil
}

func (r *Room) has(cID string) bool {
	_, err := r.getClient(cID)
	return err == nil
}
