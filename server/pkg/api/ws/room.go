package ws

import (
	"fmt"
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/websocket/v2"
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
		r.manager.ops <- func() error { return r.manager.deleteRoom(id) }
	}

	return nil
}

func (r *Room) broadcast(p *Packet) error {
	log.Println("received packet:", p)
	for _, c := range r.clients {
		go func(c *client) { // send to each client in parallel so we don't block on a slow client
			c.mu.Lock()
			defer c.mu.Unlock()
			if c.isClosing {
				return
			}

			if err := c.conn.WriteJSON(p); err != nil {
				c.isClosing = true
				log.Println("write error:", err)

				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				c.conn.Close()
				r.ops <- func() error { return r.removeClient(c.id) }
			}
		}(c)
	}

	return nil
}
