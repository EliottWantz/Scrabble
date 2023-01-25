package ws

import (
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/puzpuzpuz/xsync/v2"
)

type room struct {
	ID      string
	Manager *Manager
	Clients *xsync.MapOf[string, *client]
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
		Clients: xsync.NewMapOf[*client](),
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

	r.Clients.Store(cID, c)
	c.Rooms.Store(r.ID, r)
	r.logger.Printf("client %s added in room", c.ID)

	return nil
}

func (r *room) removeClient(cID string) error {
	c, err := r.getClient(cID)
	if err != nil {
		return fmt.Errorf("%s - removeClient: %w", r.logger.Prefix(), err)
	}

	r.Clients.Delete(cID)
	r.logger.Printf("client %s removed from room", c.ID)

	if r.Clients.Size() == 0 {
		err := r.Manager.removeRoom(r.ID)
		return fmt.Errorf("%s - removeClient: %w", r.logger.Prefix(), err)
	}

	return nil
}

func (r *room) getClient(cID string) (*client, error) {
	c, ok := r.Clients.Load(cID)
	if !ok {
		return nil, fmt.Errorf("%s - getClient: client %s not in room", r.logger.Prefix(), cID)
	}

	return c, nil
}
