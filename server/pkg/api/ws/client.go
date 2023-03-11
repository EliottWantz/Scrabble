package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/alphadose/haxmap"
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
		return fiber.NewError(fiber.StatusBadRequest, "room not found: "+err.Error())
	}

	if err = c.Manager.RoomSvc.AddUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to join room: "+err.Error())
	}
	if err = c.Manager.UserSvc.Repo.AddJoinedRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to add user to room"+err.Error())
	}
	if err = r.AddClient(c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to join ws room: "+err.Error())
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
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(
		uuid.NewString(),
		roomName,
		c.ID,
		payload.ToID,
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}

	// Add room to joinedRoom for both users
	err = c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, c.ID)
	if err != nil {
		return fmt.Errorf("add user to room: %w", err)
	}
	err = c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, payload.ToID)
	if err != nil {
		return fmt.Errorf("add user to room: %w", err)
	}

	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	err = r.AddClient(c.ID)
	if err != nil {
		slog.Error("error:", err)
	}
	err = r.AddClient(payload.ToID)
	if err != nil {
		slog.Error("error:", err)
	}

	return nil
}

func (c *Client) HandleCreateRoomRequest(p *Packet) error {
	payload := CreateRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	payload.UserIDs = append(payload.UserIDs, c.ID)
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(uuid.NewString(), payload.RoomName, payload.UserIDs...)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}
	slog.Info("dbRoom created", "dbRoom", dbRoom)
	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	for _, uID := range payload.UserIDs {
		if err := c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, uID); err != nil {
			slog.Error("failed to add user to room", err)
		}
		if err = r.AddClient(uID); err != nil {
			slog.Error("error:", err)
		}
	}

	return nil
}

func (c *Client) HandleCreateGameRoomRequest(p *Packet) error {
	payload := CreateGameRoomPayload{}
	if err := json.Unmarshal(p.Payload, &payload); err != nil {
		return err
	}

	payload.UserIDs = append(payload.UserIDs, c.ID)
	dbRoom, err := c.Manager.RoomSvc.CreateRoom(uuid.NewString(), "", payload.UserIDs...)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create new room: "+err.Error())
	}
	slog.Info("game room created", "room", dbRoom)
	r := c.Manager.AddRoom(dbRoom.ID, dbRoom.Name)
	for _, uID := range payload.UserIDs {
		// DONT NEED TO ADD ROOM TO USER CUZ TEMPORARY FOR THE GAME
		// if err := c.Manager.UserSvc.Repo.AddJoinedRoom(dbRoom.ID, uID); err != nil {
		// 	slog.Error("failed to add user to room", err)
		// }
		if err = r.AddClient(uID); err != nil {
			slog.Error("error:", err)
		}
	}

	err = c.Manager.UpdateJoinableGames()
	if err != nil {
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

	if err := c.Manager.RoomSvc.RemoveUser(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to remove user from room: "+err.Error())
	}
	if err := c.Manager.UserSvc.LeaveRoom(payload.RoomID, c.ID); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to remove room from user joined rooms: "+err.Error())
	}
	r, err := c.Manager.GetRoom(payload.RoomID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "room not found: "+err.Error())
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
	go func() {
		for {
			g, err := c.Manager.GameSvc.ApplyBotMove(payload.GameID)
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

			_, err = c.BroadcastToRoom(payload.GameID, gamePacket)
			if err != nil {
				slog.Error("failed to broadcast game update", err)
				break
			}

			if g.IsOver() {
				c.Manager.HandleGameOver(g)
			}
		}
	}()

	return nil
}
