package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

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
		logger:  slog.New(slog.NewTextHandler(os.Stdout)),
	}

	r, err := NewRoom(m)
	if err != nil {
		return nil, err
	}

	m.GlobalRoom = r

	return m, nil
}

func (m *Manager) Accept() fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c, err := NewClient(conn, m)
		if err != nil {
			return
		}

		defer func() {
			if err := m.removeClient(c); err != nil {
				m.logger.Error("remove client error", err)
			}
		}()

		err = m.addClient(c)
		if err != nil {
			m.logger.Error("add client error", err)
			return
		}

		// Read and handle messages from the client
		for {
			p, err := c.receive()
			if err != nil {
				m.logger.Error("receive error", err)
				var syntaxError *json.SyntaxError
				if errors.As(err, &syntaxError) {
					m.logger.Info("json syntax error in packet", syntaxError)
					continue
				}
				return
			}

			go func() {
				m.logger.Info("received packet", p)
				if err := c.handlePacket(p); err != nil {
					m.logger.Error("handlePacket error", err)
				}
			}()
		}
	})
}

func (m *Manager) getClient(cID string) (*client, error) {
	c, ok := m.Clients.Get(cID)
	if !ok {
		return nil, fmt.Errorf("getClient: client with id %s not registered", cID)
	}
	return c, nil
}

func (m *Manager) getRoom(rID string) (*room, error) {
	r, ok := m.Rooms.Get(rID)
	if !ok {
		return nil, fmt.Errorf("getRoom: room with id %s not registered", rID)
	}
	return r, nil
}

func (m *Manager) addClient(c *client) error {
	if c == nil {
		return fmt.Errorf("addClient: client is nil")
	}

	r, err := NewRoom(m)
	if err != nil {
		return fmt.Errorf("addClient: %w", err)
	}

	// Client should have that same ID as the default room he is in
	c.ID = r.ID
	m.Rooms.Set(r.ID, r)
	m.Clients.Set(c.ID, c)

	if err := r.addClient(c.ID); err != nil {
		return fmt.Errorf("addClient: %w", err)
	}

	m.logger.Info(
		"client registered",
		"client_id", c.ID,
		"room_id", r.ID,
		"room_size", m.Rooms.Len(),
	)
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
		return fmt.Errorf("removeClient: %w", err)
	}

	m.logger.Info(
		"client removed",
		"client_id", c.ID,
		"room_size", m.Rooms.Len(),
	)
	return nil
}

func (m *Manager) removeRoom(rID string) error {
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

func (m *Manager) broadcast(p *Packet, senderID string) error {
	r, err := m.getRoom(p.RoomID)
	if err != nil {
		return fmt.Errorf("broadcast: %w", err)
	}

	if !r.has(senderID) {
		return fmt.Errorf("broadcast: sender %s not in room %s", senderID, p.RoomID)
	}

	r.broadcast(p, senderID)

	return nil
}

func (m *Manager) Shutdown() {
	m.logger.Info("Shutting down manager")
	m.Clients.ForEach(func(cID string, c *client) bool {
		_ = m.removeClient(c)
		return true
	})
}
