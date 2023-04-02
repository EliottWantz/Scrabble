package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"scrabble/pkg/api/game"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"golang.org/x/exp/slog"
)

var (
	ErrLeavingOwnRoom     = errors.New("trying to leave own room")
	ErrLeavingGloabalRoom = errors.New("client trying to leave global room")
)

type Client struct {
	ID        string
	UserId    string
	Manager   *Manager
	Conn      *websocket.Conn
	logger    *slog.Logger
	sendCh    chan *Packet
	receiveCh chan *Packet
	quitCh    chan struct{}
}

func NewClient(conn *websocket.Conn, cID, userID string, m *Manager) *Client {
	c := &Client{
		ID:        cID,
		UserId:    userID,
		Manager:   m,
		Conn:      conn,
		logger:    slog.With("client", cID),
		sendCh:    make(chan *Packet, 10),
		receiveCh: make(chan *Packet, 10),
		quitCh:    make(chan struct{}),
	}

	go c.write()
	go c.read()

	return c
}

func (c *Client) write() {
	for p := range c.sendCh {
		if err := c.Conn.WriteJSON(p); err != nil {
			c.logger.Error("write packet", err)
		}
	}
}

func (c *Client) send(p *Packet) {
	c.sendCh <- p
}

func (c *Client) read() {
	go c.receive()

	for {
		p := &Packet{}
		err := c.Conn.ReadJSON(p)
		if err != nil {
			var syntaxError *json.SyntaxError
			if errors.As(err, &syntaxError) {
				c.logger.Info("json syntax error in packet", syntaxError)
				continue
			}
			c.quitCh <- struct{}{}
			return
		}

		c.receiveCh <- p
	}
}

func (c *Client) receive() {
	for p := range c.receiveCh {
		c.logger.Info("received packet", "event", p.Event)
		if err := c.handlePacket(p); err != nil {
			c.logger.Error("handlePacket", err)
			errPacket, err := NewErrorPacket(err)
			if err != nil {
				c.logger.Error("new error packet", err)
			}
			c.send(errPacket)
		}
		c.Manager.logger.Info("rooms remaining", "rooms", c.Manager.Rooms.Len())
	}
}

func (c *Client) handlePacket(p *Packet) error {
	switch p.Event {
	case ClientEventNoEvent:
		c.logger.Info("received packet with no action")
	case ClientEventChatMessage:
		return c.HandleChatMessage(p)
	case ClientEventCreateRoom:
		return c.HandleCreateRoomRequest(p)
	case ClientEventJoinRoom:
		return c.HandleJoinRoomRequest(p)
	case ClientEventLeaveRoom:
		return c.HandleLeaveRoomRequest(p)
	case ClientEventCreateDMRoom:
		return c.HandleCreateDMRoomRequest(p)
	case ClientEventLeaveDMRoom:
		return c.HandleLeaveDMRoomRequest(p)
	case ClientEventCreateGame:
		return c.HandleCreateGameRequest(p)
	case ClientEventJoinGame:
		return c.HandleJoinGameRequest(p)
	case ClientEventLeaveGame:
		return c.HandleLeaveGameRequest(p)
	case ClientEventStartGame:
		return c.HandleStartGameRequest(p)
	case ClientEventPlayMove:
		return c.HandlePlayMoveRequest(p)
	case ClientEventIndice:
		return c.HandleIndiceRequest(p)
	case ClientEventJoinGameAsObservateur:
		return c.HandleJoinGameAsObserverRequest(p)
	case ClientEventLeaveGameAsObservateur:
		return c.HandleLeaveGameAsObservateurRequest(p)
	case ClientEventReplaceBotByObserver:
		return c.HandleClientEventReplaceBotByObserverRequest(p)
	case ClientEventGamePrivate:
		return c.HandleGamePrivateRequest(p)
	case ClientEventGamePublic:
		return c.HandleGamePublicRequest(p)
	case ClientEventCreateTournament:
		return c.HandleCreateTournamentRequest(p)
	case ClientEventJoinTournament:
		return c.HandleJoinTournamentRequest(p)
	case ClientEventLeaveTournament:
		return c.HandleLeaveTournamentRequest(p)
	case ClientEventStartTournament:
		return c.HandleStartTournamentRequest(p)
	case ClientEventJoinTournamentAsObservateur:
		return c.HandleJoinTournamentAsObserverRequest(p)
	case ClientEventLeaveTournamentAsObservateur:
		return c.HandleLeaveTournamentAsObservateurRequest(p)
	}

	return nil
}

