package api

import (
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type WebSocketManager struct {
	clients    map[*websocket.Conn]*client
	register   chan *websocket.Conn
	broadcast  chan string
	unregister chan *websocket.Conn
}

// Add more data to this type if needed
type client struct {
	isClosing bool
	mu        sync.Mutex
}

func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		clients:    make(map[*websocket.Conn]*client),
		register:   make(chan *websocket.Conn),
		broadcast:  make(chan string),
		unregister: make(chan *websocket.Conn),
	}
}

func (m *WebSocketManager) run() {
	for {
		select {
		case connection := <-m.register:
			m.clients[connection] = &client{}
			log.Println("connection registered:", connection.RemoteAddr())

		case message := <-m.broadcast:
			log.Println("message received:", message)
			// Send the message to all clients
			for connection, c := range m.clients {
				go func(connection *websocket.Conn, c *client) { // send to each client in parallel so we don't block on a slow client
					c.mu.Lock()
					defer c.mu.Unlock()
					if c.isClosing {
						return
					}
					if err := connection.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
						c.isClosing = true
						log.Println("write error:", err)

						connection.WriteMessage(websocket.CloseMessage, []byte{})
						connection.Close()
						m.unregister <- connection
					}
				}(connection, c)
			}

		case connection := <-m.unregister:
			// Remove the client from the hub
			delete(m.clients, connection)

			log.Println("connection unregistered")
		}
	}
}

func (wsm *WebSocketManager) HandleConn() fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		// When the function returns, unregister the client and close the connection
		defer func() {
			wsm.unregister <- c
			c.Close()
		}()

		// Register the client
		wsm.register <- c

		for {
			messageType, message, err := c.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Println("read error:", err)
				}

				return // Calls the deferred function, i.e. closes the connection on error
			}

			if messageType == websocket.TextMessage {
				// Broadcast the received message
				wsm.broadcast <- string(message)
			} else {
				log.Println("websocket message received of type", messageType)
			}
		}
	})
}
