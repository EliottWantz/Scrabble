package ws

import (
	"fmt"
	"log"

	"scrabble/internal/uuid"
)

type Room struct {
	id      uuid.UUID
	manager *Manager
	clients map[uuid.UUID]*client
	operator
}

func NewRoom(m *Manager) *Room {
	r := &Room{
		id:       uuid.New(),
		manager:  m,
		clients:  make(map[uuid.UUID]*client),
		operator: newOperator(),
	}

	go r.operator.run()

	return r
}

func (r *Room) addClient(c *client) error {
	if _, ok := r.clients[c.id]; ok {
		return fmt.Errorf("client %s already in romm %s", c.conn.RemoteAddr(), r.id)
	}
	r.clients[c.id] = c
	log.Printf("client %s registered in room %s", c.conn.RemoteAddr(), r.id)

	return nil
}

func (r *Room) removeClient(id uuid.UUID) error {
	delete(r.clients, id)
	log.Printf("client %s removed from room %s", id, r.id)

	if len(r.clients) == 0 {
		r.manager.queueOp(func() error { return r.manager.deleteRoom(id) })
	}

	return nil
}

func (r *Room) broadcast(p *Packet) error {
	log.Println("broadcasting packet:", p)
	for _, c := range r.clients {
		go func(c *client, p *Packet) {
			c.queueOp(func() error { return c.sendPacket(p) })
		}(c, p)
	}

	return nil
}