func (c *Client) BroadcastToRoom(rID string, p *Packet) (*Room, error) {
	r, err := c.Manager.GetRoom(rID)
	if err != nil {
		return nil, fmt.Errorf("failed to get room: %w", err)
	}

	if !r.has(c.ID) {
		return nil, fmt.Errorf("%w %s", ErrNotInRoom, rID)
	}

	r.Broadcast(p)

	return r, nil
}

func (c *Client) HandleChatMessage(p *Packet) error {
	payload := ChatMessage{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal ChatMessage: %w", err)
	}
	payload.Timestamp = time.Now().UTC()
	slog.Info("room-message", "payload", payload)
	if err := p.setPayload(payload); err != nil {
		return err
	}

	r, err := c.BroadcastToRoom(payload.RoomID, p)
	if err != nil {
		return err
	}

	if err := r.Manager.MessageRepo.InsertOne(r.ID, &payload); err != nil {
		slog.Error("failed to insert message in db", err)
	}

	return nil
}

func (c *Client) HandleCreateRoomRequest(p *Packet) error {
	payload := CreateRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	dbRoom, err := c.Manager.RoomSvc.CreateRoom(
		uuid.NewString(),
		payload.RoomName,
		c.UserId,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	userIds := append([]string{c.UserId}, payload.UserIDs...)
	for _, uID := range userIds {
		client, err := c.Manager.getClientByUserID(uID)
		if err != nil {
			slog.Error("failed to get client by user id", err)
		}

		if err := c.Manager.RoomSvc.Repo.AddUser(r.ID, client.UserId); err != nil {
			slog.Error("add user to room", err)
		}
		if err := c.Manager.UserSvc.Repo.AddJoinedRoom(r.ID, client.UserId); err != nil {
			slog.Error("add user to room", err)
		}
		if err := r.AddClient(client.ID); err != nil {
			slog.Error("add client to ws room", err)
		}

		if err := r.BroadcastJoinRoomPackets(client); err != nil {
			slog.Error("broadcast join room packets", err)
		}

	}

	if err := c.Manager.UpdateChatRooms(); err != nil {
		slog.Error("send joinable games update:", err)
	}

	return nil
}

func (c *Client) HandleJoinRoomRequest(p *Packet) error {
	payload := JoinRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := c.Manager.RoomSvc.Repo.AddUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to join room: "+err.Error())
	}
	if err := c.Manager.UserSvc.Repo.AddJoinedRoom(payload.RoomID, c.UserId); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to add user to room"+err.Error())
	}
	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := r.BroadcastJoinRoomPackets(c); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return nil
}

func (c *Client) HandleLeaveRoomRequest(p *Packet) error {
	payload := LeaveRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	if payload.RoomID == c.Manager.GlobalRoom.ID {
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave the global room")
	}

	if err := c.Manager.UserSvc.Repo.RemoveJoinedRoom(payload.RoomID, c.UserId); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.RoomSvc.Repo.RemoveUser(payload.RoomID, c.UserId); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := r.RemoveClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return r.BroadcastLeaveRoomPackets(c)
}

