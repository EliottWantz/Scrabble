package ws

import (
	"fmt"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"golang.org/x/exp/slog"
)

type Manager struct {
	Clients    *haxmap.Map[string, *client]
	Rooms      *haxmap.Map[string, *room]
	GlobalRoom *room
	logger     *slog.Logger
}

func NewManager() (*Manager, error) {
	m := &Manager{
		Clients: haxmap.New[string, *client](),
		Rooms:   haxmap.New[string, *room](),
		logger:  slog.Default(),
	}

	r, err := NewRoom(m)
	if err != nil {
		return nil, err
	}

	m.GlobalRoom = r
	err = m.addRoom(r)
	if err != nil {
		return nil, err
	}

	return m, nil
}

func (m *Manager) Accept() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c, err := m.addClient(conn)
		if err != nil {
			m.logger.Error("add client", err)
			return
		}

		defer func() {
			if err := m.removeClient(c); err != nil {
				m.logger.Error("remove client", err)
			}
		}()

		go c.write()
		c.read()
	})
}

func (m *Manager) getClient(cID string) (*client, error) {
	c, ok := m.Clients.Get(cID)
	if !ok {
		return nil, fmt.Errorf("client with id %s not registered", cID)
	}
	return c, nil
}

func (m *Manager) getRoom(rID string) (*room, error) {
	r, ok := m.Rooms.Get(rID)
	if !ok {
		return nil, fmt.Errorf("room with id %s not registered", rID)
	}
	return r, nil
}

func (m *Manager) addClient(coon *websocket.Conn) (*client, error) {
	r, err := NewRoom(m)
	if err != nil {
		return nil, err
	}

	// Client should have that same ID as the default room he is in
	c := NewClient(coon, r.ID, m)

	m.Rooms.Set(r.ID, r)
	m.Clients.Set(c.ID, c)

	if err := r.addClient(c.ID); err != nil {
		return c, err
	}

	if err = m.GlobalRoom.addClient(c.ID); err != nil {
		return c, err
	}

	m.logger.Info(
		"client registered",
		"client_id", c.ID,
		"room_id", r.ID,
		"room_size", m.Rooms.Len(),
	)

	return c, nil
}

func (m *Manager) removeClient(c *client) error {
	c.Rooms.ForEach(func(rID string, r *room) bool {
		_ = r.removeClient(c.ID)
		return true
	})

	m.Clients.Del(c.ID)
	err := c.Conn.Close()
	if err != nil {
		return fmt.Errorf("removeClient: %w", err)
	}

	m.logger.Info(
		"client removed",
		"client_id", c.ID,
		"room_size", m.Rooms.Len(),
	)
	return nil
}

func (m *Manager) addRoom(r *room) error {
	m.Rooms.Set(r.ID, r)
	m.logger.Info(
		"room registered",
		"room_id", r.ID,
		"room_size", m.Rooms.Len(),
	)
	return nil
}

func (m *Manager) removeRoom(rID string) error {
	if rID == m.GlobalRoom.ID {
		return fmt.Errorf("can't remove global room")
	}

	r, err := m.getRoom(rID)
	if err != nil {
		return fmt.Errorf("removeRoom: %w", err)
	}

	m.Rooms.Del(r.ID)
	m.logger.Info(
		"room removed",
		"room_id", r.ID,
		"room_size", m.Rooms.Len(),
	)

	return nil
}

func (m *Manager) Shutdown() {
	m.logger.Info("Shutting down manager")
	m.Clients.ForEach(func(cID string, c *client) bool {
		_ = m.removeClient(c)
		return true
	})
}
