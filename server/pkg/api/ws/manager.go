package ws

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type WebSocketManager struct {
	clients    map[*websocket.Conn]*client
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	rooms      map[uuid.UUID]*Room
}

func NewWebSocketManager() *WebSocketManager {
	m := &WebSocketManager{
		clients: make(map[*websocket.Conn]*client),
		rooms:   make(map[uuid.UUID]*Room),
	}
	m.run()

	return m
}

func (m *WebSocketManager) run() {
	for {
		select {
		case conn := <-m.register:
			c := NewClient(conn)
			m.clients[conn] = c
			log.Println("connection registered:", conn.RemoteAddr())

			r := NewRoom()
			r.register <- c
			m.rooms[r.id] = r

		case conn := <-m.unregister:
			c, ok := m.clients[conn]
			if !ok {
				continue
			}

			for _, room := range m.rooms {
				room.unregister <- c
			}

			delete(m.clients, conn)
			log.Println("connection unregistered")
		}
	}
}

func (m *WebSocketManager) HandleConn() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		// When the function returns, unregister the client and close the connection
		defer func() {
			m.unregister <- conn
			conn.Close()
		}()

		// Register the client
		m.register <- conn

		for {
			var msg Packet
			err := conn.ReadJSON(&msg)
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Println("read error:", err)
				}

				return // Calls the deferred function, i.e. closes the connection on error
			}

			// if room, ok := m.rooms[msg.RoomID]; ok {
			// room.broadcast
			// }
		}
	})
}
