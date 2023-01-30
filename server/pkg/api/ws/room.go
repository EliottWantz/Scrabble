package ws

import (
	"fmt"
	"log"

	"github.com/alphadose/haxmap"
	"github.com/google/uuid"
)

type room struct {
	ID      string
	Manager *Manager
	Clients *haxmap.Map[string, *client]
	logger  *log.Logger
}

func NewRoom(m *Manager) (*room, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, fmt.Errorf("NewRoom: %w", err)
	}

	r := &room{
		ID:      id.String(),
		Manager: m,
		Clients: haxmap.New[string, *client](),
	}
	r.logger = log.New(log.Writer(), "[Room "+id.String()+"] ", log.LstdFlags)

	return r, nil
}

func (r *room) addClient(cID string) error {
	c, _ := r.getClient(cID)
	if c != nil {
		return fmt.Errorf("addClient: client %s already in room", cID)
	}

	c, err := r.Manager.getClient(cID)
	if err != nil {
		return fmt.Errorf("%s - addClient: %w", r.logger.Prefix(), err)
	}

	r.Clients.Set(cID, c)
	c.Rooms.Set(r.ID, r)
	r.logger.Printf("client %s added in room", c.ID)

	return nil
}

func (r *room) removeClient(cID string) error {
	c, err := r.getClient(cID)
	if err != nil {
		return fmt.Errorf("%s - removeClient: %w", r.logger.Prefix(), err)
	}

	r.Clients.Del(cID)
	r.logger.Printf("client %s removed from room", c.ID)

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
		return nil, fmt.Errorf("%s - getClient: client %s not in room", r.logger.Prefix(), cID)
	}

	return c, nil
}

func (r *room) broadcast(p *Packet, senderID string) error {
	r.Clients.ForEach(func(cID string, c *client) bool {
		// Don't send packet to the sender
		if cID == senderID {
			return true
		}

		err := c.send(p)
		if err != nil {
			log.Printf("broadcast: %s", err)
		}

		return true
	})

	return nil
}

func (r *room) has(cID string) bool {
	_, err := r.getClient(cID)
	return err == nil
}
