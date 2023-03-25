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
	Manager   *Manager
	Conn      *websocket.Conn
	logger    *slog.Logger
	sendCh    chan *Packet
	receiveCh chan *Packet
	quitCh    chan struct{}
}

func NewClient(conn *websocket.Conn, cID string, m *Manager) *Client {
	c := &Client{
		ID:        cID,
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
	case ClientEventJoinAsObservateur:
		return c.HandleJoinAsObserverRequest(p)
	case ClientEventLeaveAsObservateur:
		return c.HandleObservateurLeaveGameRequest(p)
	case ClientEventPutMeIn:
		return c.HandlePutMeInRequest(p)
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
		// case ClientEventStartTournament:
		// return c.HandleStartTournamentRequest(p)
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
		c.ID,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	userIds := append([]string{c.ID}, payload.UserIDs...)
	for _, uID := range userIds {
		if err := c.Manager.RoomSvc.Repo.AddUser(r.ID, uID); err != nil {
			slog.Error("add user to room", err)
		}
		if err := c.Manager.UserSvc.Repo.AddJoinedRoom(r.ID, uID); err != nil {
			slog.Error("add user to room", err)
		}
		if err := r.AddClient(uID); err != nil {
			slog.Error("add client to ws room", err)
		}
		client, err := c.Manager.GetClient(uID)
		if err == nil {
			if err := r.BroadcastJoinRoomPackets(client); err != nil {
				slog.Error("broadcast join room packets", err)
			}
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
	if err := c.Manager.UserSvc.Repo.AddJoinedRoom(payload.RoomID, c.ID); err != nil {
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

	if err := c.Manager.UserSvc.Repo.RemoveJoinedRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.RoomSvc.Repo.RemoveUser(payload.RoomID, c.ID); err != nil {
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
		c.ID,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	r := c.Manager.AddRoom(dbRoom.ID, roomName)
	userIds := []string{c.ID, payload.ToID}
	for _, uID := range userIds {
		if err := c.Manager.RoomSvc.Repo.AddUser(r.ID, uID); err != nil {
			slog.Error("add user to room", err)
		}
		if err := c.Manager.UserSvc.Repo.AddJoinedDMRoom(r.ID, uID); err != nil {
			slog.Error("add user to room", err)
		}
		if err := r.AddClient(uID); err != nil {
			slog.Error("add client to ws room", err)
		}
		client, err := c.Manager.GetClient(uID)
		if err == nil {
			if err := r.BroadcastJoinDMRoomPackets(client); err != nil {
				slog.Error("broadcast join room packets", err)
			}
		}
	}

	return nil
}

func (c *Client) HandleLeaveDMRoomRequest(p *Packet) error {
	payload := LeaveDMRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	if err := c.Manager.UserSvc.Repo.RemoveJoinedDMRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.RoomSvc.Repo.RemoveUser(payload.RoomID, c.ID); err != nil {
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
		g, err = c.Manager.GameSvc.NewProtectedGame(c.ID, payload.Password)
	} else {
		g, err = c.Manager.GameSvc.NewGame(c.ID)
	}
	if err != nil {
		return err
	}

	r := c.Manager.AddRoom(g.ID, "")
	if err := r.AddClient(c.ID); err != nil {
		return err
	}
	if err := c.Manager.UserSvc.Repo.SetJoinedGame(g.ID, c.ID); err != nil {
		return err
	}

	return r.BroadcastJoinGamePackets(c, g)
}

func (c *Client) HandleJoinGameRequest(p *Packet) error {
	payload := JoinGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	g, err := c.Manager.GameSvc.AddUserToGame(payload.GameID, c.ID, payload.Password)
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
	if err := c.Manager.UserSvc.Repo.SetJoinedGame(g.ID, c.ID); err != nil {
		return err
	}

	return r.BroadcastJoinGamePackets(c, g)
}

func (c *Client) HandleJoinAsObserverRequest(p *Packet) error {
	payload := joinGameAsObserverPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	g, err := c.Manager.GameSvc.AddObserver(payload.GameID, c.ID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	if g.IsPrivateGame == true {
		return fiber.NewError(fiber.StatusUnauthorized, "game is private")
	}

	r, err := c.Manager.GetRoom(payload.GameID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
	})
	c.send(gamePacket)
	return r.BroadcastObserverJoinGamePacket(c, g)
}

func (c *Client) HandleObservateurLeaveGameRequest(p *Packet) error {
	payload := LeaveGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	_, err := c.Manager.GameSvc.RemoveObserver(payload.GameID, c.ID)
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
	if c.ID != g.CreatorID {
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
			Game: makeGamePayload(g),
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

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
	})
	if err != nil {
		return err
	}

	r.Broadcast(gamePacket)

	return nil
}

func (c *Client) HandlePlayMoveRequest(p *Packet) error {
	payload := PlayMovePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal PlayMovePayload: %w", err)
	}
	slog.Info("playMove", "payload", payload)

	g, err := c.Manager.GameSvc.ApplyPlayerMove(payload.GameID, c.ID, payload.MoveInfo)
	if err != nil {
		return err
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
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

func (c *Client) HandlePutMeInRequest(p *Packet) error {
	payload := joinGameAsObserverPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	g, err := c.Manager.GameSvc.ReplaceBotByObserver(payload.GameID, c.ID)
	if err != nil {
		return err
	}

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
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
		if err != nil {
			slog.Error("get room", err)
		}
		if err := r.RemoveClient(observateur); err != nil {
			slog.Error("remove spectator from game room", err)
		}

	}
	g.ObservateurIDs = []string{}
	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
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
		Game: makeGamePayload(g),
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
	t, err := c.Manager.GameSvc.NewTournament(c.ID, payload.WithUserIDs)
	if err != nil {
		return err
	}

	r := c.Manager.AddRoom(c.ID, "")
	if err := r.AddClient(c.ID); err != nil {
		return err
	}
	if err := c.Manager.UserSvc.Repo.SetJoinedTournament(t.ID, c.ID); err != nil {
		return err
	}

	return r.BroadcastJoinTournamentPackets(c, t)
}

func (c *Client) HandleJoinTournamentRequest(p *Packet) error {
	payload := JoinTournamentPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	t, err := c.Manager.GameSvc.AddUserToTournament(payload.TournamentID, c.ID, payload.Password)
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
	if err := c.Manager.UserSvc.Repo.SetJoinedTournament(t.ID, c.ID); err != nil {
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

// func (c *Client) HandleStartTournamentRequest(p *Packet) error {
// 	payload := StartTournamentPayload{}
// 	if err := json.Unmarshal(p.Payload, &payload); err != nil {
// 		return fiber.NewError(fiber.StatusUnprocessableEntity, "parse request: "+err.Error())
// 	}
// 	g, err := c.Manager.TournamentSvc.Repo.FindTournament(payload.TournamentID)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusNotFound, "Room not found")
// 	}
// 	if c.ID != g.CreatorID {
// 		return fiber.NewError(fiber.StatusForbidden, "You are not the room creator")
// 	}
// 	if g.ScrabbleTournament != nil {
// 		return fiber.NewError(fiber.StatusBadRequest, "Tournament already started")
// 	}

// 	if err := c.Manager.TournamentSvc.StartTournament(g); err != nil {
// 		return err
// 	}

// 	r, err := c.Manager.GetRoom(g.ID)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusBadRequest, "ws room not found: "+err.Error())
// 	}
// 	// Start Tournament timer
// 	g.ScrabbleTournament.Timer.OnTick(func() {
// 		timerPacket, err := NewTimerUpdatePacket(TimerUpdatePayload{
// 			Timer: g.ScrabbleTournament.Timer.TimeRemaining(),
// 		})
// 		if err != nil {
// 			slog.Error("failed to create timer update packet:", err)
// 			return
// 		}
// 		r.Broadcast(timerPacket)
// 	})
// 	g.ScrabbleTournament.Timer.OnDone(func() {
// 		g.ScrabbleTournament.SkipTurn()
// 		TournamentPacket, err := NewTournamentUpdatePacket(TournamentUpdatePayload{
// 			Tournament: makeTournamentPayload(g),
// 		})
// 		if err != nil {
// 			slog.Error("failed to create Tournament update packet:", err)
// 			return
// 		}
// 		r.Broadcast(TournamentPacket)

// 		// Make bots move if applicable
// 		go c.Manager.MakeBotMoves(g.ID)
// 	})
// 	g.ScrabbleTournament.Timer.Start()

// 	TournamentPacket, err := NewTournamentUpdatePacket(TournamentUpdatePayload{
// 		Tournament: makeTournamentPayload(g),
// 	})
// 	if err != nil {
// 		return err
// 	}

// 	r.Broadcast(TournamentPacket)

// 	return nil
// }
