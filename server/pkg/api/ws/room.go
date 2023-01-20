package ws

import (
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/websocket/v2"
)

type Room struct {
	id      uuid.UUID
	clients map[uuid.UUID]*client
	operator
}

func NewRoom() *Room {
	r := &Room{
		id:       uuid.New(),
		clients:  make(map[uuid.UUID]*client),
		operator: newOperator(),
	}

	go r.run()

	return r
}

func (r *Room) add(c *client) {
	if _, ok := r.clients[c.id]; ok {
		log.Printf("client %s already in romm %s", c.conn.RemoteAddr(), r.id)
		return
	}
	r.clients[c.id] = c
	log.Printf("client %s registered in room %s", c.conn.RemoteAddr(), r.id)
}

func (r *Room) remove(c *client) {
	delete(r.clients, c.id)
	log.Println("connection unregistered")
}

func (r *Room) broadcast(p *Packet) {
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
				r.ops <- func() { r.remove(c) }
			}
		}(c)
	}
}
