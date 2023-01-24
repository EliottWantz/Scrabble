package ws

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/puzpuzpuz/xsync/v2"
)

type Manager struct {
	Clients     *xsync.MapOf[string, *client]
	Rooms       *xsync.MapOf[string, *room]
	logger      *log.Logger
	defaultRoom *room
}

func NewManager() *Manager {
	m := &Manager{
		Clients: xsync.NewMapOf[*client](),
		Rooms:   xsync.NewMapOf[*room](),
		logger:  log.New(log.Writer(), "[Manager] ", log.LstdFlags),
	}
	defRoom, _ := NewRoom(m)
	m.defaultRoom = defRoom

	return m
}

func (m *Manager) Accept() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c, err := NewClient(conn, m)
		if err != nil {
			return
		}

		defer m.removeClient(c)

		m.addClient(c)
		m.defaultRoom.addClient(c.ID)

		c.read() // Infinite for loop that reads incoming packets
	})
}

func (m *Manager) getClient(cID string) (*client, error) {
	c, ok := m.Clients.Load(cID)
	if !ok {
		return nil, fmt.Errorf("%s - getClient: client with id %s not registered", m.logger.Prefix(), cID)
	}
	return c, nil
}

func (m *Manager) getRoom(rID string) (*room, error) {
	r, ok := m.Rooms.Load(rID)
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
	m.Rooms.Store(r.ID, r)
	m.Clients.Store(c.ID, c)

	r.addClient(c.ID)

	// m.logger.Printf("client %s registered", c.ID)
	return nil
}

func (m *Manager) removeClient(c *client) error {
	for _, r := range c.Rooms {
		r.removeClient(c.ID)
	}

	m.Clients.Delete(c.ID)
	err := c.Conn.Close()
	if err != nil {
		return fmt.Errorf("%s - removeClient: %w", m.logger.Prefix(), err)
	}

	m.logger.Printf("client %s removed", c.ID)
	return nil
}

func (m *Manager) removeRoom(rID string) error {
	r, err := m.getRoom(rID)
	if err != nil {
		return fmt.Errorf("%s - removeRoom: %w", m.logger.Prefix(), err)
	}

	m.Rooms.Delete(r.ID)
	m.logger.Printf("room %s removed", r.ID)

	return nil
}

func (m *Manager) broadcast(a Action, p *Packet, senderID string) error {
	r, err := m.getRoom(p.RoomID)
	if err != nil {
		return fmt.Errorf("%s - broadcast: %w", m.logger.Prefix(), err)
	}

	r.Clients.Range(func(cID string, c *client) bool {
		// Don't send packet to the sender
		if cID == senderID {
			return true
		}

		err := c.sendPacket(p)
		if err != nil {
			c.logger.Printf("broadcast: %s", err)
		}

		return true
	})

	return nil
}

func (m *Manager) Shutdown() {
	m.logger.Println("Shutting down manager")
	m.Clients.Range(func(cID string, c *client) bool {
		m.removeClient(c)
		return true
	})
}
