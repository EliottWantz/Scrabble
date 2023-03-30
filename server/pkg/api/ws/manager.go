package ws

import (
	"fmt"
	"strings"
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

	dbRoom, err := m.RoomSvc.Repo.Find("global")
	if err != nil {
		return nil, fmt.Errorf("global room not found")
	}
	r := m.AddRoom(dbRoom.ID, dbRoom.Name)
	m.GlobalRoom = r

	go m.ListNewUser()

	return m, nil
}

func (m *Manager) Accept(cID string) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		id := cID + "#1"
		c, err := m.GetClient(id)
		if err != nil {
			m.logger.Info("no ws connection for this client yet", "msg", err)
		}
		slog.Info("user already connected, creating a new socket connection with a different ID", "client id", cID)
		if c != nil {
			id = cID + "#2"
		}
		c = NewClient(conn, id, m)
		err = m.AddClient(c)
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
			rooms, err := m.RoomSvc.Repo.FindAll()
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
			games, err := m.GameSvc.Repo.FindAll()
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
	if err := m.GlobalRoom.BroadcastJoinRoomPackets(c); err != nil {
		slog.Error("failed to broadcast join room packets", err)
	}

	// Add the client to all his joined rooms
	for _, roomID := range user.JoinedChatRooms {
		r, err := m.GetRoom(roomID)
		if err != nil {
			dbRoom, err := m.RoomSvc.Repo.Find(roomID)
			if err != nil {
				return err
			}
			r = m.AddRoom(dbRoom.ID, dbRoom.Name)
		}
		if err := r.AddClient(c.ID); err != nil {
			return err
		}
	}
	// Add the client to all his joined dm rooms
	for _, roomID := range user.JoinedDMRooms {
		r, err := m.GetRoom(roomID)
		if err != nil {
			dbRoom, err := m.RoomSvc.Repo.Find(roomID)
			if err != nil {
				return err
			}
			r = m.AddRoom(dbRoom.ID, dbRoom.Name)
		}
		if err := r.AddClient(c.ID); err != nil {
			return err
		}
		if err := r.BroadcastJoinDMRoomPackets(c); err != nil {
			slog.Error("failed to broadcast join dm room packets", err)
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
	defer close(c.receiveCh)
	defer close(c.sendCh)
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

	for _, chatRoomID := range user.JoinedChatRooms {
		r, err := m.GetRoom(chatRoomID)
		if err != nil {
			slog.Error("removeClient get room", err)
			continue
		}
		if err := r.RemoveClient(c.ID); err != nil {
			slog.Error("removeClient from room", err)
			continue
		}
		userLeftRoomPacket, err := NewUserLeftRoomPacket(UserLeftRoomPayload{
			RoomID: r.ID,
			UserID: c.ID,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		r.BroadcastSkipSelf(userLeftRoomPacket, c.ID)
	}
	for _, DMRoomID := range user.JoinedDMRooms {
		r, err := m.GetRoom(DMRoomID)
		if err != nil {
			slog.Error("removeClient get room", err)
			continue
		}
		if err := r.RemoveClient(c.ID); err != nil {
			slog.Error("removeClient from room", err)
			continue
		}
		userLeftDMRoomPacket, err := NewUserLeftDMRoomPacket(UserLeftDMRoomPayload{
			RoomID: r.ID,
			UserID: c.ID,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		r.BroadcastSkipSelf(userLeftDMRoomPacket, c.ID)
	}
	if err := m.GlobalRoom.RemoveClient(c.ID); err != nil {
		slog.Error("removeClient from global room", err)
	}
	{
		userLeftGLobalRoomPacket, err := NewUserLeftRoomPacket(UserLeftRoomPayload{
			RoomID: m.GlobalRoom.ID,
			UserID: c.ID,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		m.GlobalRoom.BroadcastSkipSelf(userLeftGLobalRoomPacket, c.ID)
	}
	if user.JoinedGame != "" {
		if err := m.RemoveClientFromGame(c, user.JoinedGame); err != nil {
			slog.Error("removeClient from game", err)
		}
	}

	if err := c.Conn.Close(); err != nil {
		slog.Error("close connection", err)
	}
	m.Clients.Del(c.ID)
	return nil
}

func (m *Manager) RemoveClientFromGame(c *Client, gID string) error {
	r, err := c.Manager.GetRoom(gID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	g, err := c.Manager.GameSvc.Repo.Find(gID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}

	if err := r.RemoveClient(c.ID); err != nil {
		slog.Error("remove client from ws room", err)
	}
	if err := r.BroadcastLeaveGamePackets(c, g.ID); err != nil {
		slog.Error("broadcast leave game packets", err)
	}

	if g.ScrabbleGame == nil {
		// Game has not started yet
		if c.ID == g.CreatorID {
			// Delete the game and remove all users
			if err := c.Manager.GameSvc.Repo.Delete(g.ID); err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, err.Error())
			}
			for _, uID := range g.UserIDs {
				if err := r.RemoveClient(uID); err != nil {
					slog.Error("remove user from game room", err)
					continue
				}
				if err := c.Manager.UserSvc.Repo.UnSetJoinedGame(uID); err != nil {
					slog.Error("remove user from game room", err)
					continue
				}
				client, err := c.Manager.GetClient(uID)
				if err != nil {
					slog.Error("remove user from game room", err)
					continue
				}
				if err := r.BroadcastLeaveGamePackets(client, g.ID); err != nil {
					slog.Error("broadcast leave game packets", err)
					continue
				}
			}
			return nil
		} else {
			// Remove the user from the game
			if _, err := c.Manager.GameSvc.RemoveUser(gID, c.ID); err != nil {
				slog.Error("remove user from game room", err)
			}
			if err := c.Manager.UserSvc.Repo.UnSetJoinedGame(c.ID); err != nil {
				slog.Error("remove user from game room", err)
			}
		}
	} else {
		// if Game has started and is a spectator
		if strings.Contains(strings.Join(g.ObservateurIDs, ""), c.ID) {
			if err := r.RemoveClient(c.ID); err != nil {
				slog.Error("remove spectator from game room", err)
			}
			return nil
		}
		// Game has started, replace player with a bot
		if err := c.Manager.ReplacePlayerWithBot(g.ID, c.ID); err != nil {
			slog.Error("replace player with bot", err)
		}
		if err := c.Manager.UserSvc.Repo.UnSetJoinedGame(c.ID); err != nil {
			slog.Error("remove user from game room", err)
		}
	}
	return nil
}

func (m *Manager) AddRoom(ID, name string) *Room {
	r := NewRoom(m, ID, name)
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
	rooms, err := m.RoomSvc.Repo.FindAll()
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
	games, err := m.GameSvc.Repo.FindAll()
	if err != nil {
		return err
	}
	joinable := make([]*game.Game, 0, len(games))
	for _, g := range games {
		if g.IsJoinable() {
			joinable = append(joinable, g)
		}
	}

	joinableGamesPacket, err := NewJoinableGamesPacket(ListJoinableGamesPayload{
		Games: joinable,
	})
	if err != nil {
		return err
	}
	m.Broadcast(joinableGamesPacket)

	return nil
}

func (m *Manager) MakeBotMoves(gID string) {
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

		if g.ScrabbleGame.IsOver() {
			m.HandleGameOver(g)
		}
	}
}

func (m *Manager) ReplacePlayerWithBot(gID, pID string) error {
	g, err := m.GameSvc.ReplacePlayerWithBot(gID, pID)
	if err != nil {
		return err
	}
	if len(g.ScrabbleGame.Players) == g.ScrabbleGame.NumberOfBots() {
		// Everyone left, delete the game, don't continue
		return m.GameSvc.DeleteGame(gID)
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
	})
	if err != nil {
		return err
	}

	r, err := m.GetRoom(gID)
	if err != nil {
		return err
	}
	r.Broadcast(gamePacket)

	// Make bots move if applicable
	go m.MakeBotMoves(gID)

	return nil
}

func (m *Manager) HandleGameOver(g *game.Game) error {
	r, err := m.GetRoom(g.ID)
	if err != nil {
		return err
	}

	winnerID := g.ScrabbleGame.Winner().ID
	gameOverPacket, err := NewGameOverPacket(GameOverPayload{
		WinnerID: winnerID,
	})
	if err != nil {
		return err
	}

	r.Broadcast(gameOverPacket)
	g.ScrabbleGame.Timer.Stop()

	for _, p := range g.ScrabbleGame.Players {
		u, err := m.UserSvc.GetUser(p.ID)
		if err != nil {
			continue
		}
		m.UserSvc.AddGameStats(u, time.Now().UnixMilli(), winnerID == p.ID)
		m.UserSvc.UpdateUserStats(u, winnerID == p.ID, p.Score, time.Now().UnixMilli())
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
