package ws

import (
	"errors"
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

var (
	ErrInvalidUUID         = errors.New("uuid is invalid")
	ErrClientAlreadyExists = errors.New("client already exists with conn")
	ErrNoClientConn        = errors.New("no client exists with conn")
)

type Manager struct {
	clients    map[*websocket.Conn]*client
	rooms      map[uuid.UUID]*Room
	unregister chan *websocket.Conn
	operator
}

func NewManager() *Manager {
	m := &Manager{
		clients:    make(map[*websocket.Conn]*client),
		rooms:      make(map[uuid.UUID]*Room),
		unregister: make(chan *websocket.Conn),
		operator:   newOperator(),
	}

	go m.run()

	return m
}

func (m *Manager) HandleConn() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		defer func() {
			m.ops <- func() { m.remove(conn) }
			conn.Close()
		}()

		c, err := m.add(conn)
		if err != nil {
			log.Println(err)
			return
		}

		// Infinite for loop that reads and writes
		c.run()
	})
}

func (m *Manager) add(conn *websocket.Conn) (*client, error) {
	if _, ok := m.clients[conn]; ok {
		return nil, ErrClientAlreadyExists
	}

	r := m.createRoom()
	c := m.createClient(conn)
	c.id = r.id

	r.ops <- func() { r.add(c) }

	log.Println("connection registered:", conn.RemoteAddr())

	return c, nil
}

func (m *Manager) remove(conn *websocket.Conn) {
	c, ok := m.clients[conn]
	if !ok {
		return
	}

	for _, r := range m.rooms {
		r.ops <- func() { r.remove(c) }
	}

	delete(m.clients, conn)
	log.Println("connection unregistered")
}

func (m *Manager) Shutdown() {
	for c := range m.clients {
		delete(m.clients, c)
		c.Close()
	}

	close(m.ops)
}

func (m *Manager) createRoom() *Room {
	r := NewRoom()
	m.rooms[r.id] = r

	return r
}

func (m *Manager) createClient(conn *websocket.Conn) *client {
	c := NewClient(conn, m)
	m.clients[conn] = c

	return c
}
