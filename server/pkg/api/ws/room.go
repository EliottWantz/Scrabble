package ws

import (
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/websocket/v2"
)

type Room struct {
	id         uuid.UUID
	clients    map[*websocket.Conn]*client
	register   chan *client
	unregister chan *client
	broadcast  chan Packet
}

func NewRoom() *Room {
	r := &Room{
		id:         uuid.New(),
		clients:    make(map[*websocket.Conn]*client),
		register:   make(chan *client),
		unregister: make(chan *client),
		broadcast:  make(chan Packet),
	}

	go r.run()

	return r
}

func (r *Room) run() {
	for {
		select {
		case c := <-r.register:
			r.clients[c.conn] = c
			log.Printf("client %s registered in room %s", c.conn.RemoteAddr(), r.id)

		case c := <-r.unregister:
			delete(r.clients, c.conn)

			log.Println("connection unregistered")

		case packet := <-r.broadcast:
			log.Println("received packet:", packet)
			for _, c := range r.clients {
				go func(c *client) { // send to each client in parallel so we don't block on a slow client
					c.mu.Lock()
					defer c.mu.Unlock()
					if c.isClosing {
						return
					}

					if err := c.conn.WriteJSON(packet); err != nil {
						c.isClosing = true
						log.Println("write error:", err)

						c.conn.WriteMessage(websocket.CloseMessage, []byte{})
						c.conn.Close()
						r.unregister <- c
					}
				}(c)
			}
		}
	}
}
