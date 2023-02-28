package ws

import (
	"errors"
	"fmt"

	"scrabble/pkg/api/user"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"go.mongodb.org/mongo-driver/mongo"
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

	r := m.CreateRoomWithID("global", "Global")
	m.GlobalRoom = r

	return m, nil
}

func (m *Manager) Accept(cID, name string) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c := NewClient(conn, cID, m)
		err := m.AddClient(c, name)
		if err != nil {
			m.logger.Error("add client", err)
			return
		}

		users, err := m.ListUsers()
		if err != nil {
			m.logger.Error("list users", err)
		}
		p, err := NewPacket(ServerEventListUsers, ListUsersPayload{Users: users})
		if err != nil {
			m.logger.Error("list users", err)
		}
		c.send(p)

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

func (m *Manager) AddClient(c *Client, name string) error {
	r := m.CreateRoomWithID(c.ID, name)
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

func (m *Manager) CreateRoom(name string) *Room {
	r := NewRoom(m, name)

	m.AddRoom(r)
	return r
}

func (m *Manager) CreateRoomWithID(ID, name string) *Room {
	r := NewRoomWithID(m, ID, name)

	m.AddRoom(r)
	return r
}

func (m *Manager) AddRoom(r *Room) error {
	slog.Info("adding room", "room_id", r.ID)
	roomDB, err := m.RoomRepo.Get(r.ID)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			// global room doesn't exist in db, insert it
			if m.RoomRepo.Insert(r) != nil {
				return nil
			}
		}
	} else {
		// global room exists in db, use it
		r.ClientIDs = roomDB.UsersIDs
	}
	m.Rooms.Set(r.ID, r)
	m.logger.Info(
		"room registered",
		"room_id", r.ID,
		"room_number", m.Rooms.Len(),
		"room_users", r.ClientIDs,
	)

	return nil
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
