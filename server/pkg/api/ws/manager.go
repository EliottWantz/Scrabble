package ws

import (
	"fmt"
	"log"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Manager struct {
	Clients *haxmap.Map[string, *client]
	Rooms   *haxmap.Map[string, *room]
	logger  *log.Logger
}

func NewManager() *Manager {
	m := &Manager{
		Clients: haxmap.New[string, *client](),
		Rooms:   haxmap.New[string, *room](),
		logger:  log.New(log.Writer(), "[Manager] ", log.LstdFlags),
	}

	return m
}

func (m *Manager) Accept() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c, err := NewClient(conn, m)
		if err != nil {
			return
		}

		defer func() {
			if err := m.removeClient(c); err != nil {
				m.logger.Println(err)
			}
		}()

		err = m.addClient(c)
		if err != nil {
			return
		}

		c.read() // Infinite for loop that reads incoming packets
	})
}

func (m *Manager) getClient(cID string) (*client, error) {
	c, ok := m.Clients.Get(cID)
	if !ok {
		return nil, fmt.Errorf("%s - getClient: client with id %s not registered", m.logger.Prefix(), cID)
	}
	return c, nil
}

func (m *Manager) getRoom(rID string) (*room, error) {
	r, ok := m.Rooms.Get(rID)
	if !ok {
		return nil, fmt.Errorf("%s - getRoom: room with id %s not registered", m.logger.Prefix(), rID)
	}
	return r, nil
}

func (m *Manager) addClient(c *client) error {
	if c == nil {
		return fmt.Errorf("%s - addClient: client is nil", m.logger.Prefix())
	}

	r, err := NewRoom(m)
	if err != nil {
		return fmt.Errorf("%s - addClient: %w", m.logger.Prefix(), err)
	}

	// Client should have that same ID as the default room he is in
	c.ID = r.ID
	m.Rooms.Set(r.ID, r)
	m.Clients.Set(c.ID, c)

	if err := r.addClient(c.ID); err != nil {
		return fmt.Errorf("%s - addClient: %w", m.logger.Prefix(), err)
	}

	m.logger.Printf("client %s registered", c.ID)
	m.logger.Printf("Room size: %d", m.Rooms.Len())
	return nil
}

func (m *Manager) removeClient(c *client) error {
	c.Rooms.ForEach(func(rID string, r *room) bool {
		_ = r.removeClient(c.ID)
		return true
	})

	m.Clients.Del(c.ID)
	err := c.Conn.Close()
	if err != nil {
		return fmt.Errorf("%s - removeClient: %w", m.logger.Prefix(), err)
	}

	m.logger.Printf("client %s removed", c.ID)
	m.logger.Printf("Room size: %d", m.Rooms.Len())
	return nil
}

func (m *Manager) removeRoom(rID string) error {
	r, err := m.getRoom(rID)
	if err != nil {
		return fmt.Errorf("%s - removeRoom: %w", m.logger.Prefix(), err)
	}

	m.Rooms.Del(r.ID)
	m.logger.Printf("room %s removed", r.ID)

	return nil
}

func (m *Manager) broadcast(p *Packet, senderID string) error {
	r, err := m.getRoom(p.RoomID)
	if err != nil {
		return fmt.Errorf("%s - broadcast: %w", m.logger.Prefix(), err)
	}

	if !r.has(senderID) {
		return fmt.Errorf("%s - broadcast: sender %s not in room %s", m.logger.Prefix(), senderID, p.RoomID)
	}

	r.broadcast(p, senderID)

	return nil
}

func (m *Manager) Shutdown() {
	m.logger.Println("Shutting down manager")
	m.Clients.ForEach(func(cID string, c *client) bool {
		_ = m.removeClient(c)
		return true
	})
}
