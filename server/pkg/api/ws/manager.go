package ws

import (
	"errors"
	"fmt"
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

var ErrInvalidUUID = errors.New("uuid is invalid")

type Manager struct {
	clients    map[uuid.UUID]*client
	rooms      map[uuid.UUID]*room
	unregister chan *websocket.Conn
	operator
}

func NewManager() *Manager {
	m := &Manager{
		clients:    make(map[uuid.UUID]*client),
		rooms:      make(map[uuid.UUID]*room),
		unregister: make(chan *websocket.Conn),
		operator:   newOperator(),
	}

	go m.operator.run()

	return m
}

func (m *Manager) HandleConn() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c := NewClient(conn, m)

		defer func() {
			m.queueOp(func() error { return m.removeClient(c.id) })
			conn.Close()
		}()

		m.queueOp(func() error { return m.addClient(c) })

		go c.operator.run()
		c.read() // Infinite for loop that reads and writes
	})
}

func (m *Manager) addClient(c *client) error {
	r := NewRoom(m)
	m.rooms[r.id] = r

	c.id = r.id
	m.clients[c.id] = c

	r.queueOp(func() error { return r.addClient(c) })

	log.Println("connection registered:", c.conn.RemoteAddr())

	return nil
}

func (m *Manager) removeClient(id uuid.UUID) error {
	if _, ok := m.clients[id]; !ok {
		return fmt.Errorf("%w: client %s doesn't exists", ErrInvalidUUID, id)
	}

	for _, r := range m.rooms {
		r.queueOp(func() error { return r.removeClient(id) })
	}

	delete(m.clients, id)
	log.Println("connection unregistered")

	return nil
}

func (m *Manager) Shutdown() {
	for id, c := range m.clients {
		delete(m.clients, id)
		c.conn.Close()
	}

	close(m.ops)
}

func (m *Manager) deleteRoom(id uuid.UUID) error {
	delete(m.rooms, id)
	return nil
}
