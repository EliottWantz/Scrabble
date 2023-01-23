package ws

import (
	"log"

	"github.com/google/uuid"
)

type room struct {
	ID      string
	Manager *Manager
	Clients map[string]*client
}

func NewRoom(m *Manager) (*room, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	r := &room{
		ID:      id.String(),
		Manager: m,
		Clients: make(map[string]*client),
	}

	return r, nil
}

func (r *room) addClient(cID string) {
	_, ok := r.Clients[cID]
	if ok {
		log.Printf("client %s already in room %s", cID, r.ID)
		return
	}

	c, err := r.Manager.getClient(cID)
	if err != nil {
		log.Printf("addClient: %s", err)
		return
	}

	r.Clients[cID] = c
	c.Rooms[r.ID] = r
	log.Printf("client %s registered in room %s", c.ID, r.ID)
}

func (r *room) removeClient(cID string) {
	c, ok := r.Clients[cID]
	if !ok {
		log.Printf("%s: client %s not in room, not removing", ErrInvalidUUID, c.ID)
		return
	}

	delete(r.Clients, c.ID)
	log.Printf("client %s removed from room %s", c.ID, r.ID)

	if len(r.Clients) == 0 {
		r.Manager.removeRoom(r.ID)
	}
}
