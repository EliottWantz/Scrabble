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
	ErrInvalidUUID         = errors.New("uuid is invalid")
	ErrClientAlreadyExists = errors.New("client already exists with conn")
	ErrNoClientConn        = errors.New("no client exists with conn")
)

type Manager struct {
	clients      map[*websocket.Conn]*client
	rooms        map[uuid.UUID]*Room
	unregister   chan *websocket.Conn
	shutdown     chan struct{}
	shutdownInit chan struct{}
}

func NewManager() *Manager {
	m := &Manager{
		clients:      make(map[*websocket.Conn]*client),
		rooms:        make(map[uuid.UUID]*Room),
		unregister:   make(chan *websocket.Conn),
		shutdown:     make(chan struct{}),
		shutdownInit: make(chan struct{}),
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

		c := m.add(conn)
		c.run()
	})
}

func (m *Manager) run() {
	for {
		select {
		case conn := <-m.unregister:
			m.remove(conn)
		case <-m.shutdown:
			return
		}
	}
}

func (m *Manager) add(conn *websocket.Conn) *client {
	c := NewClient(conn, m)
	m.clients[conn] = c

	log.Println("connection registered:", conn.RemoteAddr())
	r := m.createRoom()
	r.do(func() {
		r.add(c)
	})

	return c
}

func (m *Manager) remove(conn *websocket.Conn) {
	c, ok := m.clients[conn]
	if !ok {
		return
	}

	for _, r := range m.rooms {
		r.do(func() { r.remove(c) })
	}

	delete(m.clients, conn)
	log.Println("connection unregistered")
}

func (m *Manager) Shutdown() {
	close(m.shutdownInit)

	defer close(m.shutdown)

	for c := range m.clients {
		delete(m.clients, c)
		c.Close()
	}

	<-m.shutdown
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
		return fmt.Errorf("%w: no room found with id %s", ErrInvalidUUID, rID)
	}

	log.Println("room:", r)

	r.do(func() { r.add(c) })
	log.Println("client should be in room")

	return nil
}
