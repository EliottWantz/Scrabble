package ws

import (
	"fmt"
	"strings"
	"time"

	"scrabble/pkg/api/auth"
	"scrabble/pkg/api/game"
	"scrabble/pkg/api/room"
	"scrabble/pkg/api/user"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"golang.org/x/exp/slices"
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
	authSvc     *auth.Service
}

func NewManager(messageRepo *MessageRepository, roomSvc *room.Service, userSvc *user.Service, gameSvc *game.Service, authSvc *auth.Service) (*Manager, error) {
	m := &Manager{
		Clients:     haxmap.New[string, *Client](),
		Rooms:       haxmap.New[string, *Room](),
		logger:      slog.Default(),
		MessageRepo: messageRepo,
		RoomSvc:     roomSvc,
		UserSvc:     userSvc,
		GameSvc:     gameSvc,
		authSvc:     authSvc,
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
		clients := m.getClientsByUserID(cID)
		wsID := cID + "#1"
		if len(clients) > 0 {
			wsID = cID + "#2"
		}
		c := NewClient(conn, wsID, cID, m)
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
			// List all users online
			p, err := NewListOnlineUsersPacket(
				ListOnlineUsersPayload{
					Users: m.ListOnlineUsers(),
				},
			)
			if err != nil {
				m.logger.Error("list users", err)
			}
			m.Broadcast(p)
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
			// List joinailable games
			games, err := m.GameSvc.Repo.FindAllJoinableGames()
			if err != nil {
				m.logger.Error("list joinable games", err)
			}
			p, err := NewListJoinableGamesPacket(ListJoinableGamesPayload{
				Games: games,
			})
			if err != nil {
				m.logger.Error("list joinable games", err)
			}
			c.send(p)
		}
		{
			// List joinailable tournaments
			tournaments, err := m.GameSvc.Repo.FindAllJoinableTournaments()
			if err != nil {
				m.logger.Error("list joinable games", err)
			}
			p, err := NewListJoinableTournamentsPacket(ListJoinableTournamentsPayload{
				Tournaments: tournaments,
			})
			if err != nil {
				m.logger.Error("create joinable games", err)
			}
			c.send(p)
		}
		{
			// List all observable games
			games, err := m.GameSvc.Repo.FindAllObservableGames()
			if err != nil {
				m.logger.Error("list observable games", err)
			}
			p, err := NewListObservableGamesPacket(ListObservableGamesPayload{
				Games: games,
			})
			if err != nil {
				m.logger.Error("create observable games packet", err)
			}
			c.send(p)
		}
		{
			// List all observable tournaments
			tournaments, err := m.GameSvc.Repo.FindAllObservableTournaments()
			if err != nil {
				m.logger.Error("list observable tournaments", err)
			}
			p, err := NewListObservableTournamentsPacket(ListObservableTournamentsPayload{
				Tournaments: tournaments,
			})
			if err != nil {
				m.logger.Error("create observable tournaments packet", err)
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
		if c != nil {
			c.send(p)
		}
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

func (m *Manager) ListOnlineUsers() []user.User {
	online := make([]user.User, 0)
	users, err := m.UserSvc.Repo.FindAll()
	if err != nil {
		return online
	}

	for _, u := range users {
		if _, err := m.getClientByUserID(u.ID); err == nil {
			online = append(online, u)
		}
	}

	return online
}

func (m *Manager) AddClient(c *Client) error {
	user, err := m.UserSvc.Repo.Find(c.UserId)
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
		if err := r.BroadcastJoinRoomPackets(c); err != nil {
			slog.Error("failed to broadcast join room packets", err)
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
		"ws_id", c.ID,
		"user_id", c.UserId,
	)

	return nil
}

func (m *Manager) GetClientByWsID(cID string) (*Client, error) {
	c, ok := m.Clients.Get(cID)
	if !ok {
		return nil, fmt.Errorf("client with id %s not registered", cID)
	}
	return c, nil
}

func (m *Manager) getClientByUserID(userID string) (*Client, error) {
	clients := m.getClientsByUserID(userID)
	if len(clients) == 0 {
		return nil, fmt.Errorf("client with user id %s not registered", userID)
	}

	for _, client := range clients {
		if strings.Contains(client.ID, "#1") {
			return client, nil
		}
	}
	return clients[0], nil
}

func (m *Manager) getClientsByUserID(cUserID string) []*Client {
	clients := []*Client{}
	m.Clients.ForEach(func(key string, value *Client) bool {
		if value.UserId == cUserID && value != nil {
			clients = append(clients, value)
		}
		return true
	})
	return clients
}

func (m *Manager) RemoveClient(c *Client) error {
	defer close(c.receiveCh)
	defer close(c.sendCh)
	user, err := m.UserSvc.GetUser(c.UserId)
	if err != nil {
		return fmt.Errorf("removeClient: %w", err)
	}

	if err := m.UserSvc.AddNetworkingLog(user, "Logout", time.Now().UnixMilli()); err != nil {
		slog.Error("failed to add networking log", err)
	}

	var otherWsClient *Client
	clients := m.getClientsByUserID(c.UserId)
	if len(clients) > 1 {
		wsID := c.UserId + "#2"
		otherWsClient, err = m.GetClientByWsID(wsID)
		if err != nil {
			slog.Error("failed to get other ws client", err)
			otherWsClient = nil
		}
	}

	for _, chatRoomID := range user.JoinedChatRooms {
		r, err := m.GetRoom(chatRoomID)
		if err != nil {
			slog.Error("get room", err)
			continue
		}
		if err := r.RemoveClient(c.ID); err != nil {
			slog.Error("removeClient from room", err)
		}
		if otherWsClient != nil {
			if err := r.RemoveClient(otherWsClient.ID); err != nil {
				slog.Error("removeClient from room", err)
			}
		}
		userLeftRoomPacket, err := NewUserLeftRoomPacket(UserLeftRoomPayload{
			RoomID: r.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		r.BroadcastSkipSelf(userLeftRoomPacket, c.ID)
	}
	for _, DMRoomID := range user.JoinedDMRooms {
		r, err := m.GetRoom(DMRoomID)
		if err != nil {
			slog.Error("get room", err)
			continue
		}
		if otherWsClient != nil {
			if err := r.RemoveClient(otherWsClient.ID); err != nil {
				slog.Error("removeClient from room", err)
			}
		}
		if err := r.RemoveClient(c.ID); err != nil {
			slog.Error("removeClient from room", err)
		}
		userLeftDMRoomPacket, err := NewUserLeftDMRoomPacket(UserLeftDMRoomPayload{
			RoomID: r.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		r.BroadcastSkipSelf(userLeftDMRoomPacket, c.ID)
	}
	if otherWsClient != nil {
		if err := m.GlobalRoom.RemoveClient(otherWsClient.ID); err != nil {
			slog.Error("removeClient", err)
		}
	}
	if err := m.GlobalRoom.RemoveClient(c.ID); err != nil {
		slog.Error("removeClient from global room", err)
	}
	{
		userLeftGLobalRoomPacket, err := NewUserLeftRoomPacket(UserLeftRoomPayload{
			RoomID: m.GlobalRoom.ID,
			UserID: c.UserId,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
		}
		m.GlobalRoom.BroadcastSkipSelf(userLeftGLobalRoomPacket, c.ID)
	}
	if user.JoinedGame != "" {
		if otherWsClient != nil {
			if err := m.RemoveClientFromGame(otherWsClient, user.JoinedGame); err != nil {
				slog.Error("removeClient from game", err)
			}
		}
		if err := m.RemoveClientFromGame(c, user.JoinedGame); err != nil {
			slog.Error("removeClient from game", err)
		}
	}
	if user.JoinedTournament != "" {
		if otherWsClient != nil {
			if err := m.RemoveClientFromTournament(otherWsClient, user.JoinedTournament); err != nil {
				slog.Error("removeClient from tournament", err)
			}
		}
		if err := m.RemoveClientFromTournament(c, user.JoinedTournament); err != nil {
			slog.Error("removeClient from tournament", err)
		}
	}

	if c.Conn != nil {
		if err := c.Conn.Close(); err != nil {
			slog.Error("close connection #1", err)
		}
	}
	if otherWsClient != nil && otherWsClient.Conn != nil {
		if err := otherWsClient.Conn.Close(); err != nil {
			slog.Error("close connection #2", err)
		}
	}

	m.Clients.Del(c.ID)
	if otherWsClient != nil {
		m.Clients.Del(otherWsClient.ID)
	}

	{
		// List all users online
		p, err := NewListOnlineUsersPacket(
			ListOnlineUsersPayload{
				Users: m.ListOnlineUsers(),
			},
		)
		if err != nil {
			m.logger.Error("list users", err)
		}
		m.Broadcast(p)
	}

	m.logger.Info(
		"client disconnected",
		"ws_id", c.ID,
		"user_id", c.UserId,
		"total_rooms", m.Rooms.Len(),
	)

	return nil
}

func (m *Manager) RemoveClientFromGame(c *Client, gID string) error {
	r, err := c.Manager.GetRoom(gID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	g, err := c.Manager.GameSvc.Repo.FindGame(gID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}

	if err := r.RemoveClient(c.ID); err != nil {
		slog.Error("remove client from ws room", err)
	}

	if g.ScrabbleGame == nil {
		// Game has not started yet
		if c.UserId == g.CreatorID {
			// Delete the game and remove all users
			if err := c.Manager.GameSvc.Repo.DeleteGame(g.ID); err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, err.Error())
			}
			for _, uID := range g.UserIDs {
				if err := c.Manager.UserSvc.Repo.UnSetJoinedGame(uID); err != nil {
					slog.Error("remove user from game room", err)
				}
				client, err := c.Manager.getClientByUserID(uID)
				if err != nil {
					slog.Error("remove user from game room", err)
					continue
				}
				if err := r.RemoveClient(client.ID); err != nil {
					slog.Error("remove user from game room", err)
				}
				if err := r.BroadcastLeaveGamePackets(client, g.ID); err != nil {
					slog.Error("broadcast leave game packets", err)
				}
			}
			if err := m.BroadcastJoinableGames(); err != nil {
				slog.Error("broadcast joinable games", err)
			}
			return m.BroadcastObservableGames()
		} else {
			// Remove the user from the game
			if _, err := c.Manager.GameSvc.RemoveUserFromGame(gID, c.UserId); err != nil {
				slog.Error("remove user from game room", err)
			}
			if err := c.Manager.UserSvc.Repo.UnSetJoinedGame(c.UserId); err != nil {
				slog.Error("remove user from game room", err)
			}
		}
	} else {
		// if Game has started and is a spectator
		if slices.Contains(g.ObservateurIDs, c.UserId) {
			if err := r.RemoveClient(c.ID); err != nil {
				slog.Error("remove spectator from game room", err)
				return fiber.NewError(fiber.StatusInternalServerError, err.Error())
			}
			{
				p, err := NewLeftGamePacket(LeftGamePayload{
					GameID: g.ID,
				})
				if err != nil {
					slog.Error("create left game packet", err)
					return fiber.NewError(fiber.StatusInternalServerError, err.Error())
				}
				c.send(p)
			}
			return nil
		}
		// Game has started, replace player with a bot
		if err := m.ReplacePlayerWithBot(g.ID, c.UserId); err != nil {
			slog.Error("replace player with bot", err)
		}
		if err := m.UserSvc.Repo.UnSetJoinedGame(c.UserId); err != nil {
			slog.Error("remove user from game room", err)
		}
		{
			// Broadcast update game packet
			p, err := NewGameUpdatePacket(GameUpdatePayload{
				Game: makeGameUpdatePayload(g),
			})
			if err != nil {
				slog.Error("create update game packet", err)
			} else {
				r.Broadcast(p)
			}
		}
	}
	if err := r.BroadcastLeaveGamePackets(c, g.ID); err != nil {
		slog.Error("broadcast leave game packets", err)
	}
	if err := m.BroadcastObservableGames(); err != nil {
		slog.Error("broadcast observable games", err)
	}

	return nil
}

func (m *Manager) RemoveClientFromTournament(c *Client, tID string) error {
	tournamentRoom, err := c.Manager.GetRoom(tID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	t, err := c.Manager.GameSvc.Repo.FindTournament(tID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}

	if err := tournamentRoom.RemoveClient(c.ID); err != nil {
		slog.Error("remove client from ws room", err)
	}

	if !t.HasStarted {
		// Tournament has not started yet
		if c.UserId == t.CreatorID {
			// Delete the Tournament and remove all users
			if err := c.Manager.GameSvc.Repo.DeleteTournament(t.ID); err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, err.Error())
			}
			for _, uID := range t.UserIDs {
				if err := c.Manager.UserSvc.Repo.UnSetJoinedTournament(uID); err != nil {
					slog.Error("remove user from tournament room", err)
				}
				client, err := c.Manager.getClientByUserID(uID)
				if err != nil {
					slog.Error("remove user from tournament room", err)
					continue
				}
				if err := tournamentRoom.RemoveClient(client.ID); err != nil {
					slog.Error("remove user from tournament room", err)
				}
				if err := tournamentRoom.BroadcastLeaveTournamentPackets(client, t.ID); err != nil {
					slog.Error("broadcast leave tournament packets", err)
				}
			}
			return m.BroadcastObservableTournaments()
		} else {
			// Remove the user from the Tournament
			if _, err := c.Manager.GameSvc.RemoveUserFromTournament(tID, c.UserId); err != nil {
				slog.Error("remove user from Tournament room", err)
			}
			if err := c.Manager.UserSvc.Repo.UnSetJoinedTournament(c.UserId); err != nil {
				slog.Error("remove user from Tournament room", err)
			}
		}
	} else {
		// if Tournament has started and is a spectator
		if slices.Contains(t.ObservateurIDs, c.ID) {
			if err := tournamentRoom.RemoveClient(c.ID); err != nil {
				slog.Error("remove spectator from Tournament room", err)
				return fiber.NewError(fiber.StatusInternalServerError, err.Error())
			}
			{
				p, err := NewLeftTournamentPacket(LeftTournamentPayload{
					TournamentID: t.ID,
				})
				if err != nil {
					slog.Error("create left tournament packet", err)
					return fiber.NewError(fiber.StatusInternalServerError, err.Error())
				}
				c.send(p)
			}
			return nil
		}
		// Tournament has started, make opponent win his game
		u, err := m.UserSvc.Repo.Find(c.UserId)
		if err != nil {
			return err
		}
		g, err := m.GameSvc.Repo.FindGame(u.JoinedGame)
		if err != nil {
			return err
		}

		var winnerID string
		if c.UserId == g.UserIDs[0] {
			winnerID = g.UserIDs[1]
		} else {
			winnerID = g.UserIDs[0]
		}
		g.WinnerID = winnerID
		err = m.HandleGameOver(g)
		if err != nil {
			return err
		}
	}

	if err := tournamentRoom.BroadcastLeaveTournamentPackets(c, t.ID); err != nil {
		slog.Error("broadcast leave tournament packets", err)
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
		if c != nil {
			_ = m.RemoveClient(c)
		}
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

func (m *Manager) BroadcastJoinableGames() error {
	games, err := m.GameSvc.Repo.FindAllJoinableGames()
	if err != nil {
		return err
	}

	joinableGamesPacket, err := NewListJoinableGamesPacket(ListJoinableGamesPayload{
		Games: games,
	})
	if err != nil {
		return err
	}
	m.Broadcast(joinableGamesPacket)

	return nil
}

func (m *Manager) BroadcastJoinableTournaments() error {
	tournaments, err := m.GameSvc.Repo.FindAllJoinableTournaments()
	if err != nil {
		return err
	}
	joinableTournamentsPacket, err := NewListJoinableTournamentsPacket(ListJoinableTournamentsPayload{
		Tournaments: tournaments,
	})
	if err != nil {
		return err
	}
	m.Broadcast(joinableTournamentsPacket)

	return nil
}

func (m *Manager) BroadcastObservableGames() error {
	games, err := m.GameSvc.Repo.FindAllObservableGames()
	if err != nil {
		return err
	}

	ObservableGamesPacket, err := NewListObservableGamesPacket(ListObservableGamesPayload{
		Games: games,
	})
	if err != nil {
		return err
	}
	m.Broadcast(ObservableGamesPacket)

	return nil
}

func (m *Manager) BroadcastObservableTournaments() error {
	tournaments, err := m.GameSvc.Repo.FindAllObservableTournaments()
	if err != nil {
		return err
	}
	ObservableTournamentsPacket, err := NewListObservableTournamentsPacket(ListObservableTournamentsPayload{
		Tournaments: tournaments,
	})
	if err != nil {
		return err
	}
	m.Broadcast(ObservableTournamentsPacket)

	return nil
}

func (m *Manager) MakeBotMoves(gID string) {
	for {
		g, err := m.GameSvc.ApplyBotMove(gID)
		if err != nil {
			break
		}
		gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
			Game: makeGameUpdatePayload(g),
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
			if err := m.HandleGameOver(g); err != nil {
				slog.Error("failed to handle game over", err)
			}
			break
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
		if err := m.GameSvc.DeleteGame(gID); err != nil {
			return err
		}
		m.BroadcastJoinableGames()
		m.BroadcastObservableGames()
		return nil
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
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
	g.ScrabbleGame.Timer.Stop()
	gameRoom, err := m.GetRoom(g.ID)
	if err != nil {
		return err
	}

	if g.WinnerID == "" {
		winnerID := g.ScrabbleGame.Winner().ID
		g.WinnerID = winnerID
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
	})
	if err != nil {
		return err
	}
	gameRoom.Broadcast(gamePacket)

	gameOverPacket, err := NewGameOverPacket(GameOverPayload{
		WinnerID: g.WinnerID,
	})
	if err != nil {
		return err
	}

	gameRoom.Broadcast(gameOverPacket)

	// Make all players leave the game
	for _, p := range g.ScrabbleGame.Players {
		u, err := m.UserSvc.GetUser(p.ID)
		if err != nil {
			continue
		}
		client, err := m.getClientByUserID(p.ID)
		if err != nil {
			slog.Error("get client", err)
			continue
		}
		if err := m.UserSvc.AddGameStats(u, g.StartTime, time.Now().UnixMilli(), g.WinnerID == p.ID); err != nil {
			slog.Error("failed to update user stats", err)
		}
		if err := m.UserSvc.UpdateUserStats(u, g.WinnerID == p.ID, p.Score, time.Now().UnixMilli()-g.StartTime); err != nil {
			slog.Error("failed to update user stats", err)
		}
		if err := m.UserSvc.Repo.UnSetJoinedGame(client.UserId); err != nil {
			slog.Error("remove user from game room", err)
		}
		if err := gameRoom.RemoveClient(client.ID); err != nil {
			slog.Error("remove client from ws room", err)
		}
		if err := gameRoom.BroadcastLeaveGamePackets(client, g.ID); err != nil {
			slog.Error("broadcast leave game packets", err)
		}
	}

	// Make all observators leave the game
	for _, o := range g.ObservateurIDs {
		client, err := m.getClientByUserID(o)
		if err != nil {
			slog.Error("get client", err)
			continue
		}
		if err := gameRoom.RemoveClient(client.ID); err != nil {
			slog.Error("remove client from ws room", err)
		}
		if err := gameRoom.BroadcastObserverLeaveGamePacket(client, g.ID); err != nil {
			slog.Error("broadcast leave game packets", err)
		}
	}

	if g.IsTournamentGame() {
		t, err := m.GameSvc.UpdateTournamentGameOver(g.ID)
		if err != nil {
			return err
		}

		tournamentRoom, err := m.GetRoom(t.ID)
		if err != nil {
			return err
		}
		{
			p, err := NewTournamentUpdatePacket(TournamentUpdatePayload{
				Tournament: t,
			})
			if err != nil {
				return err
			}
			tournamentRoom.Broadcast(p)
		}

		if t.IsOver {
			p, err := NewTournamentOverPacket(TournamentOverPayload{
				TournamentID: t.ID,
				WinnerID:     t.WinnerID,
			})
			if err != nil {
				return err
			}
			tournamentRoom.Broadcast(p)
			if err := m.GameSvc.Repo.DeleteTournament(t.ID); err != nil {
				return err
			}
			winner, err := m.UserSvc.GetUser(t.WinnerID)
			if err != nil {
				return err
			}
			winner.Summary.UserStats.NbTournamentsWon++
			if err := m.UserSvc.Repo.Update(winner); err != nil {
				return err
			}
		} else {
			if t.Finale != nil {
				// Join the finale
				finaleRoom := m.AddRoom(t.Finale.ID, "")
				for _, playerID := range t.Finale.UserIDs {
					player, err := m.getClientByUserID(playerID)
					if err != nil {
						slog.Error("get client", err)
						continue
					}
					if err := finaleRoom.AddClient(player.ID); err != nil {
						slog.Error("add client to room", err)
					}
					if err := m.UserSvc.Repo.SetJoinedGame(t.Finale.ID, playerID); err != nil {
						slog.Error("set joined game", err)
					}
					if err := finaleRoom.BroadcastJoinGamePackets(player, t.Finale); err != nil {
						slog.Error("broadcast join game packets", err)
					}
				}

				// Start game timer
				t.Finale.ScrabbleGame.Timer.OnTick(func() {
					slog.Info("timer tick:", "gameID", g.ID, "timeRemaining", g.ScrabbleGame.Timer.TimeRemaining())
					timerPacket, err := NewTimerUpdatePacket(TimerUpdatePayload{
						Timer: t.Finale.ScrabbleGame.Timer.TimeRemaining(),
					})
					if err != nil {
						slog.Error("failed to create timer update packet:", err)
						return
					}
					finaleRoom.Broadcast(timerPacket)
				})
				t.Finale.ScrabbleGame.Timer.OnDone(func() {
					slog.Info("timer done:", "gameID", g.ID)
					t.Finale.ScrabbleGame.SkipTurn()
					GamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
						Game: makeGameUpdatePayload(t.Finale),
					})
					if err != nil {
						slog.Error("failed to create Game update packet:", err)
						return
					}
					finaleRoom.Broadcast(GamePacket)

					if t.Finale.ScrabbleGame.IsOver() {
						if err := m.HandleGameOver(t.Finale); err != nil {
							slog.Error("failed to handle game over", err)
							return
						}
					}

					// Make bots move if applicable
					go m.MakeBotMoves(t.Finale.ID)
				})
				t.Finale.ScrabbleGame.Timer.Start()

				gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
					Game: makeGameUpdatePayload(t.Finale),
				})
				if err != nil {
					return err
				}

				finaleRoom.Broadcast(gamePacket)
			} else {
				// We are wainting for next winner to finish his previous game
				// make the winner an observer of the other game
				var otherGame *game.Game
				if t.PoolGames[0] == g {
					otherGame = t.PoolGames[1]
				} else {
					otherGame = t.PoolGames[0]
				}

				_, err := m.GameSvc.AddObserverToGame(otherGame.ID, g.WinnerID)
				if err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, err.Error())
				}

				winnerClient, err := m.getClientByUserID(g.WinnerID)
				if err != nil {
					return fiber.NewError(fiber.StatusBadRequest, err.Error())
				}

				otherGameRoom, err := m.GetRoom(otherGame.ID)
				if err != nil {
					return fiber.NewError(fiber.StatusBadRequest, err.Error())
				}
				if err := otherGameRoom.AddClient(winnerClient.ID); err != nil {
					return fiber.NewError(fiber.StatusInternalServerError, err.Error())
				}
				return otherGameRoom.BroadcastObserverJoinGamePacket(winnerClient, otherGame)

			}
		}
	}

	if err := m.GameSvc.Repo.DeleteGame(g.ID); err != nil {
		return err
	}

	if err := m.BroadcastObservableGames(); err != nil {
		slog.Error("broadcast observable games", err)
	}
	if err := m.BroadcastObservableTournaments(); err != nil {
		slog.Error("broadcast observable tournaments", err)
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