func (c *Client) HandleCreateDMRoomRequest(p *Packet) error {
	payload := CreateDMRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	roomName := fmt.Sprintf("%s/%s", payload.Username, payload.ToUsername)
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(
		uuid.NewString(),
		roomName,
		c.UserId,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	r := c.Manager.AddRoom(dbRoom.ID, roomName)
	userIds := []string{c.ID, payload.ToID}
	for _, uID := range userIds {
		client, err := c.Manager.getClientByUserID(uID)
		if err != nil {
			slog.Error("failed to get client by user id", err)
		}

		if err := c.Manager.RoomSvc.Repo.AddUser(r.ID, client.UserId); err != nil {
			slog.Error("add user to room", err)
		}
		if err := c.Manager.UserSvc.Repo.AddJoinedDMRoom(r.ID, client.UserId); err != nil {
			slog.Error("add user to room", err)
		}
		if err := r.AddClient(client.ID); err != nil {
			slog.Error("add client to ws room", err)
		}

		if err := r.BroadcastJoinDMRoomPackets(client); err != nil {
			slog.Error("broadcast join room packets", err)
		}

	}

	return nil
}

func (c *Client) HandleLeaveDMRoomRequest(p *Packet) error {
	payload := LeaveDMRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	if err := c.Manager.UserSvc.Repo.RemoveJoinedDMRoom(payload.RoomID, c.UserId); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.RoomSvc.Repo.RemoveUser(payload.RoomID, c.UserId); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := r.RemoveClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return r.BroadcastLeaveDMRoomPackets(c)
}

func (c *Client) HandleCreateGameRequest(p *Packet) error {
	payload := CreateGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	var err error
	var g *game.Game
	if payload.Password != "" {
		g, err = c.Manager.GameSvc.NewProtectedGame(c.UserId, payload.WithUserIDs, payload.Password)
	} else {
		g, err = c.Manager.GameSvc.NewGame(c.UserId, payload.WithUserIDs)
	}
	if err != nil {
		return err
	}

	r := c.Manager.AddRoom(g.ID, "")
	for _, uID := range g.UserIDs {
		client, err := c.Manager.getClientByUserID(uID)
		if err != nil {
			slog.Error("get client", err)
			continue
		}

		if err := r.AddClient(client.ID); err != nil {
			slog.Error("add client to ws room", err)
			continue
		}
		if err := c.Manager.UserSvc.Repo.SetJoinedGame(g.ID, client.UserId); err != nil {
			slog.Error("add user to room", err)
			continue
		}
		if err := r.BroadcastJoinGamePackets(client, g); err != nil {
			slog.Error("broadcast join room packets", err)
			continue
		}
	}

	return c.Manager.BroadcastObservableGames()
}

func (c *Client) HandleJoinGameRequest(p *Packet) error {
	payload := JoinGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	g, err := c.Manager.GameSvc.AddUserToGame(payload.GameID, c.UserId, payload.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	r, err := c.Manager.GetRoom(payload.GameID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.UserSvc.Repo.SetJoinedGame(g.ID, c.UserId); err != nil {
		return err
	}

	return r.BroadcastJoinGamePackets(c, g)
}

func (c *Client) HandleJoinGameAsObserverRequest(p *Packet) error {
	payload := JoinGameAsObserverPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	g, err := c.Manager.GameSvc.AddObserverToGame(payload.GameID, c.UserId)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	if g.IsPrivateGame {
		return fiber.NewError(fiber.StatusUnauthorized, "game is private")
	}

	r, err := c.Manager.GetRoom(payload.GameID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	{
		p, err := NewJoinedGamePacket(JoinedGamePayload{
			Game: g,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
		c.send(p)
	}
	return r.BroadcastObserverJoinGamePacket(c, g)
}

func (c *Client) HandleLeaveGameAsObservateurRequest(p *Packet) error {
	payload := LeaveGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	_, err := c.Manager.GameSvc.RemoveObserverFromGame(payload.GameID, c.UserId)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.Manager.RemoveClientFromGame(c, payload.GameID)
}

func (c *Client) HandleLeaveGameRequest(p *Packet) error {
	payload := LeaveGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	return c.Manager.RemoveClientFromGame(c, payload.GameID)
}

func (c *Client) HandleStartGameRequest(p *Packet) error {
	payload := StartGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "parse request: "+err.Error())
	}
	g, err := c.Manager.GameSvc.Repo.FindGame(payload.GameID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Room not found")
	}
	if c.UserId != g.CreatorID {
		return fiber.NewError(fiber.StatusForbidden, "You are not the room creator")
	}
	if g.ScrabbleGame != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Game already started")
	}

	if err := c.Manager.GameSvc.StartGame(g); err != nil {
		return err
	}

	r, err := c.Manager.GetRoom(g.ID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "ws room not found: "+err.Error())
	}
	// Start game timer
	g.ScrabbleGame.Timer.OnTick(func() {
		timerPacket, err := NewTimerUpdatePacket(TimerUpdatePayload{
			Timer: g.ScrabbleGame.Timer.TimeRemaining(),
		})
		if err != nil {
			slog.Error("failed to create timer update packet:", err)
			return
		}
		r.Broadcast(timerPacket)
	})
	g.ScrabbleGame.Timer.OnDone(func() {
		g.ScrabbleGame.SkipTurn()
		gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
			Game: makeGameUpdatePayload(g),
		})
		if err != nil {
			slog.Error("failed to create game update packet:", err)
			return
		}
		r.Broadcast(gamePacket)

		// Make bots move if applicable
		go c.Manager.MakeBotMoves(g.ID)
	})
	g.ScrabbleGame.Timer.Start()
	g.StartTime = time.Now().UnixMilli()
	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
	})
	if err != nil {
		return err
	}

	r.Broadcast(gamePacket)
	r.Manager.BroadcastJoinableGames()

	return nil
}

