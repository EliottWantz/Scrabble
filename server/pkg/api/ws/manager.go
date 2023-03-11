package ws

import (
	"fmt"
	"reflect"
	"strings"
	"time"

	"scrabble/pkg/api/game"
	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"
	"scrabble/pkg/scrabble"

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

	dbRoom, ok := m.RoomSvc.HasRoom("global")
	if !ok {
		return nil, fmt.Errorf("global room not found")
	}
	r := m.AddRoom(dbRoom)
	m.GlobalRoom = r

	go m.ListNewUser()

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

		m.watchFriendRequests(cID)

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
			dbRoom, ok := m.RoomSvc.HasRoom(roomID)
			if !ok {
				return err
			}
			r = m.AddRoom(dbRoom)
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

func (m *Manager) AddRoom(dbRoom *room.Room) *Room {
	r := NewRoom(m, dbRoom)
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

func (m *Manager) UpdateJoinableGames() error {
	joinableGames, err := m.RoomSvc.GetAllJoinableGameRooms()
	if err != nil {
		return err
	}
	joinableGamesPacket, err := NewJoinableGamesPacket(ListJoinableGamesPayload{
		Games: joinableGames,
	})
	if err != nil {
		return err
	}
	m.Broadcast(joinableGamesPacket)

	return nil
}

func (m *Manager) watchFriendRequests(id string) {
	oldUser, _ := m.UserSvc.GetUser(id)
	oldPendingRequests := oldUser.PendingRequests

	go func() {
		for {

			newUser, _ := m.UserSvc.GetUser(id)
			newRequests := newUser.PendingRequests
			time.Sleep(1 * time.Second)
			if !reflect.DeepEqual(newRequests, oldPendingRequests) {

				incomingFriendsRequests := getArrayDifference(newRequests, oldPendingRequests)

				if len(incomingFriendsRequests) > 0 {
					m.logger.Info("new friend request", "user_id", id, "friend_requests", incomingFriendsRequests)
					for _, friend := range incomingFriendsRequests {
						isJustFriendRequest := !strings.Contains(strings.Join(newUser.Friends, ""), friend) && strings.Contains(strings.Join(newUser.PendingRequests, ""), friend)
						isAcceptFriendRequest := strings.Contains(strings.Join(newUser.Friends, ""), friend)
						isDeleteFriendRequest := !strings.Contains(strings.Join(newUser.PendingRequests, ""), friend)

						if isJustFriendRequest {
							friendUser, _ := m.UserSvc.GetUser(friend)
							friendRequestPayload := FriendRequestPayload{
								FromID:       friendUser.ID,
								FromUsername: friendUser.Username,
							}
							p, err := NewFriendRequestPacket(friendRequestPayload)
							if err != nil {
								m.logger.Error("failed to create friend request packet", err)
							}
							client, _ := m.GetClient(id)
							client.send(p)
						} else if isAcceptFriendRequest {
							friendUser, _ := m.UserSvc.GetUser(friend)
							friendRequestPayload := FriendRequestPayload{
								FromID:       friendUser.ID,
								FromUsername: friendUser.Username,
							}
							p, err := AcceptFRiendRequestPacket(friendRequestPayload)
							if err != nil {
								m.logger.Error("failed to create friend request packet", err)
							}
							client, _ := m.GetClient(id)
							client.send(p)
						} else if isDeleteFriendRequest {
							friendUser, _ := m.UserSvc.GetUser(friend)
							friendRequestPayload := FriendRequestPayload{
								FromID:       friendUser.ID,
								FromUsername: friendUser.Username,
							}
							p, err := DeclineFriendRequestPacket(friendRequestPayload)
							if err != nil {
								m.logger.Error("failed to create friend request packet", err)
							}
							client, _ := m.GetClient(id)
							client.send(p)
						}

					}

					oldPendingRequests = newRequests

				}

			}
		}
	}()
}

func (m *Manager) HandleGameOver(g *scrabble.Game) error {
	r, err := m.GetRoom(g.ID)
	if err != nil {
		return err
	}

	winnerID := g.Winner().ID
	gameOverPacket, err := NewGameOverPacket(GameOverPayload{
		WinnerID: winnerID,
	})
	if err != nil {
		return err
	}

	r.Broadcast(gameOverPacket)

	for _, p := range g.Players {
		u, err := m.UserSvc.GetUser(p.ID)
		if err != nil {
			continue
		}
		m.UserSvc.AddGameStats(u, time.Now().UnixMilli(), winnerID == p.ID)
		m.UserSvc.UpdateUserStats(u, winnerID == p.ID, p.Score, time.Now().UnixMilli())
		m.UserSvc.LeaveRoom(r.ID, u.ID)
	}

	leftRoomPacket, err := NewLeftRoomPacket(LeftRoomPayload{
		RoomID: r.ID,
	})
	if err != nil {
		return err
	}
	r.Broadcast(leftRoomPacket)

	err = m.RoomSvc.Delete(r.ID)
	if err != nil {
		return err
	}
	err = m.RemoveRoom(r.ID)
	if err != nil {
		return err
	}
	err = m.GameSvc.DeleteGame(g.ID)
	if err != nil {
		return err
	}

	// TODO:  update user Gamestats
	// m.UserSvc.UpdateUserStats()

	// TODO : add new game stats
	// s.UserSvc.addGameStats()

	return nil
}

func (m *Manager) ListNewUser() {
	for u := range m.UserSvc.NewUserChan {
		p, err := NewNewUserPacket(NewUserPayload{
			User: user.PublicUser{
				ID:       u.ID,
				Username: u.Username,
				Avatar:   u.Avatar,
			},
		})
		if err != nil {
			continue
		}

		m.Broadcast(p)
	}
}

func getArrayDifference(a, b []string) []string {
	diff := []string{}
	for _, value := range a {
		found := false
		for _, otherValue := range b {
			if value == otherValue {
				found = true
				break
			}
		}
		if !found {
			diff = append(diff, value)
		}
	}
	for _, value := range b {
		found := false
		for _, otherValue := range a {
			if value == otherValue {
				found = true
				break
			}
		}
		if !found {
			diff = append(diff, value)
		}
	}
	return diff
}
