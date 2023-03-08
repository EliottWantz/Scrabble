package ws

import (
	"fmt"
	"time"

	"scrabble/pkg/api/game"
	"scrabble/pkg/api/room"
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
	RoomSvc     *room.Service
	UserSvc     *user.Service
	GameSvc     *game.Service
}

func NewManager(messageRepo *MessageRepository, roomSvc *room.Service, userSvc *user.Service, gameSvc *game.Service) (*Manager, error) {
	m := &Manager{
		Clients:     haxmap.New[string, *Client](),
		Rooms:       haxmap.New[string, *Room](),
		logger:      slog.Default(),
		MessageRepo: messageRepo,
		RoomSvc:     roomSvc,
		UserSvc:     userSvc,
		GameSvc:     gameSvc,
	}

	r := m.AddRoom("global")
	m.GlobalRoom = r

	return m, nil
}

func (m *Manager) Accept(cID string) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		c := NewClient(conn, cID, m)
		err := m.AddClient(c)
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
	users, err := m.UserSvc.Repo.FindAll()
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

func (m *Manager) AddClient(c *Client) error {
	user, err := m.UserSvc.Repo.Find(c.ID)
	if err != nil {
		return err
	}

	m.Clients.Set(c.ID, c)

	// Add the client to the global room
	if err := m.GlobalRoom.AddClient(c.ID); err != nil {
		return err
	}

	// Add the client to all his joined rooms
	for _, roomID := range user.JoinedChatRooms {
		r, err := m.GetRoom(roomID)
		if err != nil {
			r = m.AddRoom(roomID)
		}
		if err := r.AddClient(c.ID); err != nil {
			return err
		}
	}

	m.logger.Info(
		"client registered",
		"client_id", c.ID,
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
		if err := r.RemoveClient(c.ID); err != nil {
			r.logger.Error("failed to remove client from room", err, "client_id", c.ID)
		}

		return true
	})

	m.Clients.Del(c.ID)
	err := c.Conn.Close()
	if err != nil {
		return fmt.Errorf("removeClient: %w", err)
	}

	user, err := m.UserSvc.GetUser(c.ID)
	if err != nil {
		return fmt.Errorf("removeClient: %w", err)
	}
	m.UserSvc.AddNetworkingLog(user, "Logout", time.Now().UnixMilli())
	m.logger.Info(
		"client disconnected",
		"client_id", c.ID,
		"total_rooms", m.Rooms.Len(),
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

func (m *Manager) AddRoom(ID string) *Room {
	r := NewRoom(m, ID)
	m.Rooms.Set(r.ID, r)
	m.logger.Info(
		"room registered",
		"room_id", r.ID,
		"total_rooms", m.Rooms.Len(),
	)

	return r
}

func (m *Manager) GetRoom(rID string) (*Room, error) {
	r, ok := m.Rooms.Get(rID)
	if !ok {
		return nil, ErrRoomNotFound
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
		"total_rooms", m.Rooms.Len(),
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