func (c *Client) HandlePlayMoveRequest(p *Packet) error {
	payload := PlayMovePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal PlayMovePayload: %w", err)
	}
	slog.Info("playMove", "payload", payload)

	g, err := c.Manager.GameSvc.ApplyPlayerMove(payload.GameID, c.UserId, payload.MoveInfo)
	if err != nil {
		return err
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
	})
	if err != nil {
		return err
	}

	_, err = c.BroadcastToRoom(payload.GameID, gamePacket)
	if err != nil {
		return err
	}

	if g.ScrabbleGame.IsOver() {
		return c.Manager.HandleGameOver(g)
	}

	// Make bots move if applicable
	go c.Manager.MakeBotMoves(payload.GameID)

	return nil
}

func (c *Client) HandleIndiceRequest(p *Packet) error {
	payload := IndicePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	moves, err := c.Manager.GameSvc.GetIndices(payload.GameID)
	if err != nil {
		return err
	}

	response, err := NewServerIndicePacket(ServerIndicePayload{
		Moves: moves,
	})
	if err != nil {
		return err
	}

	c.send(response)

	return nil
}

func (c *Client) HandleClientEventReplaceBotByObserverRequest(p *Packet) error {
	payload := JoinGameAsObserverPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	g, err := c.Manager.GameSvc.ReplaceBotByObserver(payload.GameID, c.UserId)
	if err != nil {
		return err
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
	})
	if err != nil {
		return err
	}
	c.send(gamePacket)
	_, err = c.BroadcastToRoom(payload.GameID, gamePacket)
	if err != nil {
		return err
	}

	return nil
}

func (c *Client) HandleGamePrivateRequest(p *Packet) error {
	payload := MakeGamePrivatePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}
	g, err := c.Manager.GameSvc.MakeGamePrivate(payload.GameID)
	if err != nil {
		return err
	}
	r, err := c.Manager.GetRoom(g.ID)
	for _, observateur := range g.ObservateurIDs {
		client, err := c.Manager.getClientByUserID(observateur)
		if err != nil {
			slog.Error("get room", err)
		}
		if err := r.RemoveClient(client.ID); err != nil {
			slog.Error("remove spectator from game room", err)
		}

	}
	g.ObservateurIDs = []string{}
	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
	})
	if err != nil {
		return err
	}
	c.send(gamePacket)
	_, err = c.BroadcastToRoom(payload.GameID, gamePacket)
	if err != nil {
		return err
	}
	return nil
}

func (c *Client) HandleGamePublicRequest(p *Packet) error {
	payload := MakeGamePublicPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}
	g, err := c.Manager.GameSvc.MakeGamePublic(payload.GameID)
	if err != nil {
		return err
	}
	if err != nil {
		slog.Error("get room", err)
	}
	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGameUpdatePayload(g),
	})
	if err != nil {
		return err
	}
	c.send(gamePacket)
	_, err = c.BroadcastToRoom(payload.GameID, gamePacket)
	if err != nil {
		return err
	}
	return nil
}

func (c *Client) HandleCreateTournamentRequest(p *Packet) error {
	payload := CreateTournamentPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}
	t, err := c.Manager.GameSvc.NewTournament(c.UserId, payload.WithUserIDs, payload.IsPrivate)
	if err != nil {
		return err
	}

	r := c.Manager.AddRoom(t.ID, "")

	for _, uID := range t.UserIDs {
		client, err := c.Manager.getClientByUserID(uID)
		if err != nil {
			slog.Error("get client", err)
			continue
		}
		if err := r.AddClient(client.ID); err != nil {
			slog.Error("add client to room", err)
			continue
		}
		if err := c.Manager.UserSvc.Repo.SetJoinedTournament(t.ID, client.UserId); err != nil {
			slog.Error("set joined tournament", err)
			continue
		}
		r.BroadcastJoinTournamentPackets(client, t)
	}

	return c.Manager.BroadcastObservableTournaments()
}

