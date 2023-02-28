package ws

import (
	"fmt"

	"scrabble/pkg/api/user"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"golang.org/x/exp/slog"
)

type Manager struct {
	Clients     *haxmap.Map[string, *Client]
	Rooms       *haxmap.Map[string, *Room]
	GlobalRoom  *Room
	logger      *slog.Logger
	MessageRepo *MessageRepository
	RoomRepo    *RoomRepository
	UserRepo    *user.Repository
}

func NewManager(messageRepo *MessageRepository, roomRepo *RoomRepository, userRepo *user.Repository) (*Manager, error) {
	m := &Manager{
		Clients:     haxmap.New[string, *Client](),
		Rooms:       haxmap.New[string, *Room](),
		logger:      slog.Default(),
		MessageRepo: messageRepo,
		RoomRepo:    roomRepo,
		UserRepo:    userRepo,
	}

	m.GlobalRoom = NewRoomWithID(m, "global")
	m.AddRoom(m.GlobalRoom)

	return m, nil
}

func (m *Manager) Accept(cID string) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c := NewClient(conn, cID, m)
		err := m.AddClient(conn, c)
		if err != nil {
			m.logger.Error("add client", err)
			return
		}

		{
			users, err := m.ListUsers()
			if err != nil {
				m.logger.Error("list users", err)
			}
			p, err := NewPacket(ServerEventListUsers, ListUsersPayload{Users: users})
			if err != nil {
				m.logger.Error("list users", err)
			}
			c.send(p)
		}

		<-c.quitCh
		if err := m.RemoveClient(c); err != nil {
			m.logger.Error("remove client", err)
		}
	})
}

func (m *Manager) Broadcast(p *Packet) {
	m.Clients.ForEach(func(cID string, c *Client) bool {
		c.send(p)
		return true
	})
}

func (m *Manager) SendLatestMessages(rID string, c *Client) error {
	msgs, err := m.MessageRepo.LatestMessage(rID, 0)
	if err != nil {
		return err
	}

	for _, msg := range msgs {
		p, err := NewPacket(ClientEventBroadcast, msg)
		if err != nil {
			return err
		}
		c.send(p)
	}

	return nil
}

func (m *Manager) ListUsers() ([]user.PublicUser, error) {
	var pubUsers []user.PublicUser
	users, err := m.UserRepo.FindAll()
	if err != nil {
		return nil, err
	}

	for _, u := range users {
		pubUser := user.PublicUser{
			ID:       u.ID,
			Username: u.Username,
			Avatar:   u.Avatar,
		}
		pubUsers = append(pubUsers, pubUser)
	}

	return pubUsers, nil
}

func (m *Manager) AddClient(conn *websocket.Conn, c *Client) error {
	r := NewRoomWithID(m, c.ID)
	m.AddRoom(r)
	m.Clients.Set(c.ID, c)

	if err := r.addClient(c.ID); err != nil {
		return err
	}

	if err := m.GlobalRoom.addClient(c.ID); err != nil {
		return err
	}

	m.logger.Info(
		"client registered",
		"client_id", c.ID,
		"room_id", r.ID,
		"room_number", m.Rooms.Len(),
	)

	return nil
}

func (m *Manager) GetClient(cID string) (*Client, error) {
	c, ok := m.Clients.Get(cID)
	if !ok {
		return nil, fmt.Errorf("client with id %s not registered", cID)
	}
	return c, nil
}

func (m *Manager) RemoveClient(c *Client) error {
	c.Rooms.ForEach(func(rID string, r *Room) bool {
		if err := r.removeClient(c.ID); err != nil {
			r.logger.Error("failed to remove client from room", err, "client_id", c.ID)
		}

		return true
	})

	m.Clients.Del(c.ID)
	err := c.Conn.Close()
	if err != nil {
		return fmt.Errorf("removeClient: %w", err)
	}

	m.logger.Info(
		"client disconnected",
		"client_id", c.ID,
		"room_number", m.Rooms.Len(),
	)
	return nil
}

func (m *Manager) DisconnectClient(cID string) error {
	c, err := m.GetClient(cID)
	if err != nil {
		return err
	}

	return c.Conn.WriteMessage(
		websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""),
	)
}

func (m *Manager) AddRoom(r *Room) {
	m.Rooms.Set(r.ID, r)
	m.logger.Info(
		"room registered",
		"room_id", r.ID,
		"room_number", m.Rooms.Len(),
	)
}

func (m *Manager) GetRoom(rID string) (*Room, error) {
	r, ok := m.Rooms.Get(rID)
	if !ok {
		return nil, fmt.Errorf("room with id %s not registered", rID)
	}
	return r, nil
}

func (m *Manager) RemoveRoom(rID string) error {
	if rID == m.GlobalRoom.ID {
		return fmt.Errorf("can't remove global room")
	}

	r, err := m.GetRoom(rID)
	if err != nil {
		return fmt.Errorf("removeRoom: %w", err)
	}

	m.Rooms.Del(r.ID)
	m.logger.Info(
		"room removed",
		"room_id", r.ID,
		"room_number", m.Rooms.Len(),
	)

	return nil
}

func (m *Manager) Shutdown() {
	m.logger.Info("Shutting down manager")
	m.Clients.ForEach(func(cID string, c *Client) bool {
		_ = m.RemoveClient(c)
		return true
	})
}
