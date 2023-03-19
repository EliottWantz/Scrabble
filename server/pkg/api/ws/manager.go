package ws

import (
	"fmt"
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

	dbRoom, err := m.RoomSvc.Find("global")
	if err != nil {
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

		{
			// List all users registered in the application
			p, err := NewListUsersPacket(
				ListUsersPayload{
					Users: m.ListUsers(),
				},
			)
			if err != nil {
				m.logger.Error("list users", err)
			}
			c.send(p)
		}
		{
			// List available chat rooms
			rooms, err := m.RoomSvc.GetAllChatRooms()
			if err != nil {
				m.logger.Error("list chat rooms", err)
			}
			p, err := NewListChatRoomsPacket(ListChatRoomsPayload{
				Rooms: rooms,
			})
			if err != nil {
				m.logger.Error("list chat rooms", err)
			}
			c.send(p)
		}
		{
			// List available games
			games, err := m.RoomSvc.GetAllGameRooms()
			if err != nil {
				m.logger.Error("list joinable games", err)
			}
			p, err := NewJoinableGamesPacket(ListJoinableGamesPayload{
				Games: games,
			})
			if err != nil {
				m.logger.Error("list joinable games", err)
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

func (m *Manager) BroadcastToRoom(rID string, p *Packet) (*Room, error) {
	r, err := m.GetRoom(rID)
	if err != nil {
		return nil, fmt.Errorf("failed to get room: %w", err)
	}

	r.Broadcast(p)

	return r, nil
}

func (m *Manager) ListUsers() []user.User {
	users, err := m.UserSvc.Repo.FindAll()
	if err != nil {
		users = make([]user.User, 0)
	}

	return users
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
			dbRoom, err := m.RoomSvc.Find(roomID)
			if err != nil {
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
		err := m.RemoveClientFromRoom(c, r)
		if err != nil {
			m.logger.Error("remove client from room", err)
		}

		return true
	})

	m.Clients.Del(c.ID)
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

	err = c.Conn.Close()
	if err != nil {
		return fmt.Errorf("removeClient: %w", err)
	}

	return nil
}

func (m *Manager) RemoveClientFromRoom(c *Client, r *Room) error {
	if err := r.RemoveClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to leave ws room: "+err.Error())
	}

	leftRoomPacket, err := NewLeftRoomPacket(LeftRoomPayload{
		RoomID: r.ID,
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
	}

	dbRoom, err := c.Manager.RoomSvc.Find(r.ID)
	if err != nil {
		return nil
	}

	if c.ID == dbRoom.CreatorID && dbRoom.IsGameRoom {
		_, err := c.Manager.GameSvc.Repo.GetGame(dbRoom.ID)
		if err != nil {
			// Game has not started yet
			r.Broadcast(leftRoomPacket)
			if err := r.Manager.RemoveRoom(r.ID); err != nil {
				return err
			}
			if err := c.Manager.RoomSvc.Delete(r.ID); err != nil {
				return err
			}
		}
	}
	c.send(leftRoomPacket)

	// Replace player with bot if game room
	if dbRoom.IsGameRoom {
		m.ReplacePlayerWithBot(c.ID, r, dbRoom)
	}

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

func (m *Manager) UpdateChatRooms() error {
	rooms, err := m.RoomSvc.GetAllChatRooms()
	if err != nil {
		return err
	}
	p, err := NewListChatRoomsPacket(ListChatRoomsPayload{
		Rooms: rooms,
	})
	if err != nil {
		return err
	}
	m.Broadcast(p)

	return nil
}

func (m *Manager) UpdateJoinableGames() error {
	joinableGames, err := m.RoomSvc.GetAllGameRooms()
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

func (m *Manager) MakeBotMoves(gID string) {
	// Make bots move if applicable
	for {
		g, err := m.GameSvc.ApplyBotMove(gID)
		if err != nil {
			break
		}
		gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
			Game: makeGamePayload(g),
		})
		if err != nil {
			slog.Error("failed to create update game packet", err)
			break
		}

		_, err = m.BroadcastToRoom(gID, gamePacket)
		if err != nil {
			slog.Error("failed to broadcast game update", err)
			break
		}

		if g.IsOver() {
			m.HandleGameOver(g)
		}
	}
}

func (m *Manager) ReplacePlayerWithBot(pID string, r *Room, dbRoom *room.Room) error {
	g, err := m.GameSvc.ReplacePlayerWithBot(dbRoom.ID, pID)
	if err != nil {
		return err
	}
	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
	})
	if err != nil {
		slog.Error("failed to create game update packet:", err)
	}
	r.Broadcast(gamePacket)

	// Make bots move if applicable
	go m.MakeBotMoves(dbRoom.ID)

	return nil
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
	g.Timer.Stop()

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

	return nil
}

func (m *Manager) ListNewUser() {
	for u := range m.UserSvc.NewUserChan {
		p, err := NewNewUserPacket(NewUserPayload{
			User: u,
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

func (m *Manager) sendFriendRequest(id string, friendId string) error {

	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	if strings.Contains(strings.Join(friend.PendingRequests, ""), id) {
		return fiber.NewError(fiber.StatusBadRequest, "already sent a friend request")
	}

	if strings.Contains(strings.Join(friend.Friends, ""), id) {
		return fiber.NewError(fiber.StatusBadRequest, "already friends")
	}

	friend.PendingRequests = append(friend.PendingRequests, id)
	return m.UserSvc.Repo.Update(friend)
}

func (m *Manager) acceptFriendRequest(id string, friendId string) error {
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}

	if !strings.Contains(strings.Join(user.PendingRequests, ""), friendId) {
		return fiber.NewError(fiber.StatusBadRequest, "no friend request found")
	}

	if strings.Contains(strings.Join(user.Friends, ""), friendId) {
		return fiber.NewError(fiber.StatusBadRequest, "already friends")
	}
	for i, pending_id := range friend.PendingRequests {
		if pending_id == id {
			friend.PendingRequests = append(friend.PendingRequests[:i], friend.PendingRequests[i+1:]...)
		}
	}
	for i, pending_id := range user.PendingRequests {
		if pending_id == friendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
		}
	}
	user.Friends = append(user.Friends, friendId)
	friend.Friends = append(friend.Friends, id)
	m.UserSvc.Repo.Update(friend)
	return m.UserSvc.Repo.Update(user)
}

func (m *Manager) rejectFriendRequest(id string, friendId string) error {
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	for i, pending_id := range user.PendingRequests {
		if pending_id == friendId {
			user.PendingRequests = append(user.PendingRequests[:i], user.PendingRequests[i+1:]...)
			m.UserSvc.Repo.Update(user)
		}
	}

	for i, pending_id := range friend.PendingRequests {
		if pending_id == id {
			friend.PendingRequests = append(friend.PendingRequests[:i], friend.PendingRequests[i+1:]...)
			m.UserSvc.Repo.Update(friend)
		}
	}
	for i, pending_id := range friend.Friends {
		if pending_id == id {
			friend.Friends = append(friend.Friends[:i], friend.Friends[i+1:]...)
			m.UserSvc.Repo.Update(friend)
		}
	}

	return nil
}

func (m *Manager) GetFriendsList(id string) ([]*user.User, error) {
	usr, err := m.UserSvc.GetUser(id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	friends := make([]*user.User, 0, len(usr.Friends))
	for _, id := range usr.Friends {
		f, err := m.UserSvc.GetUser(id)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
		}
		friends = append(friends, f)
	}
	return friends, nil
}

func (m *Manager) GetFriendlistById(id string, friendId string) (*user.User, error) {
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	for _, id := range user.Friends {
		if id == friendId {
			f, err := m.UserSvc.GetUser(id)
			if err != nil {
				return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
			}
			return f, nil
		}
	}
	return nil, fiber.NewError(fiber.StatusBadRequest, "no friend found")
}

func (m *Manager) RemoveFriendFromList(id string, friendId string) error {
	user, err := m.UserSvc.GetUser(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	for i, id := range user.Friends {
		if id == friendId {
			user.Friends = append(user.Friends[:i], user.Friends[i+1:]...)
			m.UserSvc.Repo.Update(user)
		}
	}
	friend, err := m.UserSvc.GetUser(friendId)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	for i, id := range friend.Friends {
		if id == id {
			friend.Friends = append(friend.Friends[:i], friend.Friends[i+1:]...)
			m.UserSvc.Repo.Update(friend)
		}
	}
	return nil
}

func (m *Manager) GetPendingFriendlistRequests(id string) ([]*user.User, error) {
	usr, err := m.UserSvc.GetUser(id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
	}
	friends := make([]*user.User, 0, len(usr.PendingRequests))
	for _, id := range usr.PendingRequests {
		f, err := m.UserSvc.GetUser(id)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "no user found")
		}
		friends = append(friends, f)
	}
	return friends, nil
}