func (c *Client) HandleJoinTournamentRequest(p *Packet) error {
	payload := JoinTournamentPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	t, err := c.Manager.GameSvc.AddUserToTournament(payload.TournamentID, c.UserId, payload.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	r, err := c.Manager.GetRoom(payload.TournamentID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.UserSvc.Repo.SetJoinedTournament(t.ID, c.UserId); err != nil {
		return err
	}

	return r.BroadcastJoinTournamentPackets(c, t)
}

func (c *Client) HandleLeaveTournamentRequest(p *Packet) error {
	payload := LeaveTournamentPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	return c.Manager.RemoveClientFromTournament(c, payload.TournamentID)
}

func (c *Client) HandleStartTournamentRequest(p *Packet) error {
	payload := StartTournamentPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "parse request: "+err.Error())
	}
	t, err := c.Manager.GameSvc.Repo.FindTournament(payload.TournamentID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Tournament not found")
	}
	if c.UserId != t.CreatorID {
		return fiber.NewError(fiber.StatusForbidden, "You are not the tournament creator")
	}
	if t.HasStarted {
		return fiber.NewError(fiber.StatusBadRequest, "Tournament already started")
	}

	if err := c.Manager.GameSvc.StartTournament(t); err != nil {
		return err
	}

	// Broadcast start tournament packets
	tournamentPacket, err := NewTournamentUpdatePacket(TournamentUpdatePayload{
		Tournament: t,
	})
	if err != nil {
		return err
	}
	tournamentRoom, err := c.Manager.GetRoom(t.ID)
	if err != nil {
		return err
	}
	tournamentRoom.Broadcast(tournamentPacket)

	// Broadcast  joinable tournaments
	if err := c.Manager.BroadcastJoinableTournaments(); err != nil {
		slog.Error("broadcast joinable tournaments", err)
	}

	for _, ga := range t.PoolGames {
		go func(g *game.Game) {
			gameRoom := c.Manager.AddRoom(g.ID, "")
			for _, playerID := range g.UserIDs {
				player, err := c.Manager.getClientByUserID(playerID)
				if err != nil {
					slog.Error("get client", err)
					continue
				}

				if err := gameRoom.AddClient(player.ID); err != nil {
					slog.Error("add client to room", err)
					continue
				}
				if err := c.Manager.UserSvc.Repo.SetJoinedGame(g.ID, player.UserId); err != nil {
					slog.Error("set joined game", err)
					continue
				}
				if err := gameRoom.BroadcastJoinGamePackets(player, g); err != nil {
					slog.Error("broadcast join game packets", err)
					continue
				}
			}

			// Start game timer
			g.ScrabbleGame.Timer.OnTick(func() {
				slog.Info("timer tick:", "gameID", g.ID, "timeRemaining", g.ScrabbleGame.Timer.TimeRemaining())
				timerPacket, err := NewTimerUpdatePacket(TimerUpdatePayload{
					Timer: g.ScrabbleGame.Timer.TimeRemaining(),
				})
				if err != nil {
					slog.Error("failed to create timer update packet:", err)
					return
				}
				gameRoom.Broadcast(timerPacket)
			})
			g.ScrabbleGame.Timer.OnDone(func() {
				slog.Info("timer done:", "gameID", g.ID)
				g.ScrabbleGame.SkipTurn()
				gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
					Game: makeGameUpdatePayload(g),
				})
				if err != nil {
					slog.Error("failed to create Game update packet:", err)
					return
				}
				gameRoom.Broadcast(gamePacket)

				// Make bots move if applicable
				go c.Manager.MakeBotMoves(g.ID)
			})

			g.ScrabbleGame.Timer.Start()
			gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
				Game: makeGameUpdatePayload(g),
			})
			if err != nil {
				slog.Error("failed to create Game update packet:", err)
			}

			gameRoom.Broadcast(gamePacket)
		}(ga)
	}

	return nil
}

func (c *Client) HandleJoinTournamentAsObserverRequest(p *Packet) error {
	payload := JoinTournamentAsObserverPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	t, err := c.Manager.GameSvc.AddObserverToTournament(payload.TournamentID, c.UserId)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	r, err := c.Manager.GetRoom(payload.TournamentID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	{
		p, err := NewJoinedTournamentPacket(JoinedTournamentPayload{
			Tournament: t,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
		c.send(p)
	}
	return nil
}

func (c *Client) HandleLeaveTournamentAsObservateurRequest(p *Packet) error {
	payload := LeaveTournamentPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	t, err := c.Manager.GameSvc.RemoveObserverFromTournament(payload.TournamentID, c.UserId)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	r, err := c.Manager.GetRoom(payload.TournamentID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := r.RemoveClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	{
		p, err := NewLeftTournamentPacket(LeftTournamentPayload{
			TournamentID: t.ID,
		})
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
		c.send(p)
	}
	return nil
}
