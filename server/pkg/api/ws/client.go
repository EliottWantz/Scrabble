package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/alphadose/haxmap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
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
	Rooms     *haxmap.Map[string, *Room]
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
		Rooms:     haxmap.New[string, *Room](),
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
	case ClientEventJoinRoom:
		return c.HandleJoinRoomRequest(p)
	case ClientEventJoinDMRoom:
		return c.HandleJoinDMRoomRequest(p)
	case ClientEventCreateRoom:
		return c.HandleCreateRoomRequest(p)
	case ClientEventCreateGameRoom:
		return c.HandleCreateGameRoomRequest(p)
	case ClientEventLeaveRoom:
		return c.HandleLeaveRoomRequest(p)
	case ClientEventListRooms:
		return c.HandleListRoomsRequest(p)
	case ClientEventListJoinableGames:
		return c.HandleListJoinableGamesRequest(p)
	case ClientEventStartGame:
		return c.HandleStartGameRequest(p)
	case ClientEventPlayMove:
		return c.PlayMove(p)
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

func (c *Client) HandleJoinRoomRequest(p *Packet) error {
	payload := JoinRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := c.Manager.RoomSvc.AddUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to join room: "+err.Error())
	}
	if err := c.Manager.UserSvc.Repo.AddJoinedRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to add user to room"+err.Error())
	}

	if err := r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return nil
}

func (c *Client) HandleJoinDMRoomRequest(p *Packet) error {
	payload := JoinDMPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	// Create room with both users in it
	roomName := fmt.Sprintf("%s/%s", payload.Username, payload.ToUsername)
	return createRoomWithUsers(c, roomName, payload.ToID)
}

func (c *Client) HandleCreateRoomRequest(p *Packet) error {
	payload := CreateRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	return createRoomWithUsers(c, payload.RoomName, payload.UserIDs...)
}

func (c *Client) HandleCreateGameRoomRequest(p *Packet) error {
	payload := CreateGameRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	err := createGameRoomWithUsers(c, "", payload.UserIDs...)
	if err != nil {
		return err
	}

	if err := c.Manager.UpdateJoinableGames(); err != nil {
		slog.Error("send joinable games update:", err)
	}

	return nil
}

func (c *Client) HandleListRoomsRequest(p *Packet) error {
	rooms, err := c.Manager.RoomSvc.GetAllRooms()
	if err != nil {
		return fmt.Errorf("failed to get rooms: %w", err)
	}

	roomsPacket, err := NewListRoomsPacket(ListRoomsPayload{
		Rooms: rooms,
	})
	if err != nil {
		return err
	}

	c.send(roomsPacket)
	return nil
}

func (c *Client) HandleListJoinableGamesRequest(p *Packet) error {
	joinableGames, err := c.Manager.RoomSvc.GetAllJoinableGameRooms()
	if err != nil {
		return err
	}
	joinableGamesPacket, err := NewJoinableGamesPacket(ListJoinableGamesPayload{
		Games: joinableGames,
	})
	if err != nil {
		return err
	}

	c.send(joinableGamesPacket)
	return nil
}

func (c *Client) HandleLeaveRoomRequest(p *Packet) error {
	payload := LeaveRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	if payload.RoomID == c.ID {
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave your own room")
	}
	if payload.RoomID == c.Manager.GlobalRoom.ID {
		return fiber.NewError(fiber.StatusBadRequest, "You cannot leave the global room")
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := c.Manager.RoomSvc.RemoveUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err := c.Manager.UserSvc.LeaveRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	if err := r.RemoveClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to leave ws room: "+err.Error())
	}

	leftRoomPacket, err := NewLeftRoomPacket(LeftRoomPayload{
		RoomID: r.ID,
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create packet: "+err.Error())
	}

	dbRoom, ok := c.Manager.RoomSvc.HasRoom(payload.RoomID)
	if !ok {
		return nil
	}

	if c.ID == dbRoom.CreatorID && dbRoom.IsGameRoom {
		r.Broadcast(leftRoomPacket)
		if err := r.Manager.RemoveRoom(r.ID); err != nil {
			return err
		}
		if err := c.Manager.RoomSvc.Delete(r.ID); err != nil {
			return err
		}
	}
	c.send(leftRoomPacket)

	return nil
}

func (c *Client) HandleStartGameRequest(p *Packet) error {
	payload := StartGamePayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, "parse request: "+err.Error())
	}
	dbRoom, ok := c.Manager.RoomSvc.HasRoom(payload.RoomID)
	if !ok {
		return fiber.NewError(fiber.StatusNotFound, "Room not found")
	}
	if !dbRoom.IsGameRoom {
		return fiber.NewError(fiber.StatusBadRequest, "Room is not a game room")
	}
	if c.ID != dbRoom.CreatorID {
		return fiber.NewError(fiber.StatusForbidden, "You are not the room creator")
	}

	g, err := c.Manager.GameSvc.StartGame(dbRoom)
	if err != nil {
		return err
	}

	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "ws room not found: "+err.Error())
	}
	// Start game timer
	g.Timer.OnTick(func() {
		timerPacket, err := NewTimerUpdatePacket(TimerUpdatePayload{
			Timer: g.Timer.TimeRemaining(),
		})
		if err != nil {
			slog.Error("failed to create timer update packet:", err)
			return
		}
		r.Broadcast(timerPacket)
	})
	g.Timer.OnDone(func() {
		g.SkipTurn()
		gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
			Game: makeGamePayload(g),
		})
		if err != nil {
			slog.Error("failed to create timer update packet:", err)
			return
		}
		r.Broadcast(gamePacket)

		// Make bots move if applicable
		go c.Manager.MakeBotMoves(g.ID)
	})
	g.Timer.Start()

	gamePacket, err := NewGameUpdatePacket(GameUpdatePayload{
		Game: makeGamePayload(g),
	})
	if err != nil {
		return err
	}

	_, err = c.BroadcastToRoom(g.ID, gamePacket)
	if err != nil {
		return err
	}

	return nil
}

func (c *Client) PlayMove(p *Packet) error {
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

	if g.IsOver() {
		return c.Manager.HandleGameOver(g)
	}

	// Make bots move if applicable
	go c.Manager.MakeBotMoves(payload.GameID)

	return nil
}
