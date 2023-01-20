package ws

import (
	"errors"
	"fmt"
	"log"

	"scrabble/internal/uuid"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

var (
	ErrInvalidUUID = errors.New("uuid is invalid")
	ErrNilUUID     = errors.New("uuid is nil")

	ErrNoRoomWithUUID      = errors.New("no room found with given uuid")
	ErrClientAlreadyExists = errors.New("client already exists with conn")
)

type Manager struct {
	clients    map[*websocket.Conn]*client
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	rooms      map[uuid.UUID]*Room
}

func NewManager() *Manager {
	m := &Manager{
		clients:    make(map[*websocket.Conn]*client),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		rooms:      make(map[uuid.UUID]*Room),
	}

	go m.run()

	return m
}

func (m *Manager) HandleConn() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		defer func() {
			m.unregister <- conn
			conn.Close()
		}()

		m.register <- conn
	})
}

func (m *Manager) run() {
	for {
		select {
		case conn := <-m.register:
			c := NewClient(conn, m)
			m.clients[conn] = c

			c.run()

			log.Println("connection registered:", conn.RemoteAddr())
			r := m.createRoom()
			r.register <- c

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

func (m *Manager) createRoom() *Room {
	r := NewRoom()
	m.rooms[r.id] = r

	return r
}

func (m *Manager) joinRoom(c *client, rID uuid.UUID) error {
	log.Println("id =", rID)
	r, ok := m.rooms[rID]
	if !ok {
		return fmt.Errorf("%w: %s", ErrNoRoomWithUUID, rID.String())
	}

	log.Println("room:", r)

	r.register <- c
	log.Println("client should be in room")

	return nil
}
